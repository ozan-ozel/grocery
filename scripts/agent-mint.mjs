// scripts/agent-mint.mjs
//
// Mints a single-use agent-login redeem URL for the local `npm run vercel:dev` server.
//
//   npm run agent-mint [-- --email someone@local.dev]
//
// RUN THIS YOURSELF, IN YOUR OWN TERMINAL — never through Claude Code. `api/agent-login.ts`'s mint
// endpoint requires the caller to present AGENT_LOGIN_SECRET, and Claude Code (and anything it launches)
// must never hold that secret. So this script is deliberately the only piece that ever touches it, and it
// gets it in exactly one way:
//
//   - a MASKED interactive TTY prompt (it refuses to run without a TTY, so it cannot be driven from a pipe
//     or from Claude Code's tool runner);
//   - it does NOT read .env.local, any other file, the environment, or command-line arguments for it;
//   - the secret is sent only as the `x-agent-login-secret` header to http://localhost:3000 (hard-coded;
//     redirects are never followed, and the name is resolved through a loopback-only lookup, so it cannot be
//     sent through ngrok or any remote host);
//   - it is never printed, logged, written to a file or put on the clipboard.
//
// Output: ONLY the redeem URL on stdout (prompts and messages go to stderr). The redeem URL is itself a
// bearer credential — single-use, valid for 10 minutes — so paste it to the agent, use it once, and don't
// share it. Failures print a fixed message with an HTTP status at most: never the request headers, the mint
// response, or any error text from the server.
//
// The `*@local.dev` email restriction is a script-side safety guard only. It is NOT an authentication
// boundary: the endpoint itself will mint for any email to a caller that knows the secret.

import http from "node:http";
import dns from "node:dns";
import { pathToFileURL } from "node:url";

export const MINT_HOST = "localhost";
export const MINT_PORT = 3000;
export const DEFAULT_EMAIL = "agent@local.dev";
const EMAIL_RE = /^[a-z0-9._+-]+@local\.dev$/i;
const MAX_RESPONSE_BYTES = 64 * 1024;

export function isAllowedEmail(email) {
  return typeof email === "string" && EMAIL_RE.test(email);
}

export function isLoopbackAddress(address) {
  return (
    address === "::1" ||
    /^127\.\d+\.\d+\.\d+$/.test(address) ||
    /^::ffff:127\.\d+\.\d+\.\d+$/i.test(address)
  );
}

// Resolve the hostname ourselves and refuse anything that is not loopback, so a tampered hosts file or DNS
// answer can never redirect the secret off this machine.
function loopbackOnlyLookup(hostname, options, callback) {
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) return callback(err);
    const list = Array.isArray(address) ? address : [{ address, family }];
    if (list.length === 0 || !list.every((a) => isLoopbackAddress(a.address))) {
      return callback(new Error("non-loopback address"));
    }
    return callback(null, address, family);
  });
}

// The only shape of URL this script will ever print: the local redeem endpoint plus a 64-hex token.
export function extractRedeemUrl(bodyText, port = MINT_PORT) {
  try {
    const parsed = JSON.parse(bodyText);
    const url = parsed && typeof parsed.redeemUrl === "string" ? parsed.redeemUrl : "";
    const re = new RegExp(
      `^http://localhost:${port}/api/agent-login\\?_action=redeem&token=[0-9a-f]{64}$`,
    );
    return re.test(url) ? url : null;
  } catch {
    return null;
  }
}

// Masked prompt. `stdin` must be a TTY (raw mode); every accepted character echoes as "*" and nothing else.
export function readMasked({ stdin, out, prompt }) {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
      reject(new Error("no TTY"));
      return;
    }
    const chars = [];
    let finished = false;

    const finish = (err) => {
      if (finished) return;
      finished = true;
      stdin.removeListener("data", onData);
      try {
        stdin.setRawMode(false);
      } catch {
        /* ignore */
      }
      stdin.pause();
      out.write("\n");
      if (err) reject(err);
      else resolve(chars.join(""));
    };

    const onData = (chunk) => {
      // Drop terminal escape sequences (arrow keys etc.) instead of treating them as input.
      const text = chunk.toString("utf8").replace(/\u001b\[[0-9;]*[A-Za-z~]/g, "");
      for (const ch of text) {
        if (ch === "\r" || ch === "\n") return finish();
        if (ch === "\u0003") return finish(new Error("cancelled")); // Ctrl-C
        if (ch === "\u0004") {
          // Ctrl-D: submit if something was typed, otherwise cancel.
          return chars.length > 0 ? finish() : finish(new Error("cancelled"));
        }
        if (ch === "\u007f" || ch === "\b") {
          if (chars.length > 0) {
            chars.pop();
            out.write("\b \b");
          }
          continue;
        }
        if (ch < " ") continue; // any other control character
        chars.push(ch);
        out.write("*");
      }
    };

    out.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("data", onData);
  });
}

// POST the mint request. Resolves to { ok: true, redeemUrl } or { ok: false, status?, reason? } — the result
// never carries a response body, header or error text.
export function mint({ secret, email, port = MINT_PORT, timeoutMs = 10_000 }) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ email });
    let settled = false;
    const done = (value) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };
    let req;
    try {
      req = http.request(
        {
          hostname: MINT_HOST, // constant on purpose: never taken from arguments, env or config
          port,
          path: "/api/agent-login?_action=mint",
          method: "POST",
          lookup: loopbackOnlyLookup,
          headers: {
            "content-type": "application/json",
            "content-length": Buffer.byteLength(body),
            "x-agent-login-secret": secret,
          },
        },
        (res) => {
          const parts = [];
          let size = 0;
          res.on("data", (d) => {
            size += d.length;
            if (size <= MAX_RESPONSE_BYTES) parts.push(d);
          });
          res.on("end", () => {
            // Redirects are never followed by node:http; a 3xx (or anything but 201) is just a failure.
            if (res.statusCode !== 201) return done({ ok: false, status: res.statusCode });
            const redeemUrl = extractRedeemUrl(Buffer.concat(parts).toString("utf8"), port);
            return redeemUrl ? done({ ok: true, redeemUrl }) : done({ ok: false, reason: "bad-response" });
          });
          res.on("error", () => done({ ok: false, reason: "network" }));
        },
      );
    } catch {
      return done({ ok: false, reason: "network" });
    }
    req.setTimeout(timeoutMs, () => {
      done({ ok: false, reason: "timeout" });
      req.destroy();
    });
    req.on("error", () => done({ ok: false, reason: "network" }));
    req.end(body);
  });
}

function parseArgs(argv) {
  let email = DEFAULT_EMAIL;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--email") email = argv[++i] ?? "";
    else if (a.startsWith("--email=")) email = a.slice("--email=".length);
    else return { error: "unknown argument" };
  }
  return { email };
}

const err = (msg) => process.stderr.write(msg + "\n");

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.error) {
    err(`agent-mint: ${parsed.error}. Usage: npm run agent-mint [-- --email <name>@local.dev]`);
    return 2;
  }
  if (!isAllowedEmail(parsed.email)) {
    err(
      "agent-mint: refusing — the email must be a *@local.dev address (default agent@local.dev). " +
        "This is a script-side guard against minting a session for a real account; it is not an auth boundary.",
    );
    return 2;
  }
  if (!process.stdin.isTTY || !process.stderr.isTTY) {
    err(
      "agent-mint: needs an interactive terminal — it asks for the secret with a masked prompt. " +
        "Run it yourself in your own terminal (not through Claude Code, a pipe or a redirect).",
    );
    return 2;
  }

  let secret;
  try {
    secret = await readMasked({
      stdin: process.stdin,
      out: process.stderr,
      prompt: "Agent-login secret (input hidden): ",
    });
  } catch {
    err("agent-mint: cancelled.");
    return 130;
  }
  if (!secret) {
    err("agent-mint: empty input, nothing sent.");
    return 2;
  }

  const result = await mint({ secret, email: parsed.email });
  secret = ""; // best effort; the string itself cannot be zeroed in JS

  if (!result.ok) {
    if (result.status !== undefined) {
      err(
        `agent-mint: mint failed (HTTP ${result.status}). The local server must be up with the agent-login ` +
          "endpoint enabled (npm run agent-session -- up) and the secret must match the one it started with.",
      );
    } else if (result.reason === "timeout") {
      err("agent-mint: no answer from http://localhost:3000 (timeout).");
    } else if (result.reason === "bad-response") {
      err("agent-mint: the server answered, but not with a valid redeem URL. Nothing printed.");
    } else {
      err("agent-mint: could not reach http://localhost:3000 (is the local server up?).");
    }
    return 1;
  }

  err("Redeem URL below is a single-use bearer credential (valid 10 minutes). Paste it to the agent once:");
  process.stdout.write(result.redeemUrl + "\n");
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().then(
    (code) => process.exit(code),
    () => {
      err("agent-mint: unexpected error.");
      process.exit(1);
    },
  );
}

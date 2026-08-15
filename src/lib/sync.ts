import type { State } from "./store";

type Envelope = { version: number; state: State | null };

export type SyncStatus = "synced" | "syncing" | "offline";

type Options = {
  getState: () => State;
  setState: (s: State) => void;
  tenantId: string;
  baseUrl?: string;
  onStatusChange?: (status: SyncStatus) => void;
};

const POLL_MS = 15_000;
const PUSH_DEBOUNCE_MS = 500;
const BACKOFF_START_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;

export function createSync({
  getState,
  setState,
  tenantId,
  baseUrl = "",
  onStatusChange,
}: Options) {
  const url = `${baseUrl}/api/state?tenant=${encodeURIComponent(tenantId)}`;

  let started = false;
  let lastSentSerialized = "";
  let pushTimer: number | undefined;
  let pollTimer: number | undefined;
  let backoff = BACKOFF_START_MS;
  let inflight: Promise<void> | null = null;
  let activeRequests = 0;

  function reportStatus() {
    if (!navigator.onLine) return onStatusChange?.("offline");
    if (activeRequests > 0) return onStatusChange?.("syncing");
    return onStatusChange?.("synced");
  }

  async function pull() {
    activeRequests++;
    reportStatus();
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const { version, state } = (await res.json()) as Envelope;
      // Empty server (first-ever GET): nothing to adopt, let the next push seed it.
      if (state == null) return;
      const local = getState();
      if (local.version !== version) {
        setState({ ...state, version });
        lastSentSerialized = serialize(state);
      }
      backoff = BACKOFF_START_MS;
    } catch {
      // Network hiccup; poller will try again.
    } finally {
      activeRequests--;
      reportStatus();
    }
  }

  async function push() {
    if (inflight) return inflight;
    const state = getState();
    const body = serialize(state);
    // Nothing new since the last successful send.
    if (body === lastSentSerialized) return;

    activeRequests++;
    reportStatus();
    inflight = (async () => {
      try {
        const res = await fetch(url, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ version: state.version ?? 0, state }),
        });
        if (res.status === 409) {
          const { version, state: server } = (await res.json()) as Envelope;
          if (server != null) {
            setState({ ...server, version });
            lastSentSerialized = serialize(server);
          }
          backoff = BACKOFF_START_MS;
          return;
        }
        if (!res.ok) throw new Error(`push failed: ${res.status}`);
        const { version } = (await res.json()) as { version: number };
        // Apply the new version without stomping edits made while in flight.
        const current = getState();
        setState({ ...current, version });
        lastSentSerialized = body;
        backoff = BACKOFF_START_MS;
      } catch {
        // Retry with backoff. Any state change during the wait will re-schedule.
        scheduleRetry();
      } finally {
        inflight = null;
        activeRequests--;
        reportStatus();
      }
    })();
    return inflight;
  }

  function scheduleRetry() {
    window.clearTimeout(pushTimer);
    pushTimer = window.setTimeout(push, backoff);
    backoff = Math.min(backoff * 2, BACKOFF_MAX_MS);
  }

  function requestPush() {
    if (!started) return;
    window.clearTimeout(pushTimer);
    pushTimer = window.setTimeout(push, PUSH_DEBOUNCE_MS);
  }

  function onVisible() {
    if (document.visibilityState === "visible") pull();
  }

  return {
    start() {
      if (started) return;
      started = true;
      reportStatus();
      pull();
      pollTimer = window.setInterval(pull, POLL_MS);
      document.addEventListener("visibilitychange", onVisible);
      window.addEventListener("online", reportStatus);
      window.addEventListener("offline", reportStatus);
    },
    stop() {
      started = false;
      window.clearTimeout(pushTimer);
      window.clearInterval(pollTimer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", reportStatus);
      window.removeEventListener("offline", reportStatus);
    },
    notifyChange: requestPush,
    pushNow: push,
  };
}

// Serialize without the version so a version-only change doesn't re-trigger a push.
function serialize(s: State): string {
  const { version: _v, ...rest } = s;
  return JSON.stringify(rest);
}

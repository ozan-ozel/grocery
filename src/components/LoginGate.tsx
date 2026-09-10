import { Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onSignIn: () => void;
};

// Netlify was retired (NUT-52); this notice is now stale and can be
// removed once nobody's still landing on the old Netlify domain via a
// bookmark or cached link.
const NEW_APP_URL = "https://grocery-five-ecru.vercel.app";

function isRunningOnVercel(): boolean {
  return typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app");
}

// Set by api/auth-callback.ts's error redirect (see
// docs/superpowers/specs/2026-09-10-backend-only-oauth-design.md) when the
// user declines Google consent or the OAuth exchange fails.
function hasAuthError(): boolean {
  return (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("auth_error")
  );
}

export function LoginGate({ onSignIn }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[30rem] flex-col items-center justify-center gap-6 px-5">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Giriş yap</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Devam etmek için Google hesabınla giriş yap.
        </p>
      </div>
      <Button type="button" onClick={onSignIn} className="w-full">
        <Chrome className="size-4" />
        Google ile giriş yap
      </Button>
      {hasAuthError() && (
        <p className="text-center text-xs text-destructive">
          Giriş başarısız oldu. Lütfen tekrar dene.
        </p>
      )}
      {!isRunningOnVercel() && (
        <p className="text-center text-xs text-muted-foreground">
          Bu adresi yakında kapatıyoruz. Yeni adresimiz:{" "}
          <a
            href={NEW_APP_URL}
            className="font-medium text-foreground underline underline-offset-2"
          >
            {NEW_APP_URL.replace("https://", "")}
          </a>
        </p>
      )}
    </div>
  );
}

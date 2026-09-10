import { Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onSignIn: () => void;
};

// This app is deployed to both Netlify and Vercel in parallel during the
// NUT-52 migration (see docs/SESSION_CHECKPOINT.md); Netlify is slated to be
// retired. Only the Netlify-served build should point people at the new
// address, so the notice is hidden when already running on the Vercel domain
// rather than gated by a build-time env var — both platforms build the exact
// same bundle, so a runtime check is the only thing that actually differs.
const NEW_APP_URL = "https://grocery-five-ecru.vercel.app";

function isRunningOnVercel(): boolean {
  return typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app");
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

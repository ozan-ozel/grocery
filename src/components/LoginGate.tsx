import { Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onSignIn: () => void;
};

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
    </div>
  );
}

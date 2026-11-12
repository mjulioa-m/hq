"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SceneThumb } from "@/components/scene/SceneHero";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setPending(false);
    if (!res || res.error) {
      setError("Correo o clave incorrectos.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="relative grid min-h-screen place-items-center px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <SceneThumb scene="login" className="absolute inset-0" />
      <div className="absolute inset-0 bg-black/25" />
      <form onSubmit={submit} className="glass-strong relative z-10 w-full max-w-sm space-y-4 p-6">
        <div>
          <p className="text-xs tracking-[0.2em] text-ink-3 uppercase">HQ</p>
          <h1 className="display mt-1 text-4xl">Entra a tu panel</h1>
        </div>
        <label className="block text-sm">
          Correo
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" required />
        </label>
        <label className="block text-sm">
          Clave
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" required />
        </label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </main>
  );
}

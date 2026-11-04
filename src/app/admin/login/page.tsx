"use client";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
      setLoading(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="grain relative flex min-h-svh items-center justify-center overflow-hidden bg-navy-900 p-4">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold-500/15 blur-3xl" />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm rounded-2xl border border-gold-500/40 bg-ivory p-8 shadow-2xl"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-navy-900 text-gold-300">
          <Lock className="size-5" />
        </span>
        <h1 className="mt-5 text-center font-display text-3xl">Wedding Admin</h1>
        <p className="mt-1 text-center text-sm text-navy-700/70">Thinidu &amp; Chenaji</p>

        <label className="mt-8 block">
          <span className="mb-1.5 block text-xs tracking-[0.15em] text-navy-700 uppercase">Email</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-navy-900/15 bg-white px-4 py-3 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30 focus:outline-none" />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs tracking-[0.15em] text-navy-700 uppercase">Password</span>
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-navy-900/15 bg-white px-4 py-3 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30 focus:outline-none" />
        </label>

        {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}

        <button disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 py-3.5 text-sm font-medium tracking-[0.18em] text-ivory uppercase transition hover:bg-navy-800 disabled:opacity-60">
          {loading && <Loader2 className="size-4 animate-spin" />} Sign in
        </button>
      </motion.form>
    </main>
  );
}

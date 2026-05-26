// app/(auth)/register/page.tsx — minimal stub, same look as login
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  return (
    <div className="w-full max-w-[380px] bg-panel border border-border rounded-xl p-7 shadow-md">
      <h1 className="text-xl font-semibold tracking-tight m-0 mb-1">Create your account</h1>
      <p className="text-fg-muted text-[13px] m-0 mb-5">Start documenting your architecture in minutes.</p>
      <form className="flex flex-col gap-3 mb-4" onSubmit={(e) => { e.preventDefault(); router.push("/dashboard"); }}>
        <div className="grid grid-cols-2 gap-2">
          <input className="bg-panel border border-border rounded-sm py-2 px-3 text-[13.5px] outline-none focus:border-accent" placeholder="First name" />
          <input className="bg-panel border border-border rounded-sm py-2 px-3 text-[13.5px] outline-none focus:border-accent" placeholder="Last name" />
        </div>
        <input type="email" className="bg-panel border border-border rounded-sm py-2 px-3 text-[13.5px] outline-none focus:border-accent" placeholder="Email" />
        <input type="password" className="bg-panel border border-border rounded-sm py-2 px-3 text-[13.5px] outline-none focus:border-accent" placeholder="Password" />
        <Button type="submit" variant="primary" className="h-9 mt-1">Create account <ArrowRight size={14} /></Button>
      </form>
      <div className="text-[12.5px] text-fg-muted text-center mt-3">
        Already have an account? <Link href="/login" className="text-accent font-medium">Sign in</Link>
      </div>
    </div>
  );
}

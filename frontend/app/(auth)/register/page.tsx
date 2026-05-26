"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password")
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((state) => state.register);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (values: FormValues): Promise<void> => {
    try {
      setLoading(true);
      setErrorMessage(null);
      await registerUser({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName
      });
      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[380px] bg-panel border border-border rounded-xl p-7 shadow-md">
      <h1 className="text-xl font-semibold tracking-tight m-0 mb-1">Create your account</h1>
      <p className="text-fg-muted text-[13px] m-0 mb-5">Start documenting your architecture in minutes.</p>
      <form className="flex flex-col gap-3 mb-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-2">
          <input
            {...register("firstName")}
            className="bg-panel border border-border rounded-sm py-2 px-3 text-[13.5px] outline-none focus:border-accent"
            placeholder="First name"
          />
          <input
            {...register("lastName")}
            className="bg-panel border border-border rounded-sm py-2 px-3 text-[13.5px] outline-none focus:border-accent"
            placeholder="Last name"
          />
        </div>
        {(errors.firstName || errors.lastName) && (
          <div className="text-[11px] text-danger">{errors.firstName?.message ?? errors.lastName?.message}</div>
        )}

        <input
          {...register("email")}
          type="email"
          className="bg-panel border border-border rounded-sm py-2 px-3 text-[13.5px] outline-none focus:border-accent"
          placeholder="Email"
        />
        {errors.email && <div className="text-[11px] text-danger">{errors.email.message}</div>}

        <input
          {...register("password")}
          type="password"
          className="bg-panel border border-border rounded-sm py-2 px-3 text-[13.5px] outline-none focus:border-accent"
          placeholder="Password"
        />
        {errors.password && <div className="text-[11px] text-danger">{errors.password.message}</div>}

        <input
          {...register("confirmPassword")}
          type="password"
          className="bg-panel border border-border rounded-sm py-2 px-3 text-[13.5px] outline-none focus:border-accent"
          placeholder="Confirm password"
        />
        {errors.confirmPassword && <div className="text-[11px] text-danger">{errors.confirmPassword.message}</div>}

        {errorMessage && <div className="text-[12px] text-danger">{errorMessage}</div>}

        <Button type="submit" variant="primary" className="h-9 mt-1" disabled={loading}>
          {loading ? "Creating account..." : "Create account"} <ArrowRight size={14} />
        </Button>
      </form>
      <div className="text-[12.5px] text-fg-muted text-center mt-3">
        Already have an account? <Link href="/login" className="text-accent font-medium">Sign in</Link>
      </div>
    </div>
  );
}
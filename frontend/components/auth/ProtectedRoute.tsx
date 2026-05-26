"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, restoreToken } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      await restoreToken();
      if (isMounted) {
        setIsReady(true);
      }
    };

    void init();

    return () => {
      isMounted = false;
    };
  }, [restoreToken]);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isReady, router]);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="min-h-[40vh] grid place-items-center text-fg-muted text-sm">
        Loading workspace...
      </div>
    );
  }

  return <>{children}</>;
}
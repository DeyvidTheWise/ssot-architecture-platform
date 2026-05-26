// app/(app)/layout.tsx — authenticated workspace
import { AppShell } from "@/components/shell/app-shell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

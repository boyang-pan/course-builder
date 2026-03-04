import { QueryProvider } from "@/components/layout/query-provider";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          {/* Top bar */}
          <header className="h-12 border-b border-border flex items-center justify-end gap-2 px-4 shrink-0">
            <ThemeToggle />
            <UserMenu />
          </header>
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </QueryProvider>
  );
}

"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { EditAuthProvider } from "@/components/edit-auth-provider";

const getPageName = (pathname: string): string => {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/departments")) return "Departments";
  if (pathname.startsWith("/equipment")) return "Equipment";
  if (pathname.startsWith("/maintenance")) return "Maintenance";
  if (pathname.startsWith("/reports")) return "Reports";
  if (pathname.startsWith("/users")) return "Users";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Dashboard";
};

function AppHeader({ pageName }: { pageName: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <span className="font-semibold">{pageName}</span>
    </header>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageName = getPageName(pathname || "/");

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <EditAuthProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <AppHeader pageName={pageName} />
              <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
            </SidebarInset>
          </SidebarProvider>
        </EditAuthProvider>
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  );
}

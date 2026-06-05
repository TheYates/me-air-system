"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  Package,
  Wrench,
  Building2,
  Calendar,
  Settings,
  ChevronDown,
  FileText,
  Lock,
  Unlock,
} from "lucide-react";
import { useEditAuth } from "@/components/edit-auth-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  { href: "/", label: "Dashboard", icon: TrendingUp },
  { href: "/equipment", label: "Equipment", icon: Package },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/departments", label: "Departments", icon: Building2 },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/reports", label: "Reports", icon: FileText },
];

function formatCountdown(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getEditAccessLabel(
  isUnlocked: boolean,
  secondsRemaining: number | null
) {
  if (!isUnlocked) return "Locked — view only";
  if (secondsRemaining !== null && secondsRemaining <= 60) {
    return `Locks in ${formatCountdown(secondsRemaining)}`;
  }
  return "Unlocked — editing enabled";
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { isUnlocked, secondsRemaining, openPinDialog, lock } = useEditAuth();
  const editAccessLabel = getEditAccessLabel(isUnlocked, secondsRemaining);
  const showCountdown =
    isUnlocked && secondsRemaining !== null && secondsRemaining <= 60;

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary dark:bg-primary-foreground text-primary-foreground dark:text-primary">
                  <Wrench className="size-6" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Medical Asset</span>
                  <span className="text-xs text-muted-foreground">
                    Registry System
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={editAccessLabel}
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div
                    className={`flex aspect-square size-8 items-center justify-center rounded-lg text-sm font-medium ${
                      isUnlocked
                        ? "bg-green-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isUnlocked ? (
                      <Unlock className="size-4" />
                    ) : (
                      <Lock className="size-4" />
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {isUnlocked ? "Editing enabled" : "View only"}
                    </span>
                    <span
                      className={`truncate text-xs ${
                        showCountdown
                          ? "font-medium text-amber-600 dark:text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {showCountdown
                        ? `Locks in ${formatCountdown(secondsRemaining!)}`
                        : isUnlocked
                          ? "Unlocked"
                          : "Locked"}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem
                  onClick={() => {
                    if (isUnlocked) {
                      void lock();
                    } else {
                      openPinDialog();
                    }
                  }}
                >
                  {isUnlocked ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      <span>Lock editing</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      <span>Unlock with PIN</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="flex items-center justify-between w-full cursor-pointer">
                    <span>Theme</span>
                    <ThemeToggle />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Bot,
  BookOpen,
  GitBranch,
  MessageSquare,
  BarChart3,
  FlaskConical,
  Shield,
  Globe,
  Settings,
  Headphones,
  Menu,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Agents", href: "/agents", icon: Bot },
  { name: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { name: "Conversations", href: "/conversations", icon: GitBranch },
  { name: "Live Chat", href: "/conversations?status=active", icon: MessageSquare },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "A/B Testing", href: "/ab-testing", icon: FlaskConical },
  { name: "Quality Assurance", href: "/quality-assurance", icon: Shield },
  { name: "Channels", href: "/channels", icon: Globe },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 rounded-lg border border-gray-200 bg-white p-2 shadow-sm lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <Headphones className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">ConciergeAI</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href.split("?")[0]);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn("sidebar-link", isActive && "active")}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-700">
              AU
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Acme Corp</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

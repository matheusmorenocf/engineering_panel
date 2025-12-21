"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Cpu } from "lucide-react";

import { NavItem } from "./NavItem";
import { DASHBOARD_ROUTES } from "@/lib/routes-config";
import { useAuth } from "@/hooks/useAuth";
import { canSeeRoute } from "@/utils/acl";
import UserMenu from "@/components/shared/UserMenu";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // ✅ PROTEÇÃO: enquanto carrega, mostra apenas rotas sem permissão
  const visibleRoutes = loading
    ? DASHBOARD_ROUTES.filter((route) => route.permission === null)
    : DASHBOARD_ROUTES.filter((route) =>
        canSeeRoute(route.permission, user?.permissions, user?.is_superuser)
      );

  return (
    <aside
      className={`
        border-r border-border bg-surface flex flex-col fixed h-full z-50
        transition-all duration-300
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Header */}
      <div
        className={`p-6 flex items-center mb-4 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 border border-secondary rounded-lg flex items-center justify-center">
            <Cpu size={18} className="text-secondary" />
          </div>

          {!isCollapsed && (
            <span className="font-black text-primary italic tracking-tighter text-lg">
              ENG.V3
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            p-1 hover:bg-bg rounded-full text-text-tertiary
            transition-transform duration-300 cursor-pointer
            ${
              isCollapsed
                ? "rotate-180 mt-4 absolute -right-3 bg-surface border border-border shadow-sm"
                : ""
            }
          `}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {visibleRoutes.map((route) => (
          <NavItem
            key={route.href}
            icon={route.icon}
            label={route.label}
            href={route.href}
            isCollapsed={isCollapsed}
            active={pathname === route.href}
          />
        ))}
      </nav>

      {/* User Menu */}
      <UserMenu isCollapsed={isCollapsed} />
    </aside>
  );
}

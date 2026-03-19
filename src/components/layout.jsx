// src/components/layout.jsx
import React from "react";
import { Link, useLocation } from "wouter";
import { useLogout, useGetCurrentUser } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  LogOut,
  Menu,
  Package,
  ShieldAlert,
  UserCog,
} from "lucide-react";
import { Button } from "./ui-shared";

function AppLayout({ children, role }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { data: user } = useGetCurrentUser();
  const logoutMut = useLogout();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logoutMut.mutate(void 0, {
      onSuccess: () => {
        window.location.href = "/login";
      },
      onError: () => {
        localStorage.removeItem("token");
        queryClient.setQueryData(["currentUser"], null);
        window.location.href = "/login";
      },
    });
  };

  // ✅ FIX: Use ~ prefix so wouter v3 treats these as absolute paths
  // (layout is rendered INSIDE nested route contexts like /admin, /client, /operations)
  const allNavs = {
    admin: [
      { label: "Dashboard", href: "~/admin", icon: LayoutDashboard },
      { label: "Clients", href: "~/admin/clients", icon: Building2 },
      { label: "Users", href: "~/admin/users", icon: Users },
      { label: "Products", href: "~/admin/products", icon: Package },
      { label: "All Orders", href: "~/admin/orders", icon: FileText },
    ],
    client: [
      { label: "Dashboard", href: "~/client", icon: LayoutDashboard },
      { label: "My Orders", href: "~/client/orders", icon: FileText },
      {
        label: "Team",
        href: "~/client/team",
        icon: UserCog,
        adminOnly: true,
      },
    ],
    operations: [
      { label: "Dashboard", href: "~/operations", icon: LayoutDashboard },
      { label: "Order Queue", href: "~/operations/orders", icon: FileText },
    ],
  };

  const isClientAdmin = user?.role === "client_admin";
  const currentNav = (allNavs[role] || []).filter((item) => {
    if (item.adminOnly && role === "client") return isClientAdmin;
    return true;
  });

  // For active link detection: useLocation() returns path relative to nesting base
  // So inside /operations context, location would be "/" or "/orders" or "/orders/1"
  // We need to compare against the path WITHOUT the ~ prefix and WITHOUT the role prefix
  const isActiveLink = (href) => {
    // Strip ~ prefix and role prefix to get the relative path for comparison
    const clean = href.replace(/^~\//, "/");
    const rolePrefix = `/${role}`;
    const relativePath = clean.startsWith(rolePrefix)
      ? clean.slice(rolePrefix.length) || "/"
      : clean;

    if (relativePath === "/") {
      return location === "/" || location === "";
    }
    return location === relativePath || location.startsWith(relativePath + "/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-950 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <ShieldAlert className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-white font-bold text-lg tracking-tight">
            DiligencePro
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {currentNav.map((item) => {
            const isActive = isActiveLink(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div
                  className={`
                  flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer
                  ${isActive ? "bg-blue-600/10 text-blue-400" : "hover:bg-slate-800/50 hover:text-white"}
                `}
                >
                  <item.icon
                    className={`w-5 h-5 mr-3 ${isActive ? "text-blue-400" : "text-slate-500"}`}
                  />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="px-4 py-3 bg-slate-900 rounded-xl mb-3">
            <p className="text-sm font-medium text-white truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.clientCompanyName || "Internal Team"}
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={handleLogout}
            isLoading={logoutMut.isPending}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 sm:px-8 justify-between lg:justify-end sticky top-0 z-30">
          <button
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            {user?.clientCompanyName && (
              <span className="text-sm text-slate-500 hidden sm:block">
                {user.clientCompanyName}
              </span>
            )}
            <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {user?.role
                ?.replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}

export { AppLayout };
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, BarChart3, PlusCircle, LayoutDashboard, Home } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      label: "New Project",
      href: "/dashboard/create",
      icon: <PlusCircle className="w-5 h-5" />
    },
    {
      label: "Evaluation Ledger",
      href: "/dashboard/evaluation",
      icon: <BarChart3 className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-64 glass border-r border-white/5 hidden md:flex flex-col justify-between py-6 px-4 shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 px-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30">
              <Bot className="w-5 h-5 text-violet-400" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              InsightAgent
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-violet-600/20 border border-violet-500/20 text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Link */}
        <Link
          href="/"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-200"
        >
          <Home className="w-5 h-5" />
          <span>Exit Dashboard</span>
        </Link>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden glass border-b border-white/5 py-4 px-6 flex justify-between items-center shrink-0">
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none" 
            onClick={() => window.location.reload()}
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30">
              <Bot className="w-5 h-5 text-violet-400" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">InsightAgent</span>
          </div>
          <div className="flex items-center space-x-3">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={`p-2 rounded-lg ${pathname === item.href ? 'text-violet-400 bg-white/5' : 'text-slate-400'}`}
              >
                {item.icon}
              </Link>
            ))}
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}

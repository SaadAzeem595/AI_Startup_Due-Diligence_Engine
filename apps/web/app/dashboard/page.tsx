"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Search, Calendar, Globe, AlertCircle, RefreshCw, BadgeAlert, BadgeCheck, MoreVertical, Trash2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  website_url?: string;
  description?: string;
  status: string; // created, analyzing, completed, failed
  created_at: string;
}

export default function DashboardOverview() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Mock projects in case the API is offline
  const mockProjects: Project[] = [
    {
      id: "mock-acme",
      name: "Acme AI",
      website_url: "https://acmeai.io",
      description: "AI Chief of Staff tracking conversational project commitments and predicting sprint timeline risks.",
      status: "completed",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
    },
    {
      id: "mock-fintech",
      name: "PayShield",
      website_url: "https://payshield.com",
      description: "Machine learning fraud defense platform for credit card verification pipelines.",
      status: "analyzing",
      created_at: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
    },
    {
      id: "mock-health",
      name: "MedSync",
      website_url: "https://medsync-health.org",
      description: "Distributed medical records platform utilizing zero-knowledge compliance protocols.",
      status: "created",
      created_at: new Date(Date.now() - 3600000 * 48).toISOString() // 2 days ago
    }
  ];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/projects");
      if (!res.ok) throw new Error("API issue");
      const data = await res.json();
      setProjects(data);
      setIsOffline(false);
    } catch (e) {
      console.warn("Backend API offline. Operating in Local Mock Mode.", e);
      setProjects(mockProjects);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    setOpenMenuId(null);
    if (isOffline) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      return;
    }
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/projects/${projectId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
      }
    } catch (e) {
      console.error("Failed to delete project", e);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Startup Portfolio</h1>
          <p className="text-slate-400 mt-1">Review, execute, and inspect multi-agent investment due diligence reports.</p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <button 
            onClick={fetchProjects}
            className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
            title="Refresh database"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <Link
            href="/dashboard/create"
            className="flex-1 md:flex-none inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-violet-500/10 border border-violet-400/20 transition-all hover:scale-[1.01]"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Startup</span>
          </Link>
        </div>
      </div>

      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="glass border-amber-500/20 bg-amber-950/5 px-6 py-4 rounded-2xl flex items-center space-x-4 text-amber-300">
          <AlertCircle className="w-6 h-6 shrink-0 text-amber-400" />
          <div className="text-sm">
            <span className="font-bold">Offline Demo Mode:</span> The FastAPI backend server is not running on <code className="bg-amber-950/20 px-1.5 py-0.5 rounded text-amber-200">localhost:8000</code>. We are displaying interactive demo projects. Run the backend command to connect live database pipelines.
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search startups by name or core features..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/5 focus:border-violet-500/30 focus:ring-1 focus:ring-violet-500/30 text-white placeholder-slate-400 outline-none transition-all"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400">Loading portfolio index...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center border-white/5 space-y-4">
          <Search className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Startups Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">Create a new project by entering a website link and document uploads to populate the list.</p>
          <Link
            href="/dashboard/create"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 font-medium text-sm transition-all"
          >
            Create Your First Analysis
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="glass p-6 rounded-2xl border-white/5 glass-hover flex flex-col justify-between space-y-6 relative cursor-pointer"
              onClick={() => router.push(`/dashboard/projects/${project.id}`)}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-lg text-white leading-tight">{project.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      project.status === "completed" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : project.status === "analyzing"
                        ? "bg-violet-500/10 text-violet-400 border border-violet-500/20 animate-pulse"
                        : project.status === "failed"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-slate-500/10 text-slate-300 border border-slate-500/20"
                    }`}>
                      {project.status}
                    </span>
                    {/* 3-dot menu */}
                    <div className="relative" ref={openMenuId === project.id ? menuRef : null}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === project.id ? null : project.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all"
                        title="Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === project.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-slate-800 border border-white/10 shadow-2xl shadow-black/40 z-50 overflow-hidden animate-fade-in">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(project.id);
                            }}
                            className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                  {project.description || "No description provided. Add files to generate deep learning context summaries."}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 shrink-0 text-slate-500" />
                  <span className="truncate max-w-[120px]">{project.website_url || "No link"}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 shrink-0 text-slate-500" />
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

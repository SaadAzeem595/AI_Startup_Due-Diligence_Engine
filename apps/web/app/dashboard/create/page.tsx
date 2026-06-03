"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe, FileText, Video, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CreateProject() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  
  const [pitchFile, setPitchFile] = useState<File | null>(null);
  const [financialsFile, setFinancialsFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError("Project name is required.");
      return;
    }
    setError("");
    setLoading(true);
    
    try {
      // 1. Try connecting to backend
      const projRes = await fetch("http://127.0.0.1:8000/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, website_url: website, description })
      });
      
      if (!projRes.ok) throw new Error("Could not create project on backend");
      const project = await projRes.json();
      
      // 2. Upload files if present
      const uploadFile = async (file: File, type: string) => {
        const formData = new FormData();
        formData.append("file", file);
        await fetch(`http://127.0.0.1:8000/api/v1/projects/${project.id}/documents?file_type=${type}`, {
          method: "POST",
          body: formData
        });
      };
      
      if (pitchFile) await uploadFile(pitchFile, "pdf");
      if (financialsFile) await uploadFile(financialsFile, "financial");
      if (transcriptFile) await uploadFile(transcriptFile, "pitch_transcript");
      
      // 3. Start analysis
      await fetch(`http://127.0.0.1:8000/api/v1/projects/${project.id}/analysis/start`, {
        method: "POST"
      });
      
      router.push(`/dashboard/projects/${project.id}`);
    } catch (err) {
      console.warn("Backend API offline. Simulating project creation offline.", err);
      // Simulate offline create
      setTimeout(() => {
        router.push("/dashboard/projects/mock-acme?mock_started=true");
      }, 1500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Back button */}
      <div className="flex items-center space-x-2">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-200 transition-colors flex items-center space-x-1.5 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Analyze New Startup</h1>
        <p className="text-slate-400">Enter a website URL and upload supporting documents to deploy the due diligence agent cluster.</p>
      </div>

      {error && (
        <div className="glass border-rose-500/20 bg-rose-950/5 px-6 py-4 rounded-xl flex items-center space-x-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core fields */}
        <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
          <h3 className="text-lg font-bold text-white mb-2">Startup Details</h3>
          
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300 font-medium">Company Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Acme AI"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 focus:border-violet-500/30 text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-slate-300 font-medium">Website URL</label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="url"
                placeholder="https://acmeai.io"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 focus:border-violet-500/30 text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-slate-300 font-medium">Core Description</label>
            <textarea
              placeholder="Provide a brief summary of what the company does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 focus:border-violet-500/30 text-white placeholder-slate-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Upload fields */}
        <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
          <h3 className="text-lg font-bold text-white mb-2">Document Ingestion</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Pitch Deck */}
            <div className="border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 relative hover:bg-white/5 transition-all">
              <FileText className="w-8 h-8 text-violet-400" />
              <div className="text-xs">
                <span className="font-bold text-slate-300">Pitch Deck (PDF)</span>
                <p className="text-slate-500 mt-1">{pitchFile ? pitchFile.name : "Select or drag file"}</p>
              </div>
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setPitchFile(e.target.files ? e.target.files[0] : null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Financial Statements */}
            <div className="border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 relative hover:bg-white/5 transition-all">
              <FileText className="w-8 h-8 text-cyan-400" />
              <div className="text-xs">
                <span className="font-bold text-slate-300">Financial Statements</span>
                <p className="text-slate-500 mt-1">{financialsFile ? financialsFile.name : "Select or drag file"}</p>
              </div>
              <input 
                type="file"
                accept=".pdf,.csv,.txt"
                onChange={(e) => setFinancialsFile(e.target.files ? e.target.files[0] : null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            
            {/* Zoom Audio/Video or Written Pitch Transcript */}
            <div className="border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 relative hover:bg-white/5 transition-all md:col-span-2">
              <Video className="w-8 h-8 text-rose-400" />
              <div className="text-xs">
                <span className="font-bold text-slate-300">Zoom pitch recording or pitch meeting transcript</span>
                <p className="text-slate-500 mt-1">{transcriptFile ? transcriptFile.name : "Upload founder conversation files"}</p>
              </div>
              <input 
                type="file"
                accept=".txt,.mp3,.mp4,.wav,.m4a"
                onChange={(e) => setTranscriptFile(e.target.files ? e.target.files[0] : null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold tracking-wide shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/20 border border-violet-400/20 transition-all flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Bootstrapping Agents...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span>Deploy Analysis Agents</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

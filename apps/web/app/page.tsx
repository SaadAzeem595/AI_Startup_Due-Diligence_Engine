"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Bot, Shield, Cpu, Activity, TrendingUp, CheckCircle, Video, FileText } from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const { isSignedIn, isLoaded } = useAuth();

  const features = [
    {
      icon: <Bot className="w-6 h-6 text-violet-400" />,
      title: "Multi-Agent Orchestrator",
      desc: "Specialized agents scan websites, analyze documents, verify competitors, and inspect financials."
    },
    {
      icon: <Video className="w-6 h-6 text-cyan-400" />,
      title: "Pitch & Meeting Ingestion",
      desc: "Upload founder pitch audio/video. We transcribe and extract verbal timeline promises."
    },
    {
      icon: <Shield className="w-6 h-6 text-rose-400" />,
      title: "Commitment Delay Tracking",
      desc: "Cross-references spoken founder commitments with documentation history to calculate operational risk."
    },
    {
      icon: <Cpu className="w-6 h-6 text-emerald-400" />,
      title: "RAG Document Retrieval",
      desc: "Ask the built-in chatbot questions fully grounded in the uploaded pitch materials."
    },
    {
      icon: <Activity className="w-6 h-6 text-amber-400" />,
      title: "LLMOps Evaluation Ledger",
      desc: "Track latency, input/output tokens, cost estimates, and prompt metrics in real-time."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-indigo-400" />,
      title: "Professional Due Diligence",
      desc: "Generates institutional-grade reports with SWOT analysis, competitor matrices, and investment scoring."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none animate-fade-in">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div 
          className="flex items-center space-x-3 cursor-pointer select-none" 
          onClick={() => window.location.reload()}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30">
            <Bot className="w-6 h-6 text-violet-400" />
            <div className="absolute inset-0 rounded-xl bg-violet-500/20 blur-sm animate-pulse"></div>
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            InsightAgent
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {isLoaded && isSignedIn ? (
            <>
              <Link 
                href="/dashboard" 
                className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-all bg-white/5 border border-white/10 rounded-xl hover:bg-white/10"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <Link 
                href="/sign-in" 
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-all"
              >
                Sign In
              </Link>
              <Link 
                href="/sign-up" 
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 border border-violet-400/20 transition-all duration-300"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-1/4 w-[350px] h-[350px] rounded-full bg-cyan-600/10 blur-[80px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-8 relative z-10 animate-slide-up">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs text-violet-300 font-medium">
            <span>🚀</span>
            <span>Beyond Simple Transcription & Summaries</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            The AI Chief of Staff For{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300">
              Startup Due Diligence
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Most meeting tools only summarize. InsightAgent acts as an analyst: extracting founder commitments from pitch audio, auditing timelines, analyzing financials, scanning tech stacks, and forecasting investment risks automatically.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isLoaded && isSignedIn ? (
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-medium bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:opacity-95 text-white shadow-xl shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02]"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link 
                href="/sign-up" 
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-medium bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:opacity-95 text-white shadow-xl shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02]"
              >
                <span>Get Started (Free)</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            <Link
              href="#pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl font-medium border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all duration-300"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison section: "Otter vs InsightAgent" */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-white">
          Why InsightAgent Outperforms Traditional AI Assistants
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-2xl border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-slate-600 h-full"></div>
            <h3 className="text-xl font-bold text-slate-300 mb-4">Otter.ai / Fireflies.ai</h3>
            <ul className="space-y-4 text-slate-400">
              <li className="flex items-start space-x-3">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Simple text transcripts and action lists</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-rose-500 font-bold">✕</span>
                <span>No historical context across meetings</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Cannot audit startup websites, decks, or financials</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-rose-500 font-bold">✕</span>
                <span>"John promised API by Friday" is just text</span>
              </li>
            </ul>
          </div>
          <div className="glass p-8 rounded-2xl border-violet-500/20 bg-violet-950/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-violet-500 to-indigo-500 h-full"></div>
            <h3 className="text-xl font-bold text-white mb-4">InsightAgent (SaaS Chief of Staff)</h3>
            <ul className="space-y-4 text-slate-200 font-medium">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Multi-agent audits across URL scraping + Pitch files</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Conversational commitment history database</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Interactive SWOT and automated financial analysis</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-violet-200">
                  "John promised API by Friday. Similar promises delayed 3x before. Risk: Medium."
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto w-full border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-white">Full-Suite AI Analysis Engine</h2>
          <p className="text-slate-400">Our decentralized specialized agents work together to audit and assess startup projects in minutes.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className={`glass p-6 rounded-2xl glass-hover ${hoveredFeature === idx ? 'border-violet-500/40 bg-violet-950/5' : 'border-white/5'}`}
              onMouseEnter={() => setHoveredFeature(idx)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit border border-white/5">{feat.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 md:px-12 max-w-5xl mx-auto w-full border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-white">Simple, Transparent Pricing</h2>
          <p className="text-slate-400">Scale your due diligence capabilities. Start free, upgrade for enterprise reports.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className="glass p-6 rounded-2xl border-white/5 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Free</h3>
              <p className="text-xs text-slate-400 mt-1">For side projects & testers</p>
              <div className="my-6">
                <span className="text-3xl font-extrabold text-white">$0</span>
                <span className="text-sm text-slate-400 font-normal"> / month</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center space-x-2">
                  <span className="text-violet-400 font-bold">✓</span>
                  <span>3 Startup projects</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-violet-400 font-bold">✓</span>
                  <span>10 Multi-agent runs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-violet-400 font-bold">✓</span>
                  <span>Basic reports</span>
                </li>
              </ul>
            </div>
            <Link 
              href="/dashboard" 
              className="mt-8 w-full text-center py-2.5 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 text-white transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="glass p-6 rounded-2xl border-violet-500/30 bg-violet-950/5 relative flex flex-col justify-between scale-[1.02] shadow-xl shadow-violet-950/20">
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-violet-600 to-indigo-600 border border-violet-400/20 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pro Analyst</h3>
              <p className="text-xs text-violet-300 mt-1">For active angel investors</p>
              <div className="my-6">
                <span className="text-3xl font-extrabold text-white">$29</span>
                <span className="text-sm text-slate-400 font-normal"> / month</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center space-x-2">
                  <span className="text-violet-400 font-bold">✓</span>
                  <span>Unlimited projects</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-violet-400 font-bold">✓</span>
                  <span>RAG Grounded AI Chat</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-violet-400 font-bold">✓</span>
                  <span>PDF Pitch Deck Upload</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-violet-400 font-bold">✓</span>
                  <span>Competitor matrices</span>
                </li>
              </ul>
            </div>
            <Link 
              href="/dashboard" 
              className="mt-8 w-full text-center py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border border-violet-400/20 transition-all shadow-md shadow-violet-500/10"
            >
              Upgrade to Pro
            </Link>
          </div>

          {/* Team Tier */}
          <div className="glass p-6 rounded-2xl border-white/5 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Team / VC</h3>
              <p className="text-xs text-slate-400 mt-1">For professional venture funds</p>
              <div className="my-6">
                <span className="text-3xl font-extrabold text-white">$99</span>
                <span className="text-sm text-slate-400 font-normal"> / month</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center space-x-2">
                  <span className="text-violet-400 font-bold">✓</span>
                  <span>Shared workspace workspaces</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-violet-400 font-bold">✓</span>
                  <span>Custom scoring formulas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-violet-400 font-bold">✓</span>
                  <span>Compliance API limits</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-violet-400 font-bold">✓</span>
                  <span>SOC2 reports exports</span>
                </li>
              </ul>
            </div>
            <button className="mt-8 w-full text-center py-2.5 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 text-white transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 py-8 text-center text-xs text-slate-500">
        © 2026 InsightAgent Inc. Portfolio project illustrating LLMOps, RAG, and Multi-Agent SaaS. All rights reserved.
      </footer>
    </div>
  );
}

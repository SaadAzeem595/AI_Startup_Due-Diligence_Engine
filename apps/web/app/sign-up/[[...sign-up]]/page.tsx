import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Bot } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative p-6 overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-[350px] h-[350px] rounded-full bg-cyan-600/10 blur-[80px] pointer-events-none"></div>
      
      {/* Auth Card Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo Header */}
        <Link 
          href="/" 
          className="flex items-center space-x-3 cursor-pointer select-none mb-6 hover:opacity-90 transition-opacity"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30">
            <Bot className="w-6 h-6 text-violet-400" />
            <div className="absolute inset-0 rounded-xl bg-violet-500/20 blur-sm animate-pulse"></div>
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            InsightAgent
          </span>
        </Link>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-sm text-slate-400">Sign up to get institutional-grade startup intelligence</p>
        </div>
        
        <div className="w-full glass border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl flex justify-center bg-white/5 backdrop-blur-md">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "shadow-none bg-transparent border-0 p-0 text-white w-full",
                card: "bg-transparent text-white w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all rounded-xl",
                socialButtonsBlockButtonText: "text-white font-medium",
                formButtonPrimary: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 py-3 rounded-xl font-medium shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all",
                formFieldLabel: "text-slate-300 font-medium text-xs mb-2",
                formFieldInput: "bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all",
                footerActionText: "text-slate-400 text-sm",
                footerActionLink: "text-violet-400 hover:text-violet-300 font-semibold transition-all",
                identityPreviewText: "text-white",
                identityPreviewEditButtonIcon: "text-violet-400",
                dividerLine: "bg-white/10",
                dividerText: "text-slate-400",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { BarChart3, Clock, DollarSign, MessageSquareCode, ShieldAlert, Star, RefreshCw, CheckCircle2 } from "lucide-react";

interface AIInteractionLog {
  id: string;
  project_name: string;
  prompt_version: string;
  model_used: string;
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  cost_estimate: number;
  user_rating?: number;
  user_comment?: string;
  created_at: string;
}

export default function EvaluationDashboard() {
  const [logs, setLogs] = useState<AIInteractionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [ratingInput, setRatingInput] = useState<{ [key: string]: { rating: number; comment: string; success?: boolean } }>({});

  const mockLogs: AIInteractionLog[] = [
    {
      id: "log-1",
      project_name: "Acme AI",
      prompt_version: "1.2",
      model_used: "gemini-1.5-flash",
      latency_ms: 1250,
      input_tokens: 300,
      output_tokens: 450,
      cost_estimate: 0.000206,
      user_rating: 5,
      user_comment: "Very fast and highly accurate features extraction.",
      created_at: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: "log-2",
      project_name: "Acme AI",
      prompt_version: "1.2",
      model_used: "gemini-1.5-flash",
      latency_ms: 1720,
      input_tokens: 1125,
      output_tokens: 680,
      cost_estimate: 0.000395,
      user_rating: 4,
      user_comment: "Decent stack detection, caught Next.js and Pinecone.",
      created_at: new Date(Date.now() - 1200000).toISOString()
    },
    {
      id: "log-3",
      project_name: "Acme AI",
      prompt_version: "2.0",
      model_used: "gemini-1.5-pro",
      latency_ms: 2480,
      input_tokens: 4500,
      output_tokens: 720,
      cost_estimate: 0.002715,
      created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: "log-4",
      project_name: "Acme AI",
      prompt_version: "1.2",
      model_used: "gemini-1.5-flash",
      latency_ms: 1490,
      input_tokens: 950,
      output_tokens: 380,
      cost_estimate: 0.000261,
      created_at: new Date(Date.now() - 2400000).toISOString()
    },
    {
      id: "log-5",
      project_name: "Acme AI",
      prompt_version: "1.2",
      model_used: "gemini-1.5-flash",
      latency_ms: 1100,
      input_tokens: 880,
      output_tokens: 520,
      cost_estimate: 0.000305,
      created_at: new Date(Date.now() - 3000000).toISOString()
    }
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/evaluations");
      if (!res.ok) throw new Error("Offline");
      const data = await res.json();
      setLogs(data.length > 0 ? data : mockLogs);
      setIsOffline(false);
    } catch (e) {
      console.warn("Backend API offline. Using mock interaction logs.", e);
      setLogs(mockLogs);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRate = async (logId: string) => {
    const data = ratingInput[logId];
    if (!data || !data.rating) return;
    
    try {
      if (!isOffline) {
        await fetch(`http://127.0.0.1:8000/api/v1/evaluations/${logId}/rate?rating=${data.rating}&comment=${encodeURIComponent(data.comment || "")}`, {
          method: "POST"
        });
      }
      
      setRatingInput(prev => ({
        ...prev,
        [logId]: { ...prev[logId], success: true }
      }));
      
      // Update local state log list
      setLogs(prev => prev.map(log => 
        log.id === logId 
          ? { ...log, user_rating: data.rating, user_comment: data.comment } 
          : log
      ));
    } catch (e) {
      console.error("Failed writing feedback rating", e);
    }
  };

  const updateRatingField = (logId: string, rating: number) => {
    setRatingInput(prev => ({
      ...prev,
      [logId]: { ...(prev[logId] || { comment: "" }), rating }
    }));
  };

  const updateCommentField = (logId: string, comment: string) => {
    setRatingInput(prev => ({
      ...prev,
      [logId]: { ...(prev[logId] || { rating: 0 }), comment }
    }));
  };

  // Summarize metrics
  const totalCalls = logs.length;
  const avgLatency = totalCalls > 0 ? Math.round(logs.reduce((acc, curr) => acc + curr.latency_ms, 0) / totalCalls) : 0;
  const totalCost = logs.reduce((acc, curr) => acc + curr.cost_estimate, 0);
  const totalTokens = logs.reduce((acc, curr) => acc + curr.input_tokens + curr.output_tokens, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">LLMOps Evaluation Ledger</h1>
          <p className="text-slate-400 mt-1">Audit token consumption, request latency, API spending, and user quality ratings.</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="glass p-5 rounded-2xl border-white/5 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <MessageSquareCode className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">LLM Queries</span>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">{totalCalls}</h3>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border-white/5 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Avg Latency</span>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">{avgLatency} ms</h3>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border-white/5 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Accumulated Cost</span>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">${totalCost.toFixed(5)}</h3>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border-white/5 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Token Index</span>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">{totalTokens.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass rounded-2xl border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-white/2">
          <h3 className="font-bold text-white text-base">LLM Interaction Records</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold text-xs uppercase bg-white/1">
                <th className="py-3 px-6">Startup / Run</th>
                <th className="py-3 px-6">Model Used</th>
                <th className="py-3 px-6">Latency</th>
                <th className="py-3 px-6">Tokens</th>
                <th className="py-3 px-6">Est. Cost</th>
                <th className="py-3 px-6">Quality Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 text-xs">
              {logs.map((log) => {
                const ratingState = ratingInput[log.id] || { rating: 0, comment: "" };
                
                return (
                  <tr key={log.id} className="hover:bg-white/1 transition-all">
                    <td className="py-4 px-6">
                      <span className="font-bold text-white block">{log.project_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">v{log.prompt_version}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 font-mono text-[10px]">
                        {log.model_used}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium">{log.latency_ms} ms</td>
                    <td className="py-4 px-6 text-slate-400 font-mono">
                      in: {log.input_tokens} | out: {log.output_tokens}
                    </td>
                    <td className="py-4 px-6 font-semibold text-rose-400">
                      ${log.cost_estimate.toFixed(6)}
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      {log.user_rating ? (
                        /* Display Existing Feedback */
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-yellow-400">
                            {[...Array(log.user_rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                          {log.user_comment && (
                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                              "{log.user_comment}"
                            </p>
                          )}
                        </div>
                      ) : ratingState.success ? (
                        /* Submitted Success State */
                        <div className="flex items-center space-x-1.5 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[10px] font-bold">Feedback Sent</span>
                        </div>
                      ) : (
                        /* Rating Input panel */
                        <div className="space-y-2">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => updateRatingField(log.id, star)}
                                className={`text-slate-500 hover:text-yellow-400 transition-colors ${
                                  ratingState.rating >= star ? 'text-yellow-400' : ''
                                }`}
                              >
                                <Star className={`w-4 h-4 ${ratingState.rating >= star ? 'fill-current' : ''}`} />
                              </button>
                            ))}
                          </div>
                          {ratingState.rating > 0 && (
                            <div className="flex space-x-1.5 items-center">
                              <input
                                type="text"
                                placeholder="Add optional comments..."
                                value={ratingState.comment}
                                onChange={(e) => updateCommentField(log.id, e.target.value)}
                                className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-white outline-none focus:border-violet-500/30 w-36 transition-all"
                              />
                              <button
                                onClick={() => handleRate(log.id)}
                                className="px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold text-[9px] uppercase tracking-wider transition-colors"
                              >
                                Send
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

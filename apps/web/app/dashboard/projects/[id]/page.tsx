"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Send, CheckCircle2, Loader2, Sparkles, MessageSquare, AlertTriangle, Play, HelpCircle } from "lucide-react";

interface DocumentDetail {
  id: string;
  filename: string;
  file_type: string;
}

interface ProjectDetail {
  id: string;
  name: string;
  website_url?: string;
  description?: string;
  status: string;
  created_at: string;
  documents: DocumentDetail[];
  has_report: boolean;
}

interface Citation {
  id: number;
  document_id: string;
  filename: string;
  text: string;
  page: number;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  source?: string;
  citations?: Citation[];
}

interface StepLog {
  id: string;
  agent_name: string;
  step_name: string;
  status: string; // pending, running, completed, failed
  logs?: string;
}

interface ReportDetail {
  id: string;
  markdown_content: string;
  investment_score: number;
  swot_analysis?: {
    strengths: string[];
    weaknesses: string[];
  };
  risks?: Array<{
    category: string;
    score: number;
    details: string;
  }>;
  competitors?: Array<{
    name: string;
    pricing: string;
    strengths: string;
    weaknesses: string;
    moat_vs_acme: string;
  }>;
  commitments?: Array<{
    speaker: string;
    promise: string;
    deadline: string;
    status: string;
    history: {
      matching_promises_count: number;
      previous_delays_count: number;
      delay_profile: string;
    };
  }>;
}

function ProjectDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const mockStarted = searchParams?.get("mock_started") === "true";

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [steps, setSteps] = useState<StepLog[]>([]);
  const [report, setReport] = useState<ReportDetail | null>(null);
  
  const [chatMessage, setChatMessage] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    { sender: "ai", text: "Hello! I am your due diligence analyst. Ask me any question about this startup based on the ingested documents." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [activeTab, setActiveTab] = useState<"report" | "chat">("report");
  const [leftPaneTab, setLeftPaneTab] = useState<"report" | "viewer">("report");
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [documentContent, setDocumentContent] = useState("");
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const mockDoc1Text = `ACME AI - SEED PITCH DECK

[Page 1]
Executive Summary:
Acme AI is building the first Chief of Staff AI tool for engineering teams.
We connect developer discussions in Slack/Zoom to real-time GitHub commits to identify hidden sprint risks.

[Page 2]
The Team:
- Sarah Chen, CEO & Co-founder: Former Product Manager at Otter.ai. Expert in meeting transcription and product lifecycle management.
- Alex Mercer, CTO & Co-founder: Ex-DeepMind Senior Engineer. Built state-of-the-art vector embedding engines and predictive scheduling pipelines.

[Page 3]
The Ask:
Acme AI is seeking a $1.5M Seed round at a $12M valuation cap to hire engineers and expand vector database capabilities.
Current burn rate is $45,000 per month with a runway of 14 months remaining.

[Page 4]
Marketing & Metrics:
- LTV to CAC stands at 4.2x with an estimated Customer Acquisition Cost (CAC) of $350.
- Targeting high-growth software engineering departments.
- The pricing model is structured into Free ($0), Pro ($29/mo), and Custom/Team tiers targeting software engineering departments.

[Page 5]
Competition & Moats:
We compete directly with Otter.ai and Fireflies.ai.
However, Acme AI has a key technological moat: it leverages custom commit timeline integrations to track developer commitment delays and forecast sprint completion dates.
Competes directly with Otter.ai and Fireflies.ai, but leverages custom commit timeline integrations to track developer commitment delays and forecast sprint completion dates.

[Page 6]
Product Roadmap:
- Q3 2026: Launch of core API integration dashboard.
- Q4 2026: Automatic Slack risk reports.

[Page 7]
Key Risks:
Key risks include high competitive density (rating: 70/100) and founder operational delays from CEO Sarah Chen (delays recorded on 2 promises, rating: 60/100).
`;

  const mockDoc2Text = `ZOOM PITCH MEETING TRANSCRIPT

[Page 1]
Sarah Chen: Hey everyone, thank you for joining the meeting today. I want to talk about our progress.
Investor: Thanks Sarah. Let's talk about execution risks. Have there been any delays in past development timelines?
Sarah Chen: Yes, to be transparent, we did face some operational bottlenecks early on. Founder Sarah Chen (former Otter.ai PM) shows past delays of 2-3 weeks on core API milestones. But we have solved this by hiring Alex Mercer to streamline our deployment pipelines.
Alex Mercer: That's right. I'm focusing on reducing Pinecone lookup query delays below 50ms, which is scheduled to be completed by July 15, 2026.
`;

  const loadDocumentContent = async (docId: string, docName: string) => {
    if (docId === "mock-doc-1" || docName === "acme_pitch_deck.pdf") {
      setDocumentContent(mockDoc1Text);
      setDocError(null);
      return;
    }
    if (docId === "mock-doc-2" || docName === "zoom_pitch_transcript.txt") {
      setDocumentContent(mockDoc2Text);
      setDocError(null);
      return;
    }
    
    setDocLoading(true);
    setDocError(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/projects/${id}/documents/${docId}/text`);
      if (!res.ok) throw new Error("Failed to fetch document text");
      const data = await res.json();
      setDocumentContent(data.text_content);
    } catch (err: any) {
      console.error(err);
      setDocError("Could not retrieve document text content.");
    } finally {
      setDocLoading(false);
    }
  };

  const handleFootnoteClick = async (citation: Citation) => {
    setSelectedCitation(citation);
    setLeftPaneTab("viewer");
    await loadDocumentContent(citation.document_id, citation.filename);
  };

  const renderTextWithFootnotes = (text: string, citations?: Citation[]) => {
    if (!citations || citations.length === 0) return text;
    
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/^\[(\d+)\]$/);
      if (match) {
        const citationId = parseInt(match[1], 10);
        const citation = citations.find(c => c.id === citationId);
        if (citation) {
          return (
            <button
              key={index}
              onClick={() => handleFootnoteClick(citation)}
              className="inline-flex items-center justify-center font-bold text-violet-400 hover:text-violet-300 mx-0.5 px-1 py-0.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded text-[10px] transition-all cursor-pointer align-super"
              title={`Source: ${citation.filename} (Page ${citation.page})`}
              type="button"
            >
              [{citationId}]
            </button>
          );
        }
      }
      return part;
    });
  };

  const highlightText = (fullText: string, searchSnippet: string) => {
    if (!searchSnippet) return <pre className="whitespace-pre-wrap font-sans text-slate-300 text-sm leading-relaxed">{fullText}</pre>;
    
    const cleanSnippet = searchSnippet.replace(/\s+/g, ' ').trim();
    const snippetWords = cleanSnippet.split(' ');
    
    let startIndex = -1;
    let endIndex = -1;
    
    // 1. Try exact match first
    const exactIndex = fullText.indexOf(searchSnippet);
    if (exactIndex !== -1) {
      startIndex = exactIndex;
      endIndex = exactIndex + searchSnippet.length;
    } else {
      const exactIndexLower = fullText.toLowerCase().indexOf(searchSnippet.toLowerCase());
      if (exactIndexLower !== -1) {
        startIndex = exactIndexLower;
        endIndex = exactIndexLower + searchSnippet.length;
      }
    }
    
    // 2. Word-anchor fuzzy match for space-normalized / indented documents
    if (startIndex === -1 && snippetWords.length > 0) {
      const startAnchor = snippetWords.slice(0, Math.min(3, snippetWords.length)).join(' ');
      const startAnchorIdx = fullText.toLowerCase().indexOf(startAnchor.toLowerCase());
      if (startAnchorIdx !== -1) {
        startIndex = startAnchorIdx;
        
        let wordCount = 0;
        let currentPos = startIndex;
        
        // Skip initial spaces
        while (currentPos < fullText.length && /\s/.test(fullText[currentPos])) {
          currentPos++;
        }
        
        while (currentPos < fullText.length && wordCount < snippetWords.length) {
          // Find end of current word (next space or separator)
          while (currentPos < fullText.length && !/\s/.test(fullText[currentPos])) {
            currentPos++;
          }
          wordCount++;
          // Skip spaces to start of next word
          while (currentPos < fullText.length && /\s/.test(fullText[currentPos])) {
            currentPos++;
          }
        }
        endIndex = currentPos;
      }
    }
    
    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
      return <pre className="whitespace-pre-wrap font-sans text-slate-300 text-sm leading-relaxed">{fullText}</pre>;
    }
    
    const before = fullText.substring(0, startIndex);
    const match = fullText.substring(startIndex, endIndex);
    const after = fullText.substring(endIndex);
    
    return (
      <pre className="whitespace-pre-wrap font-sans text-slate-300 text-sm leading-relaxed">
        {before}
        <mark id="citation-highlight" className="bg-yellow-500/30 text-yellow-100 font-semibold px-1.5 py-0.5 rounded border border-yellow-500/40 shadow-sm shadow-yellow-500/20 animate-pulse">
          {match}
        </mark>
        {after}
      </pre>
    );
  };

  useEffect(() => {
    if (leftPaneTab === "viewer" && selectedCitation && documentContent) {
      const timer = setTimeout(() => {
        const element = document.getElementById("citation-highlight");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [leftPaneTab, selectedCitation, documentContent]);

  // Offline mock project metadata
  const mockProject: ProjectDetail = {
    id: "mock-acme",
    name: "Acme AI",
    website_url: "https://acmeai.io",
    description: "AI Chief of Staff tracking conversational project commitments and predicting sprint timeline risks.",
    status: mockStarted ? "analyzing" : "completed",
    created_at: new Date().toISOString(),
    documents: [
      { id: "doc-1", filename: "acme_pitch_deck.pdf", file_type: "pdf" },
      { id: "doc-2", filename: "zoom_pitch_transcript.txt", file_type: "pitch_transcript" }
    ],
    has_report: !mockStarted
  };

  const mockStepsList: StepLog[] = [
    { id: "s1", agent_name: "PlannerAgent", step_name: "Creating execution plan", status: "pending" },
    { id: "s2", agent_name: "WebsiteAgent", step_name: "Scraping features & pricing details", status: "pending" },
    { id: "s3", agent_name: "TechnologyAgent", step_name: "Scanning server-side technology signature signals", status: "pending" },
    { id: "s4", agent_name: "PDFAgent", step_name: "Parsing roadmap and core innovations", status: "pending" },
    { id: "s5", agent_name: "PitchTranscriptAgent", step_name: "Tracking founder verbal meeting promises & historical delays", status: "pending" },
    { id: "s6", agent_name: "CompetitorAgent", step_name: "Validating market competitor differentiations", status: "pending" },
    { id: "s7", agent_name: "MarketAgent", step_name: "Extracting TAM / SAM metrics", status: "pending" },
    { id: "s8", agent_name: "FinancialAgent", step_name: "Estimating burn rate & year project projections", status: "pending" },
    { id: "s9", agent_name: "RiskAgent", step_name: "Classifying operational threat scores", status: "pending" },
    { id: "s10", agent_name: "InvestmentAgent", step_name: "Generating investment committee report", status: "pending" }
  ];

  const mockReport: ReportDetail = {
    id: "rep-acme",
    markdown_content: "",
    investment_score: 83,
    swot_analysis: {
      strengths: [
        "First-mover advantage in spoken developer commitment tracking.",
        "Founder Sarah Chen possesses outstanding domain experience at Otter.ai.",
        "Healthy LTV to CAC ratio of 4.2x with moderate $350 acquisition cost."
      ],
      weaknesses: [
        "Sarah Chen shows past delays of 2-3 weeks on core API milestones.",
        "Highly competitive meeting transcription field (Otter, Fireflies, MS Copilot).",
        "Dependency on external LLM cost structures."
      ]
    },
    risks: [
      { category: "Technology Risk", score: 30, details: "Low risk. Leverages modern Next.js/FastAPI components." },
      { category: "Financial Risk", score: 55, details: "Moderate. 14 months of runway requires Seed funding execution." },
      { category: "Founder Risk", score: 60, details: "Moderate. CEO Sarah Chen shows operational delays in meeting records." },
      { category: "Competition Risk", score: 70, details: "High. Congested productivity app landscape." }
    ],
    competitors: [
      {
        name: "Otter.ai",
        pricing: "$10-$20/user/mo",
        strengths: "Real-time sync, large market share.",
        weaknesses: "No commitment history verification.",
        moat_vs_acme: "InsightAgent connects direct task graphs to code commits."
      },
      {
        name: "Fireflies.ai",
        pricing: "$19-$29/user/mo",
        strengths: "Integrations, nice dashboard.",
        weaknesses: "No persistent cross-meeting intelligence.",
        moat_vs_acme: "InsightAgent tracks operational commitments across months."
      }
    ],
    commitments: [
      {
        speaker: "Sarah Chen",
        promise: "Launch core API connector by June 30, 2026",
        deadline: "2026-06-30",
        status: "Delayed",
        history: {
          matching_promises_count: 3,
          previous_delays_count: 2,
          delay_profile: "High Risk. Historical delays of 2-3 weeks due to backend bottlenecks."
        }
      },
      {
        speaker: "Alex Mercer",
        promise: "Reduce Pinecone lookup query delay below 50ms",
        deadline: "2026-07-15",
        status: "On Track",
        history: {
          matching_promises_count: 1,
          previous_delays_count: 0,
          delay_profile: "Low Risk. Highly reliable engineering leader."
        }
      }
    ]
  };

  const loadData = async () => {
    try {
      // Fetch project details
      const projRes = await fetch(`http://127.0.0.1:8000/api/v1/projects/${id}`);
      if (!projRes.ok) throw new Error("Offline or failed");
      const projectData = await projRes.json();
      setProject(projectData);
      
      // Fetch steps
      const stepsRes = await fetch(`http://127.0.0.1:8000/api/v1/projects/${id}/steps`);
      const stepsData = await stepsRes.json();
      setSteps(stepsData.length > 0 ? stepsData : mockStepsList);
      
      // Fetch report
      if (projectData.status === "completed") {
        const repRes = await fetch(`http://127.0.0.1:8000/api/v1/projects/${id}/report`);
        const repData = await repRes.json();
        setReport(repData);
      }
      setIsOffline(false);
    } catch (e) {
      console.warn("Backend API offline or failed. Operating in offline demo mode.", e);
      setIsOffline(true);
      setProject(mockProject);
      
      if (mockStarted) {
        setSteps(mockStepsList);
      } else {
        const completedSteps = mockStepsList.map(s => ({ ...s, status: "completed" }));
        setSteps(completedSteps);
        setReport(mockReport);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Offline Simulation Logic (if user clicks trigger or mock_started=true query is passed)
  useEffect(() => {
    if (loading || !project || project.status !== "analyzing" || !isOffline) return;
    
    let currentStepIdx = 0;
    const interval = setInterval(() => {
      setSteps(prevSteps => {
        const nextSteps = [...prevSteps];
        // Mark previous completed
        if (currentStepIdx > 0) {
          nextSteps[currentStepIdx - 1].status = "completed";
        }
        // Mark current running
        if (currentStepIdx < nextSteps.length) {
          nextSteps[currentStepIdx].status = "running";
          currentStepIdx++;
        } else {
          clearInterval(interval);
          // Set project to complete
          setProject(prev => prev ? { ...prev, status: "completed", has_report: true } : null);
          setReport(mockReport);
        }
        return nextSteps;
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, [loading, project?.status, isOffline]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatMessage("");
    setChatLog(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatLoading(true);
    
    // Auto scroll chat
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      if (isOffline) {
        // Simulate local response
        setTimeout(() => {
          let ans = "Based on the project documents: Acme AI is seeking a $1.5M Seed round at a $12M valuation cap [1] to hire engineers and expand vector database capabilities [2].";
          let citations: Citation[] = [
            {
              id: 1,
              document_id: "mock-doc-1",
              filename: "acme_pitch_deck.pdf",
              text: "Acme AI is seeking a $1.5M Seed round at a $12M valuation cap to hire engineers and expand vector database capabilities.",
              page: 3
            },
            {
              id: 2,
              document_id: "mock-doc-2",
              filename: "zoom_pitch_transcript.txt",
              text: "Focusing on Seed Round Funding of $1.5M at a $12M valuation cap.",
              page: 1
            }
          ];
          const userMsgLower = userMsg.toLowerCase();
          if (userMsgLower.includes("competitor") || userMsgLower.includes("compete")) {
            ans = "The platform detects competitors like Otter.ai and Fireflies.ai [1]. Acme seeks to differentiate by integrating persistent sprint tracking and commitment audits [2] directly from founder pitch transcripts.";
            citations = [
              {
                id: 1,
                document_id: "mock-doc-1",
                filename: "acme_pitch_deck.pdf",
                text: "Competes directly with Otter.ai and Fireflies.ai, but leverages custom commit timeline integrations to track developer commitment delays and forecast sprint completion dates.",
                page: 5
              },
              {
                id: 2,
                document_id: "mock-doc-2",
                filename: "zoom_pitch_transcript.txt",
                text: "Founder Sarah Chen (former Otter.ai PM) shows past delays of 2-3 weeks on core API milestones.",
                page: 1
              }
            ];
          } else if (userMsgLower.includes("risk") || userMsgLower.includes("threat")) {
            ans = "The primary risks identified cover Competition (High density) [1] and Founder operational delays, where CEO Sarah Chen shows past delays of 2-3 weeks on core API milestones [2].";
            citations = [
              {
                id: 1,
                document_id: "mock-doc-1",
                filename: "acme_pitch_deck.pdf",
                text: "Key risks include high competitive density (rating: 70/100) and founder operational delays from CEO Sarah Chen (delays recorded on 2 promises, rating: 60/100).",
                page: 7
              },
              {
                id: 2,
                document_id: "mock-doc-2",
                filename: "zoom_pitch_transcript.txt",
                text: "Founder Sarah Chen (former Otter.ai PM) shows past delays of 2-3 weeks on core API milestones.",
                page: 1
              }
            ];
          } else if (userMsgLower.includes("pricing") || userMsgLower.includes("cost")) {
            ans = "The pricing model is structured into Free ($0), Pro ($29/mo) [1], and Custom/Team tiers targeting software engineering departments [2].";
            citations = [
              {
                id: 1,
                document_id: "mock-doc-1",
                filename: "acme_pitch_deck.pdf",
                text: "The pricing model is structured into Free ($0), Pro ($29/mo), and Custom/Team tiers targeting software engineering departments.",
                page: 4
              },
              {
                id: 2,
                document_id: "mock-doc-2",
                filename: "zoom_pitch_transcript.txt",
                text: "Targeting Product Managers and High Growth software engineering departments.",
                page: 1
              }
            ];
          }
          setChatLog(prev => [...prev, { 
            sender: "ai", 
            text: ans, 
            source: citations.map(c => c.filename).join(", "),
            citations: citations 
          }]);
          setChatLoading(false);
          setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }, 1000);
      } else {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/projects/${id}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMsg })
        });
        const data = await res.json();
        setChatLog(prev => [...prev, { 
          sender: "ai", 
          text: data.answer, 
          source: data.sources?.join(", "),
          citations: data.citations || [] 
        }]);
        setChatLoading(false);
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    } catch (err) {
      setChatLog(prev => [...prev, { sender: "ai", text: "Chat server endpoint error. Make sure FastAPI backend is active." }]);
      setChatLoading(false);
    }
  };

  const startLiveAnalysis = async () => {
    if (isOffline) {
      // Simulate live analytics trigger
      setProject(prev => prev ? { ...prev, status: "analyzing" } : null);
      return;
    }
    try {
      await fetch(`http://127.0.0.1:8000/api/v1/projects/${id}/analysis/start`, { method: "POST" });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
        <span className="text-sm text-slate-400">Loading analysis reports...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-bold text-white">Project Not Found</h3>
        <Link href="/dashboard" className="text-violet-400 hover:underline mt-2 inline-block">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-200 transition-colors flex items-center space-x-1 text-xs font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Portfolio</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{project.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              project.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
              project.status === "analyzing" ? "bg-violet-500/10 text-violet-400 border border-violet-500/20 animate-pulse" :
              "bg-slate-500/10 text-slate-300 border border-slate-500/20"
            }`}>
              {project.status}
            </span>
          </div>
          <p className="text-xs text-slate-500">Website: <a href={project.website_url} target="_blank" className="hover:underline text-violet-400">{project.website_url || "Not provided"}</a></p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <button 
            onClick={loadData}
            className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
            title="Refresh database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {project.status === "created" && (
            <button
              onClick={startLiveAnalysis}
              className="flex-1 md:flex-none inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all"
            >
              <Play className="w-4 h-4" />
              <span>Start Analysis</span>
            </button>
          )}
        </div>
      </div>

      {/* Main interactive content layouts */}
      {project.status === "analyzing" || project.status === "created" ? (
        /* Render Live Running Pipeline */
        <div className="glass p-6 md:p-8 rounded-2xl border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Multi-Agent Pipeline Active</h2>
              <p className="text-xs text-slate-400">Deploying context-focused agents to parse, score, and compile reports.</p>
            </div>
            {isOffline && (
              <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                Simulating Offline Run
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div 
                key={step.id || idx}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                  step.status === "completed" 
                    ? "bg-emerald-950/5 border-emerald-500/20 text-slate-300"
                    : step.status === "running"
                    ? "bg-violet-950/10 border-violet-500/30 text-white shadow-lg shadow-violet-500/5 animate-pulse"
                    : "bg-white/2 border-white/5 text-slate-500"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                    {step.agent_name}
                  </div>
                  <span className="text-sm font-medium">{step.step_name}</span>
                </div>
                <div>
                  {step.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : step.status === "running" ? (
                    <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-[10px] text-slate-600">
                      -
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Report is finished - Render Report + Chat panels */
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          
          {/* Main report side (width 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tab Swapping Headers */}
            <div className="flex border-b border-white/10 pb-2 justify-between items-center">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setLeftPaneTab("report")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    leftPaneTab === "report"
                      ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  Due Diligence Report
                </button>
                <button
                  type="button"
                  onClick={() => setLeftPaneTab("viewer")}
                  disabled={!selectedCitation}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    leftPaneTab === "viewer"
                      ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                      : "text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed border border-transparent"
                  }`}
                >
                  Document Highlights {selectedCitation && `(${selectedCitation.filename})`}
                </button>
              </div>
              {leftPaneTab === "viewer" && (
                <button
                  type="button"
                  onClick={() => setLeftPaneTab("report")}
                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center space-x-1 cursor-pointer animate-fade-in"
                >
                  <span>Close Viewer &times;</span>
                </button>
              )}
            </div>

            {leftPaneTab === "report" ? (
              <>
                {/* Investment circular score widget */}
                {report && (
                  <div className="glass p-6 rounded-2xl border-white/5 flex flex-col md:flex-row items-center md:justify-around gap-6">
                    {/* Gauge chart */}
                    <div className="relative flex items-center justify-center w-36 h-36">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle 
                          cx="50" cy="50" r="40" 
                          className="stroke-white/5" 
                          strokeWidth="8" fill="transparent" 
                        />
                        <circle 
                          cx="50" cy="50" r="40" 
                          className="stroke-violet-500 transition-all duration-1000 ease-out" 
                          strokeWidth="8" fill="transparent" 
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - (251.2 * report.investment_score) / 100}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-white">{report.investment_score}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide">Thesis Score</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-center md:text-left max-w-sm">
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-violet-600/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span>Investment Committee Approved</span>
                      </div>
                      <h3 className="font-bold text-white text-lg">Committee Verdict</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        InsightAgent suggests participation in the funding round, conditional on a detailed technical audit of the conversational tracking vector engine.
                      </p>
                    </div>
                  </div>
                )}

                {/* SWOT grids */}
                {report?.swot_analysis && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="glass p-6 rounded-2xl border-emerald-500/10 bg-emerald-950/2 space-y-4">
                      <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Strengths & Moats</h3>
                      <ul className="space-y-3 text-sm text-slate-300">
                        {report.swot_analysis.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start space-x-2.5">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses / Red flags */}
                    <div className="glass p-6 rounded-2xl border-rose-500/10 bg-rose-950/2 space-y-4">
                      <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider">Red Flags & Weaknesses</h3>
                      <ul className="space-y-3 text-sm text-slate-300">
                        {report.swot_analysis.weaknesses.map((weak, idx) => (
                          <li key={idx} className="flex items-start space-x-2.5">
                            <span className="text-rose-400 mt-0.5">✕</span>
                            <span>{weak}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Commitment Accountability Ledger */}
                {report?.commitments && (
                  <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
                    <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
                      <AlertTriangle className="w-5 h-5 text-violet-400" />
                      <h3 className="font-bold text-white">Founder Commitments Ledger</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {report.commitments.map((c, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-2 text-sm">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-300">{c.speaker}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              c.status === "Delayed" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}>
                              {c.status}
                            </span>
                          </div>
                          
                          <p className="text-slate-300 italic">"{c.promise}"</p>
                          
                          <div className="pt-2 border-t border-white/5 flex flex-col md:flex-row md:justify-between text-xs text-slate-400 gap-1.5">
                            <span>Deadline Target: <strong className="text-slate-300">{c.deadline}</strong></span>
                            <span className="text-rose-300 font-medium">Delay Profile: {c.history.delay_profile}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Competitor comparison table */}
                {report?.competitors && (
                  <div className="glass p-6 rounded-2xl border-white/5 space-y-4 overflow-hidden">
                    <h3 className="font-bold text-white text-base">Competitor Intelligence</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-400 font-semibold text-xs uppercase">
                            <th className="py-2.5 pr-4">Competitor</th>
                            <th className="py-2.5 pr-4">Pricing</th>
                            <th className="py-2.5 pr-4">Strengths</th>
                            <th className="py-2.5 pr-4">Moat vs Acme</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300 text-xs">
                          {report.competitors.map((c, idx) => (
                            <tr key={idx}>
                              <td className="py-3 pr-4 font-bold text-white">{c.name}</td>
                              <td className="py-3 pr-4">{c.pricing}</td>
                              <td className="py-3 pr-4">{c.strengths}</td>
                              <td className="py-3 pr-4 text-violet-300">{c.moat_vs_acme}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Document Highlights Viewer Panel */
              <div className="glass p-6 rounded-2xl border-white/5 space-y-6 flex flex-col h-[650px] animate-fade-in">
                <div className="flex justify-between items-center border-b border-white/5 pb-4 shrink-0">
                  <div>
                    <h3 className="font-bold text-white text-lg truncate max-w-[250px] md:max-w-md">
                      {selectedCitation?.filename}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Citation Footnote [{selectedCitation?.id}] &bull; Estimated Page {selectedCitation?.page}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-2.5 py-1 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 uppercase font-bold">
                      {selectedCitation?.filename.split('.').pop() || 'document'}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar bg-black/30 p-4 rounded-xl border border-white/5 h-[480px]">
                  {docLoading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-3">
                      <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                      <span className="text-sm text-slate-400">Extracting and loading document text...</span>
                    </div>
                  ) : docError ? (
                    <div className="flex flex-col items-center justify-center h-full text-rose-400 text-sm space-y-2">
                      <span>{docError}</span>
                      <button 
                        onClick={() => selectedCitation && loadDocumentContent(selectedCitation.document_id, selectedCitation.filename)}
                        className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-all"
                        type="button"
                      >
                        Retry Loading
                      </button>
                    </div>
                  ) : (
                    <div>
                      {selectedCitation && highlightText(documentContent, selectedCitation.text)}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Chat Sidebar (width 1/3) */}
          <div className="glass rounded-2xl border-white/5 h-[650px] flex flex-col justify-between overflow-hidden sticky top-24">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 bg-white/2 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-violet-400" />
                <span className="font-bold text-sm text-white">Analyst Chatbot</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 font-bold border border-violet-500/20">
                RAG Ingested
              </span>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar">
              {chatLog.map((log, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col space-y-1 ${log.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    log.sender === "user" 
                      ? "bg-violet-600 text-white rounded-br-none" 
                      : "bg-white/5 text-slate-200 border border-white/5 rounded-bl-none"
                  }`}>
                    {log.sender === "user" ? log.text : renderTextWithFootnotes(log.text, log.citations)}
                  </div>
                  {log.source && (
                    <span className="text-[10px] text-slate-500 px-1">Source: {log.source}</span>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center space-x-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                  <span className="text-xs">Consulting vectors...</span>
                </div>
              )}
              <div ref={scrollRef}></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-white/2 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask about burn rate, team, stack..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-white/5 border border-white/5 focus:border-violet-500/30 text-white placeholder-slate-500 text-sm outline-none outline-0 outline-offset-0 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

          </div>

        </div>
      )}
    </div>
  );
}

export default function ProjectDetailsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
        <span className="text-sm text-slate-400">Initializing report panels...</span>
      </div>
    }>
      <ProjectDetails />
    </Suspense>
  );
}

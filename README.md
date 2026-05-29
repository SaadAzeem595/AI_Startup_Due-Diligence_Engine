# InsightAgent: AI Startup Due Diligence Platform
> **"Beyond Otter.ai + Fireflies"** — A multi-agent AI Chief of Staff that crawls website signals, parses business documents, tracks verbal meeting commitments, maps competitor spaces, and logs execution analytics (LLMOps).

---

## 🌟 Key Features

*   🤖 **Multi-Agent Orchestration**: Sequential decentralized agents coordinate using a shared state context to execute individual tasks (Planner, Web scraping, Tech stack detection, Competitor audits, Market evaluation, Financial math, Risk calculation, and Investment thesis generation).
*   🎙️ **Spoken Commitment Auditor**: Detects spoken commitments/promises in founder meeting audio or pitch transcripts and cross-references them with roadmap milestones. Tracks historical delay rates to highlight operational execution risk.
*   🔍 **RAG Chat Retrieval**: Interactive sidebar grounded in project documents allowing you to ask queries (like burn rate, co-founder bios, valuation metrics) with matching source citations.
*   📊 **LLMOps Evaluation Ledger**: High-fidelity developer analytics dashboard plotting API costs (USD), input/output token usage, prompt versions, latency (ms), and star rating feedback inputs.
*   📦 **Flexible Run Configurations (Mock Mode)**: Runs completely offline without API keys, simulating realistic due diligence logs, SWOT layouts, and competitor grids out of the box.

---

## 📂 Repository Layout

```
AI_Startup_Due-Diligence_Engine/
├── apps/
│   ├── api/                 # FastAPI Python backend
│   │   ├── agents/          # Specialized AI agents & orchestrator
│   │   ├── services/        # RAG index and local text similarity tools
│   │   ├── uploads/         # Ingested startup documents cache
│   │   ├── main.py          # FastAPI server entry point
│   │   ├── models.py        # SQLAlchemy relational schema
│   │   └── database.py      # Database session setup
│   └── web/                 # Next.js 15 Client app
│       ├── app/             # App Router pages (Dashboard, Create, Details, Evaluation)
│       └── package.json     # Node scripts & dependencies
├── package.json             # Workspace package config
└── README.md                # System documentation
```

---

## 🚀 Installation & Running

This project has been fully initialized with all dependencies installed.

### 1. Launch FastAPI Backend
1.  Navigate to the API folder:
    ```powershell
    cd apps/api
    ```
2.  Activate the virtual environment:
    ```powershell
    .venv\Scripts\activate
    ```
3.  Launch the Uvicorn dev server:
    ```powershell
    uvicorn main:app --reload --port 8000
    ```
*The API is now running at `http://127.0.0.1:8000` and has created a local SQLite database file `due_diligence.db` automatically.*

### 2. Launch Next.js Frontend
1.  Open a new terminal and navigate to the web folder:
    ```powershell
    cd apps/web
    ```
2.  Start the development server:
    ```powershell
    npm run dev
    ```
*Open `http://localhost:3000` in your browser to experience the platform.*

---

## ⚙️ Environment Variables (Optional)
If you want to transition from **Local Mock Mode** to **Live AI execution**, create a `.env` file in `apps/api/` with your keys:
```env
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
PINECONE_API_KEY=your_pinecone_key_here
DATABASE_URL=sqlite:///./due_diligence.db # or Supabase PostgreSQL URI
```
If these parameters are missing, the server operates in **Mock Mode** by default, allowing you to test full end-to-end agent running immediately without external costs.

import os
import sys
import asyncio
from sqlalchemy.orm import Session

# Add workspace to path to allow importing apps.api
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from apps.api.database import SessionLocal, engine, Base
from apps.api.models import Project, Document, Report, AnalysisStep
from apps.api.agents.orchestrator import run_due_diligence_orchestration

async def test_agent_orchestration():
    print("--- Initializing DB tables ---")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        # Create a test project
        print("\n--- Creating a mock project for testing ---")
        project_name = "OptiDev AI Systems"
        project = db.query(Project).filter(Project.name == project_name).first()
        if project:
            print(f"Project '{project_name}' already exists (ID: {project.id}). Reusing it.")
        else:
            project = Project(
                name=project_name,
                website_url="https://optidev.ai",
                description="AI-driven engineering management assistant for tracking developer commits and auditing timeline commitments.",
                status="created"
            )
            db.add(project)
            db.commit()
            db.refresh(project)
            print(f"Created project: {project.name} with ID: {project.id}")
            
            # Create a mock document for this project
            mock_doc = Document(
                project_id=project.id,
                filename="pitch_deck.pdf",
                file_type="pdf",
                file_path="mock_path",
                text_content="""
                OptiDev AI systems seed round seeking $1.5M. Valuation Cap is $12M.
                Roadmap milestones: Q3 2026 launch commit tracking API, Q4 2026 SOC2 audit.
                Founder CEO Sarah Chen, CTO Alex Mercer.
                LTV/CAC is 4.2x. Burn rate is $45,000/mo. Runway is 14 months.
                Competitive moat: automated developer commitment auditing vs Otter/Fireflies.
                """
            )
            db.add(mock_doc)
            db.commit()
            print("Added mock pitch deck document.")
            
        print("\n--- Starting Agent Orchestration ---")
        await run_due_diligence_orchestration(db, project.id)
        
        # Verify step results
        print("\n--- Verifying Analysis Steps ---")
        steps = db.query(AnalysisStep).filter(AnalysisStep.project_id == project.id).all()
        for idx, step in enumerate(steps):
            print(f"Step {idx+1}: Agent: {step.agent_name} | Status: {step.status} | Task: {step.step_name}")
            
        # Verify Report
        print("\n--- Verifying Generated Report ---")
        report = db.query(Report).filter(Report.project_id == project.id).first()
        if report:
            print("[OK] Due Diligence Report successfully generated!")
            print(f"Investment Score: {report.investment_score}/100")
            print("SWOT Analysis Strengths:")
            for strength in report.swot_analysis.get("strengths", []):
                print(f"  - {strength}")
            print("SWOT Analysis Weaknesses:")
            for weakness in report.swot_analysis.get("weaknesses", []):
                print(f"  - {weakness}")
        else:
            print("[FAIL] No Report generated for this project.")
            
    except Exception as e:
        print(f"Verification failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_agent_orchestration())

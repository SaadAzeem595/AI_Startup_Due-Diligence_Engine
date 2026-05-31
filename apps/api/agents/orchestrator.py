import json
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from apps.api.models import Project, Report, AnalysisStep
from apps.api.agents.agents import Agents

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_due_diligence_orchestration(db: Session, project_id: str):
    logger.info(f"Starting orchestration for project {project_id}")
    
    # 1. Fetch project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        logger.error(f"Project {project_id} not found")
        return
    
    project.status = "analyzing"
    db.commit()
    
    # Clear any previous steps
    db.query(AnalysisStep).filter(AnalysisStep.project_id == project_id).delete()
    db.commit()
    
    try:
        # Get uploaded files list
        docs_list = [doc.filename for doc in project.documents]
        
        # Initialize Planner step
        planner_step = AnalysisStep(
            project_id=project_id,
            agent_name="PlannerAgent",
            step_name="Creating Execution Plan",
            status="running",
            started_at=datetime.utcnow()
        )
        db.add(planner_step)
        db.commit()
        
        # 2. Run Planner Agent
        plan = await Agents.run_planner(db, project_id, project.name, project.website_url or "http://example.com", docs_list)
        planner_step.status = "completed"
        planner_step.logs = json.dumps(plan, indent=2)
        planner_step.completed_at = datetime.utcnow()
        db.commit()
        
        # Create pending steps for all tasks
        step_objects = {}
        for idx, task in enumerate(plan["tasks"]):
            step = AnalysisStep(
                project_id=project_id,
                agent_name=task["agent"],
                step_name=task["description"],
                status="pending"
            )
            db.add(step)
            db.commit()
            step_objects[task["agent"]] = step
            
        # Context results accumulator
        results = {
            "PlannerAgent": plan
        }
        
        # Helper runner
        async def run_step(agent_name, coroutine_func, *args):
            step = step_objects.get(agent_name)
            if not step:
                return None
            step.status = "running"
            step.started_at = datetime.utcnow()
            db.commit()
            try:
                result = await coroutine_func(*args)
                step.status = "completed"
                step.logs = json.dumps(result, indent=2)
                step.completed_at = datetime.utcnow()
                db.commit()
                results[agent_name] = result
                return result
            except Exception as ex:
                step.status = "failed"
                step.logs = f"Error running agent: {str(ex)}"
                step.completed_at = datetime.utcnow()
                db.commit()
                logger.error(f"Agent {agent_name} failed: {ex}")
                raise ex

        # 3. Run Website Agent
        await run_step("WebsiteAgent", Agents.run_website, db, project_id, project.website_url or "")
        
        # 4. Run Technology Agent
        await run_step("TechnologyAgent", Agents.run_technology, db, project_id, project.website_url or "")
        
        # 5. Run PDF Agent
        await run_step("PDFAgent", Agents.run_pdf, db, project_id, docs_list)
        
        # 6. Run Pitch Transcript Agent (if present, otherwise mock run for compliance details)
        await run_step("PitchTranscriptAgent", Agents.run_pitch_transcript, db, project_id, docs_list)
        
        # 7. Run Competitor Agent
        await run_step("CompetitorAgent", Agents.run_competitor, db, project_id, project.website_url or "")
        
        # 8. Run Market Agent
        await run_step("MarketAgent", Agents.run_market, db, project_id, project.website_url or "")
        
        # 9. Run Financial Agent
        await run_step("FinancialAgent", Agents.run_financial, db, project_id, docs_list)
        
        # 10. Run Risk Agent (uses previous outputs)
        risk_result = await run_step(
            "RiskAgent", 
            Agents.run_risk, 
            db, 
            project_id,
            results.get("WebsiteAgent", {}),
            results.get("TechnologyAgent", {}),
            results.get("PDFAgent", {}),
            results.get("PitchTranscriptAgent", {})
        )
        
        # 11. Run Investment Committee Agent
        investment_result = await run_step(
            "InvestmentAgent",
            Agents.run_investment_committee,
            db,
            project_id,
            project.name,
            results.get("RiskAgent", {}),
            results.get("MarketAgent", {})
        )
        
        # 12. Compile Markdown report
        markdown_report = Agents.generate_markdown_report(
            name=project.name,
            planner=results.get("PlannerAgent", {}),
            website=results.get("WebsiteAgent", {}),
            tech=results.get("TechnologyAgent", {}),
            pdf=results.get("PDFAgent", {}),
            commitments=results.get("PitchTranscriptAgent", {}),
            competitor=results.get("CompetitorAgent", {}),
            market=results.get("MarketAgent", {}),
            financial=results.get("FinancialAgent", {}),
            risks=results.get("RiskAgent", {}),
            investment=results.get("InvestmentAgent", {})
        )
        
        # 13. Save Report
        # Clear existing report
        db.query(Report).filter(Report.project_id == project_id).delete()
        db.commit()
        
        report = Report(
            project_id=project_id,
            markdown_content=markdown_report,
            investment_score=investment_result.get("investment_score", 70),
            swot_analysis={
                "strengths": investment_result.get("reasons_to_invest", []),
                "weaknesses": investment_result.get("red_flags", [])
            },
            risks=risk_result.get("risk_categories", []),
            competitors=results.get("CompetitorAgent", {}).get("competitors", []),
            commitments=results.get("PitchTranscriptAgent", {}).get("commitments_detected", [])
        )
        db.add(report)
        
        project.status = "completed"
        db.commit()
        logger.info(f"Completed orchestration for project {project_id} successfully")
        
    except Exception as e:
        logger.exception(f"Orchestration failed for project {project_id}: {str(e)}")
        project.status = "failed"
        db.commit()

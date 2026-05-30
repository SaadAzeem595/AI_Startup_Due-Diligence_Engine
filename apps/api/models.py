from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from apps.api.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    projects = relationship("Project", back_populates="creator")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True, nullable=False)
    website_url = Column(String, nullable=True)
    description = Column(String, nullable=True)
    status = Column(String, default="created")  # created, analyzing, completed, failed
    creator_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    creator = relationship("User", back_populates="projects")
    documents = relationship("Document", back_populates="project", cascade="all, delete-orphan")
    report = relationship("Report", back_populates="project", uselist=False, cascade="all, delete-orphan")
    analysis_steps = relationship("AnalysisStep", back_populates="project", cascade="all, delete-orphan")
    ai_interactions = relationship("AIInteraction", back_populates="project", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, business_plan, financial, pitch_transcript
    file_path = Column(String, nullable=True)     # local storage or Supabase URL
    text_content = Column(Text, nullable=True)    # extracted text content for RAG
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="documents")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    markdown_content = Column(Text, nullable=False)
    investment_score = Column(Integer, default=70) # 0-100 score
    swot_analysis = Column(JSON, nullable=True)     # JSON object with strengths, weaknesses, etc.
    risks = Column(JSON, nullable=True)            # JSON list of categorized risks and scores
    competitors = Column(JSON, nullable=True)      # JSON list of competitor details
    commitments = Column(JSON, nullable=True)      # Tracked commitments/promises from transcripts
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="report")

class AnalysisStep(Base):
    __tablename__ = "analysis_steps"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    agent_name = Column(String, nullable=False)      # WebsiteAgent, FinancialAgent, etc.
    step_name = Column(String, nullable=False)       # Crawling website, Analyzing financials, etc.
    status = Column(String, default="pending")       # pending, running, completed, failed
    logs = Column(Text, nullable=True)               # Console logs/output
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    project = relationship("Project", back_populates="analysis_steps")

class AIInteraction(Base):
    __tablename__ = "ai_interactions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    prompt_version = Column(String, default="1.0")
    model_used = Column(String, nullable=False)
    latency_ms = Column(Integer, nullable=False)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    cost_estimate = Column(Float, default=0.0)      # USD
    user_rating = Column(Integer, nullable=True)     # 1 to 5 stars
    user_comment = Column(Text, nullable=True)       # Feedback text
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="ai_interactions")

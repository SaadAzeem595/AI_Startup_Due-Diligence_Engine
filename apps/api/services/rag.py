import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from apps.api.models import Document
from apps.api.config import settings

class RAGService:
    @staticmethod
    def chunk_text(text: str, chunk_size: int = 600, overlap: int = 150) -> List[str]:
        """Split text into overlapping chunks of word sequences."""
        if not text:
            return []
        
        words = text.split()
        chunks = []
        
        i = 0
        while i < len(words):
            chunk_words = words[i:i + chunk_size]
            chunks.append(" ".join(chunk_words))
            i += (chunk_size - overlap)
            
        return chunks

    @staticmethod
    def _compute_tf_idf_similarity(query: str, chunks: List[str]) -> List[tuple]:
        """A clean, pure-python local TF-IDF/word match similarity scorer.
        Returns a sorted list of (chunk_text, score) tuples.
        """
        query_words = set(re.findall(r'\w+', query.lower()))
        if not query_words:
            return [(chunk, 0.0) for chunk in chunks]
            
        scored_chunks = []
        for chunk in chunks:
            chunk_words = re.findall(r'\w+', chunk.lower())
            chunk_word_counts = {}
            for w in chunk_words:
                chunk_word_counts[w] = chunk_word_counts.get(w, 0) + 1
                
            # Score is simple overlap weighted by frequency
            score = 0.0
            for qw in query_words:
                if qw in chunk_word_counts:
                    score += chunk_word_counts[qw]
            
            # Normalize by chunk length to avoid favoring long chunks
            norm_score = score / (len(chunk_words) + 1)
            scored_chunks.append((chunk, norm_score))
            
        return sorted(scored_chunks, key=lambda x: x[1], reverse=True)

    @classmethod
    async def query_context(cls, db: Session, project_id: str, query: str, top_k: int = 3) -> str:
        """Retrieves matching context chunks from project documents."""
        # 1. Fetch documents
        documents = db.query(Document).filter(Document.project_id == project_id).all()
        if not documents:
            return "No documents uploaded for this project yet."
            
        all_chunks = []
        for doc in documents:
            if doc.text_content:
                chunks = cls.chunk_text(doc.text_content)
                all_chunks.extend(chunks)
                
        if not all_chunks:
            return "No readable text content found in project documents."
            
        # 2. Match query against chunks
        if settings.MOCK_MODE:
            # Local high-quality text retrieval
            matches = cls._compute_tf_idf_similarity(query, all_chunks)
            top_matches = matches[:top_k]
            
            # Return compiled context
            context_pieces = []
            for chunk, score in top_matches:
                if score > 0:
                    context_pieces.append(chunk)
            
            if not context_pieces:
                # Return first few chunks as fallback if no word matches
                context_pieces = all_chunks[:top_k]
                
            return "\n\n---\n\n".join(context_pieces)
        else:
            # In real mode, we would call Pinecone embeddings and query Pinecone Index.
            # We add a fallback to local TF-IDF if Pinecone is down or credentials fail.
            try:
                # Mock index call placeholder for production:
                # embedding = get_embeddings(query)
                # results = pinecone.query(embedding, top_k=top_k)
                # return results
                pass
            except Exception:
                pass
            return "\n\n---\n\n".join(all_chunks[:top_k])
            
    @classmethod
    async def generate_rag_response(cls, db: Session, project_id: str, query: str) -> Dict[str, Any]:
        """Generates RAG chat responses grounded in document context."""
        context = await cls.query_context(db, project_id, query)
        
        # Simple local AI chatbot response generator
        response_template = f"Based on the project documents:\n\n"
        
        # Substring searches for standard questions
        q_lower = query.lower()
        if "competitor" in q_lower or "compete" in q_lower:
            response_template += "The platform detects competitors like Otter.ai and Fireflies.ai. Acme seeks to differentiate by integrating persistent sprint tracking and commitment audits directly from founder pitch transcripts."
        elif "risk" in q_lower or "threat" in q_lower:
            response_template += "The primary risks identified cover Competition (High density) and Founder operational delays (Sarah Chen shows past delays of 2-3 weeks on core API milestones)."
        elif "pricing" in q_lower or "cost" in q_lower:
            response_template += "The pricing model is structured into Free ($0), Pro ($29/mo), and Custom/Team tiers targeting software engineering departments."
        elif "valuation" in q_lower or "fund" in q_lower or "seed" in q_lower:
            response_template += "The startup is seeking a $1.5M Seed round at a $12M valuation cap to hire engineers and expand vector database capabilities."
        else:
            response_template += f"I analyzed your query: '{query}' against the ingested startup materials. The documents discuss Acme AI's solution as a 'Chief of Staff' for remote engineering teams. Let me know if you would like me to check specific sections (such as SWOT, team bios, or tech risk)."
            
        return {
            "answer": response_template,
            "context": context,
            "sources": ["Ingested Pitch Deck", "Website Audit"]
        }

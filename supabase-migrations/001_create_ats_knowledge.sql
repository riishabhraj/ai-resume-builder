-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for ATS knowledge base documents
CREATE TABLE IF NOT EXISTS ats_knowledge (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('ats_rule', 'industry_keywords', 'best_practice', 'example', 'action_verb')),
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small uses 1536 dimensions
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster vector similarity search
CREATE INDEX IF NOT EXISTS ats_knowledge_embedding_idx ON ats_knowledge 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for metadata queries
CREATE INDEX IF NOT EXISTS ats_knowledge_metadata_idx ON ats_knowledge USING gin(metadata);

-- Create index for type queries
CREATE INDEX IF NOT EXISTS ats_knowledge_type_idx ON ats_knowledge(type);

-- Function to search for similar documents
CREATE OR REPLACE FUNCTION match_ats_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id TEXT,
  type TEXT,
  content TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ats_knowledge.id,
    ats_knowledge.type,
    ats_knowledge.content,
    ats_knowledge.metadata,
    1 - (ats_knowledge.embedding <=> query_embedding) AS similarity
  FROM ats_knowledge
  WHERE 1 - (ats_knowledge.embedding <=> query_embedding) > match_threshold
  ORDER BY ats_knowledge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_ats_knowledge_updated_at 
  BEFORE UPDATE ON ats_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


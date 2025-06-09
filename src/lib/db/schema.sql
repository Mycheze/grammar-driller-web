-- Grammar Driller Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- Create drill_files table
CREATE TABLE drill_files (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  target_language TEXT NOT NULL,
  base_language TEXT NOT NULL DEFAULT 'English',
  author TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  description TEXT NOT NULL,
  grammar_concept TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  tags TEXT NOT NULL DEFAULT '',
  
  -- Voting system
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  question_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  drill_file_id INTEGER NOT NULL REFERENCES drill_files(id) ON DELETE CASCADE,
  
  -- Question content
  full_sentence TEXT NOT NULL,
  target_word TEXT NOT NULL,
  prompt TEXT NOT NULL,
  grammar_concept TEXT NOT NULL,
  alternate_answers TEXT NOT NULL DEFAULT '',
  hint TEXT NOT NULL DEFAULT '',
  
  -- Question metadata
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table (for progress tracking)
CREATE TABLE user_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  drill_file_id INTEGER NOT NULL REFERENCES drill_files(id),
  
  -- Progress tracking
  correct_answers JSONB NOT NULL DEFAULT '[]',
  incorrect_answers JSONB NOT NULL DEFAULT '[]',
  current_question_id INTEGER,
  
  -- Session state
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_drill_files_language ON drill_files(target_language);
CREATE INDEX idx_drill_files_difficulty ON drill_files(difficulty);
CREATE INDEX idx_drill_files_created_at ON drill_files(created_at DESC);
CREATE INDEX idx_questions_drill_file_id ON questions(drill_file_id);
CREATE INDEX idx_questions_order ON questions(drill_file_id, order_index);
CREATE INDEX idx_user_sessions_drill_file ON user_sessions(drill_file_id);

-- Update question_count automatically
CREATE OR REPLACE FUNCTION update_question_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE drill_files 
  SET question_count = (
    SELECT COUNT(*) 
    FROM questions 
    WHERE drill_file_id = COALESCE(NEW.drill_file_id, OLD.drill_file_id)
  )
  WHERE id = COALESCE(NEW.drill_file_id, OLD.drill_file_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_question_count_trigger
  AFTER INSERT OR DELETE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_question_count();

-- Update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_drill_files_updated_at
  BEFORE UPDATE ON drill_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
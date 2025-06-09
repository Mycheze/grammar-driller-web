export interface Database {
  public: {
    Tables: {
      drill_files: {
        Row: DrillFile;
        Insert: NewDrillFile;
        Update: Partial<NewDrillFile>;
      };
      questions: {
        Row: Question;
        Insert: NewQuestion;
        Update: Partial<NewQuestion>;
      };
      user_sessions: {
        Row: UserSession;
        Insert: NewUserSession;
        Update: Partial<NewUserSession>;
      };
    };
  };
}

export interface DrillFile {
  id: string;
  filename: string;
  target_language: string;
  base_language: string;
  title: string;
  author: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  description: string;
  grammar_concept: string;
  version: string;
  tags: string;
  question_count: number;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  drill_file_id: string;
  full_sentence: string;
  target_word: string;
  prompt: string;
  grammar_concept: string;
  alternate_answers: string;
  hint: string;
  order_index: number;
  created_at: string;
}

export interface UserSession {
  id: string;
  drill_file_id: string;
  current_question_index: number;
  correct_count: number;
  incorrect_count: number;
  completed_questions: string[]; // JSON array of question IDs
  incorrect_questions: string[]; // JSON array of question IDs
  quiz_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Insert types (for creating new records)
export type NewDrillFile = Omit<DrillFile, 'id' | 'created_at' | 'updated_at'>;
export type NewQuestion = Omit<Question, 'id' | 'created_at'>;
export type NewUserSession = Omit<UserSession, 'id' | 'created_at' | 'updated_at'>;
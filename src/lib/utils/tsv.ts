import { z } from 'zod';
import type { DrillFile, Question } from '../db/types';

// Validation schemas
const MetadataSchema = z.object({
  target_language: z.string().min(1),
  base_language: z.string().default('English'),
  title: z.string().min(1),
  author: z.string().min(1),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
  description: z.string().min(1),
  grammar_concept: z.string().optional(), // Make this optional
  version: z.string().default('1.0'),
  tags: z.string().default(''),
});

const QuestionSchema = z.object({
  full_sentence: z.string().min(1),
  target_word: z.string().min(1),
  prompt: z.string().min(1),
  grammar_concept: z.string().min(1),
  alternate_answers: z.string().default(''),
  hint: z.string().default(''),
});

export interface ParsedTSV {
  metadata: z.infer<typeof MetadataSchema>;
  questions: z.infer<typeof QuestionSchema>[];
}

// Type for raw question data before validation
interface RawQuestionData {
  [key: string]: string;
}

export function parseTSV(content: string): ParsedTSV {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  const metadata: Record<string, string> = {};
  const questions: RawQuestionData[] = [];
  let headers: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('#META')) {
      const parts = line.split('\t');
      if (parts.length >= 3) {
        const key = parts[1];
        const value = parts[2];
        metadata[key] = value;
      }
    } else if (line.startsWith('#HEADER')) {
      headers = line.split('\t').slice(1); // Remove #HEADER prefix
    } else if (!line.startsWith('#') && headers.length > 0) {
      const parts = line.split('\t');
      if (parts.length >= headers.length) {
        const question: RawQuestionData = {};
        headers.forEach((header, index) => {
          question[header] = parts[index] || '';
        });
        questions.push(question);
      }
    }
  }
  
  // If grammar_concept is missing from metadata, derive it from the first question or description
  if (!metadata.grammar_concept && questions.length > 0) {
    metadata.grammar_concept = questions[0].grammar_concept || 'Grammar Practice';
  }
  
  // Validate the parsed data
  const validatedMetadata = MetadataSchema.parse(metadata);
  const validatedQuestions = questions.map(q => QuestionSchema.parse(q));
  
  return {
    metadata: validatedMetadata,
    questions: validatedQuestions,
  };
}

export function generateTSV(drillFile: DrillFile, questions: Question[]): string {
  const lines: string[] = [];
  
  // Add metadata
  lines.push(`#META\ttarget_language\t${drillFile.target_language}`);
  lines.push(`#META\tbase_language\t${drillFile.base_language}`);
  lines.push(`#META\ttitle\t${drillFile.title}`);
  lines.push(`#META\tauthor\t${drillFile.author}`);
  lines.push(`#META\tdifficulty\t${drillFile.difficulty}`);
  lines.push(`#META\tdescription\t${drillFile.description}`);
  lines.push(`#META\tgrammar_concept\t${drillFile.grammar_concept}`);
  lines.push(`#META\tversion\t${drillFile.version}`);
  lines.push(`#META\ttags\t${drillFile.tags}`);
  lines.push('');
  
  // Add header
  lines.push('#HEADER\tfull_sentence\ttarget_word\tprompt\tgrammar_concept\talternate_answers\thint');
  lines.push('');
  
  // Add questions
  for (const question of questions) {
    const row = [
      question.full_sentence,
      question.target_word,
      question.prompt,
      question.grammar_concept,
      question.alternate_answers,
      question.hint,
    ].join('\t');
    lines.push(row);
  }
  
  return lines.join('\n');
}

export function validateTSVFile(file: File): Promise<ParsedTSV> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.tsv')) {
      reject(new Error('File must be a .tsv file'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = parseTSV(content);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseTSV, generateTSV, type ParsedTSV } from './tsv';
import type { DrillFile, Question } from '../db/types';

export async function validateQuizContent(parsedContent: ParsedTSV): Promise<ParsedTSV> {
  try {
    console.log('=== Starting Quiz Validation ===');
    console.log(`Validating ${parsedContent.questions.length} questions`);

    // Convert parsed content back to TSV format for validation
    const mockDrillFile: DrillFile = {
      id: 'temp',
      filename: 'temp.tsv',
      target_language: parsedContent.metadata.target_language,
      base_language: parsedContent.metadata.base_language,
      title: parsedContent.metadata.title,
      author: parsedContent.metadata.author,
      difficulty: parsedContent.metadata.difficulty,
      description: parsedContent.metadata.description,
      grammar_concept: parsedContent.metadata.grammar_concept || 'Grammar Practice',
      version: parsedContent.metadata.version,
      tags: parsedContent.metadata.tags,
      question_count: parsedContent.questions.length,
      upvotes: 0,
      downvotes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const mockQuestions: Question[] = parsedContent.questions.map((q, index) => ({
      id: `temp-${index}`,
      drill_file_id: 'temp',
      full_sentence: q.full_sentence,
      target_word: q.target_word,
      prompt: q.prompt,
      grammar_concept: q.grammar_concept,
      alternate_answers: q.alternate_answers,
      hint: q.hint,
      order_index: index,
      created_at: new Date().toISOString()
    }));

    const tsvContent = generateTSV(mockDrillFile, mockQuestions);

    // Load validation prompt
    console.log('Loading validation prompt template...');
    const promptPath = join(process.cwd(), 'src/lib/prompts/quiz-validation.txt');
    const promptTemplate = readFileSync(promptPath, 'utf-8');

    // Format the prompt with the quiz content
    const formattedPrompt = promptTemplate.replace(/{quiz_content}/g, tsvContent);

    console.log('Prompt formatted, calling validation AI...');

    // Create OpenAI client
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY!
    });

    const startTime = Date.now();

    // Call AI for validation
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a grammar quiz validation expert. Your job is to find and fix errors in generated quiz content. Always return properly formatted TSV data. Be thorough but efficient - fix real problems without making unnecessary changes.'
        },
        {
          role: 'user',
          content: formattedPrompt
        }
      ],
      temperature: 0.1, // Very low temperature for consistent, careful validation
      max_tokens: 2000  // Enough space for full quiz response
    });

    const duration = Date.now() - startTime;
    console.log(`Validation completed in ${duration}ms`);

    const validatedContent = response.choices[0]?.message?.content;
    
    if (!validatedContent) {
      console.log('No validation response received, returning original content');
      return parsedContent;
    }

    console.log('=== Validation Response (first 300 chars) ===');
    console.log(validatedContent.substring(0, 300) + (validatedContent.length > 300 ? '...' : ''));

    // Parse the validated content
    try {
      const validatedParsed = parseTSV(validatedContent);
      console.log(`Validation successful: ${validatedParsed.questions.length} questions validated`);
      
      // Quick sanity check - make sure we didn't lose questions
      if (validatedParsed.questions.length === 0) {
        console.log('WARNING: Validation resulted in 0 questions, returning original');
        return parsedContent;
      }

      if (validatedParsed.questions.length !== parsedContent.questions.length) {
        console.log(`WARNING: Question count changed from ${parsedContent.questions.length} to ${validatedParsed.questions.length}`);
      }

      return validatedParsed;

    } catch (parseError) {
      console.error('Failed to parse validated content:', parseError);
      console.log('Returning original content due to validation parse error');
      return parsedContent;
    }

  } catch (error) {
    console.error('Validation error:', error);
    console.log('Returning original content due to validation error');
    return parsedContent;
  }
}

export function shouldSkipValidation(): boolean {
  // Skip validation in development if environment variable is set
  return process.env.SKIP_QUIZ_VALIDATION === 'true';
}
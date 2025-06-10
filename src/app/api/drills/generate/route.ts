import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { parseTSV } from '@/lib/utils/tsv';
import { validateQuizContent, shouldSkipValidation } from '@/lib/utils/quiz-validation';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { NewDrillFile, NewQuestion } from '@/lib/db/types';

export async function POST(request: NextRequest) {
  try {
    const {
      target_language,
      base_language = 'English',
      grammar_concept,
      difficulty_level = 'Intermediate',
      number_of_sentences = 10,
      title,
      tags = ''
    } = await request.json();

    // Validate required fields
    if (!target_language || !grammar_concept) {
      return NextResponse.json(
        { error: 'Target language and grammar concept are required' },
        { status: 400 }
      );
    }

    console.log('=== Starting Drill Generation ===');
    console.log(`Target: ${target_language}, Concept: ${grammar_concept}, Difficulty: ${difficulty_level}`);
    console.log(`Sentences requested: ${number_of_sentences}`);

    // Generate title if not provided
    const finalTitle = title || `${target_language} ${grammar_concept} Practice`;

    // Load prompt template
    console.log('Loading prompt template...');
    const promptPath = join(process.cwd(), 'src/lib/prompts/drill-generation.txt');
    const promptTemplate = readFileSync(promptPath, 'utf-8');

    // Format the prompt with parameters
    const formattedPrompt = promptTemplate
      .replace(/{target_language}/g, target_language)
      .replace(/{base_language}/g, base_language)
      .replace(/{grammar_concept}/g, grammar_concept)
      .replace(/{difficulty_level}/g, difficulty_level)
      .replace(/{number_of_sentences}/g, number_of_sentences.toString())
      .replace(/{title}/g, finalTitle)
      .replace(/{tags}/g, tags);

    console.log('Prompt formatted, calling AI...');

    // Create OpenAI client (same as working test)
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY!
    });

    const startTime = Date.now();

    // Simple API call without timeout complexity
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful language learning content creator that creates precise, educational content following the EXACT format requested. IMPORTANT: Your response MUST begin with #META lines and include a #HEADER line followed by content lines. Do not include any explanations, comments, or additional text before or after the TSV data. Your entire response must be in valid TSV format, starting with metadata and ending with the last practice sentence.'
        },
        {
          role: 'user',
          content: formattedPrompt
        }
      ],
      temperature: 0.7
      // Removed max_tokens limit - let it generate what it needs
    });

    const duration = Date.now() - startTime;
    console.log(`AI response received in ${duration}ms`);

    const aiContent = response.choices[0]?.message?.content;
    
    if (!aiContent) {
      console.error('No content received from AI');
      throw new Error('No content received from AI');
    }

    console.log('=== AI Generated Content (first 500 chars) ===');
    console.log(aiContent.substring(0, 500) + (aiContent.length > 500 ? '...' : ''));
    console.log('=== Content length:', aiContent.length, 'characters ===');

    console.log('Parsing TSV content...');

    // Parse the TSV content
    let parsed;
    try {
      parsed = parseTSV(aiContent);
      console.log(`Successfully parsed TSV: ${parsed.questions.length} questions found`);
    } catch (parseError) {
      console.error('=== TSV Parsing Failed ===');
      console.error('Parse error:', parseError);
      console.error('Raw AI content (first 1000 chars):');
      console.error(aiContent.substring(0, 1000));
      console.error('=== End Parsing Error ===');
      
      throw new Error(`Failed to parse AI-generated content: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }

    // Validate we got questions
    if (parsed.questions.length === 0) {
      throw new Error('No valid questions found in AI-generated content');
    }

    // NEW: Validate and improve the quiz content
    let finalParsed = parsed;
    if (!shouldSkipValidation()) {
      console.log('Running quiz validation...');
      try {
        finalParsed = await validateQuizContent(parsed);
        console.log('Quiz validation completed successfully');
        
        // Log any significant changes
        if (finalParsed.questions.length !== parsed.questions.length) {
          console.log(`Question count changed during validation: ${parsed.questions.length} → ${finalParsed.questions.length}`);
        }
      } catch (validationError) {
        console.error('Validation failed, using original content:', validationError);
        finalParsed = parsed; // Fall back to original if validation fails
      }
    } else {
      console.log('Quiz validation skipped (SKIP_QUIZ_VALIDATION=true)');
    }

    console.log(`Final quiz has ${finalParsed.questions.length} questions, saving to database...`);

    // Create drill file record (using the validated content)
    const drillFileData: NewDrillFile = {
      filename: `${target_language}_${grammar_concept.replace(/\s+/g, '_')}.tsv`,
      target_language: finalParsed.metadata.target_language,
      base_language: finalParsed.metadata.base_language,
      title: finalParsed.metadata.title,
      author: finalParsed.metadata.author,
      difficulty: finalParsed.metadata.difficulty,
      description: finalParsed.metadata.description,
      grammar_concept: finalParsed.metadata.grammar_concept || grammar_concept,
      version: finalParsed.metadata.version,
      tags: finalParsed.metadata.tags,
      question_count: finalParsed.questions.length,
      upvotes: 0,
      downvotes: 0,
    };

    // Insert drill file
    const { data: drillFile, error: drillFileError } = await supabase
      .from('drill_files')
      .insert(drillFileData)
      .select()
      .single();

    if (drillFileError) {
      console.error('Database error inserting drill file:', drillFileError);
      throw new Error(`Failed to save drill file: ${drillFileError.message}`);
    }

    console.log(`Drill file saved with ID: ${drillFile.id}`);

    // Create questions data (using validated questions)
    const questionsData: NewQuestion[] = finalParsed.questions.map((question, index) => ({
      drill_file_id: drillFile.id,
      full_sentence: question.full_sentence,
      target_word: question.target_word,
      prompt: question.prompt,
      grammar_concept: question.grammar_concept,
      alternate_answers: question.alternate_answers,
      hint: question.hint,
      order_index: index,
    }));

    // Insert questions
    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsData);

    if (questionsError) {
      console.error('Database error inserting questions:', questionsError);
      // Clean up the drill file if questions failed
      await supabase
        .from('drill_files')
        .delete()
        .eq('id', drillFile.id);
      
      throw new Error(`Failed to save questions: ${questionsError.message}`);
    }

    const totalDuration = Date.now() - startTime;
    console.log(`=== Generation Complete! Total time: ${totalDuration}ms ===`);
    console.log(`Created drill "${drillFile.title}" with ${finalParsed.questions.length} questions`);

    return NextResponse.json({
      success: true,
      drillFile: drillFile,
      questionCount: finalParsed.questions.length,
      validated: !shouldSkipValidation(),
    });

  } catch (error) {
    console.error('=== Drill Generation Error ===');
    console.error(error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate drill file'
      },
      { status: 500 }
    );
  }
}
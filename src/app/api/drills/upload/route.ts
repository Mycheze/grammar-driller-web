import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { parseTSV } from '@/lib/utils/tsv';
import type { NewDrillFile, NewQuestion } from '@/lib/db/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.tsv')) {
      return NextResponse.json(
        { error: 'File must be a .tsv file' },
        { status: 400 }
      );
    }

    // Read and parse the file
    const content = await file.text();
    const parsed = parseTSV(content);

    // Create drill file record
    const drillFileData: NewDrillFile = {
      filename: file.name,
      target_language: parsed.metadata.target_language,
      base_language: parsed.metadata.base_language,
      title: parsed.metadata.title,
      author: parsed.metadata.author,
      difficulty: parsed.metadata.difficulty,
      description: parsed.metadata.description,
      grammar_concept: parsed.metadata.grammar_concept || 'Grammar Practice', // Provide default
      version: parsed.metadata.version,
      tags: parsed.metadata.tags,
      question_count: parsed.questions.length,
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
      console.error('Error inserting drill file:', drillFileError);
      return NextResponse.json(
        { error: `Failed to save drill file: ${drillFileError.message}` },
        { status: 500 }
      );
    }

    // Create questions data
    const questionsData: NewQuestion[] = parsed.questions.map((question, index) => ({
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
      console.error('Error inserting questions:', questionsError);
      // Clean up the drill file if questions failed
      await supabase
        .from('drill_files')
        .delete()
        .eq('id', drillFile.id);
      
      return NextResponse.json(
        { error: `Failed to save questions: ${questionsError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      drillFile: drillFile,
      questionCount: parsed.questions.length,
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to parse file: ${error.message}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
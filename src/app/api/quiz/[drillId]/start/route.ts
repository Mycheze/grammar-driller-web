import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

function createBlankSentence(fullSentence: string, targetWord: string): string {
  // Escape special regex characters in the target word
  const escapedTarget = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Use word boundaries to match whole words only
  const regex = new RegExp(`\\b${escapedTarget}\\b`, 'i');
  
  // Try word boundary first
  if (regex.test(fullSentence)) {
    return fullSentence.replace(regex, '_____');
  }
  
  // Fallback to simple replacement if no word boundary match
  return fullSentence.replace(targetWord, '_____');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ drillId: string }> }
) {
  try {
    const { drillId } = await params;

    // Get drill file and ALL questions in one go
    const [drillResponse, questionsResponse] = await Promise.all([
      supabase
        .from('drill_files')
        .select('id, title, target_language, difficulty')
        .eq('id', drillId)
        .single(),
      supabase
        .from('questions')
        .select('*')
        .eq('drill_file_id', drillId)
        .order('order_index')
    ]);

    if (drillResponse.error || !drillResponse.data) {
      return NextResponse.json({ error: 'Drill not found' }, { status: 404 });
    }

    if (questionsResponse.error || !questionsResponse.data?.length) {
      return NextResponse.json({ error: 'No questions found' }, { status: 404 });
    }

    // Create session for final results saving
    const { data: session } = await supabase
      .from('user_sessions')
      .insert({
        drill_file_id: drillId,
        current_question_index: 0,
        correct_count: 0,
        incorrect_count: 0,
        completed_questions: [],
        incorrect_questions: [],
        quiz_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    // Format all questions for client
    const formattedQuestions = questionsResponse.data.map((q, index) => ({
      id: q.id,
      questionIndex: index,
      fullSentence: q.full_sentence,
      targetWord: q.target_word,
      blankSentence: createBlankSentence(q.full_sentence, q.target_word),
      prompt: q.prompt,
      alternateAnswers: q.alternate_answers 
        ? q.alternate_answers.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      hint: q.hint || '',
      grammarConcept: q.grammar_concept
    }));

    return NextResponse.json({
      sessionId: session?.id || null,
      drillFile: drillResponse.data,
      questions: formattedQuestions,
      totalQuestions: formattedQuestions.length
    });

  } catch (error) {
    console.error('Start quiz error:', error);
    return NextResponse.json({ error: 'Failed to start quiz' }, { status: 500 });
  }
}
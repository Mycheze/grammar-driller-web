import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ drillId: string }> }
) {
  try {
    const { drillId } = await params;
    const { sessionId, questionIndex } = await request.json();

    if (!sessionId || questionIndex === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get session from database
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('drill_file_id', drillId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get total questions count for progress calculation
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .eq('drill_file_id', drillId);

    if (questionsError || !questions) {
      return NextResponse.json({ error: 'Questions not found' }, { status: 404 });
    }

    // Update progress to mark question as correct
    const completedQuestions: number[] = session.completed_questions || [];
    const incorrectQuestions: number[] = session.incorrect_questions || [];
    
    let newCompletedQuestions = [...completedQuestions];
    let newIncorrectQuestions = [...incorrectQuestions];
    let newCorrectCount = session.correct_count;

    // Add to completed if not already there
    if (!newCompletedQuestions.includes(questionIndex)) {
      newCompletedQuestions.push(questionIndex);
      newCorrectCount++;
    }
    
    // Remove from incorrect if it was there
    newIncorrectQuestions = newIncorrectQuestions.filter(q => q !== questionIndex);

    // Check if quiz is completed
    const isCompleted = newCompletedQuestions.length >= questions.length;

    // Update session in database
    const { error: updateError } = await supabase
      .from('user_sessions')
      .update({
        correct_count: newCorrectCount,
        completed_questions: newCompletedQuestions,
        incorrect_questions: newIncorrectQuestions,
        quiz_completed: isCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session:', updateError);
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Answer marked as correct',
      progress: {
        correct: newCompletedQuestions.length,
        incorrect: newIncorrectQuestions.length,
        remaining: questions.length - newCompletedQuestions.length,
        total: questions.length,
        completed: isCompleted
      }
    });

  } catch (error) {
    console.error('Override route error:', error);
    return NextResponse.json({ error: 'Failed to override answer' }, { status: 500 });
  }
}
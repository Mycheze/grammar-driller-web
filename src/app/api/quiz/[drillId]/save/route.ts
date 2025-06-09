import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ drillId: string }> }
) {
  try {
    const { drillId } = await params;
    const { sessionId, results } = await request.json();

    if (!sessionId || !results) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Update final session results
    const { error } = await supabase
      .from('user_sessions')
      .update({
        correct_count: results.correctCount,
        incorrect_count: results.incorrectCount,
        completed_questions: results.completedQuestions,
        incorrect_questions: results.incorrectQuestions,
        quiz_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('drill_file_id', drillId);

    if (error) {
      console.error('Error saving results:', error);
      return NextResponse.json({ error: 'Failed to save results' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Save results error:', error);
    return NextResponse.json({ error: 'Failed to save results' }, { status: 500 });
  }
}
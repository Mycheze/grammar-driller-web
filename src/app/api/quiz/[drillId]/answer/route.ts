import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ drillId: string }> }
) {
  try {
    const { drillId } = await params;
    const { sessionId, answer, questionIndex } = await request.json();

    if (!sessionId || !answer || questionIndex === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get session and the specific question in one efficient query
    const [sessionResponse, questionResponse, totalQuestionsResponse] = await Promise.all([
      supabase
        .from('user_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('drill_file_id', drillId)
        .single(),
      supabase
        .from('questions')
        .select('*')
        .eq('drill_file_id', drillId)
        .eq('order_index', questionIndex)
        .single(),
      supabase
        .from('questions')
        .select('id')
        .eq('drill_file_id', drillId)
    ]);

    if (sessionResponse.error || !sessionResponse.data) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (questionResponse.error || !questionResponse.data) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    if (totalQuestionsResponse.error || !totalQuestionsResponse.data) {
      return NextResponse.json({ error: 'Questions not found' }, { status: 404 });
    }

    const session = sessionResponse.data;
    const currentQuestion = questionResponse.data;
    const totalQuestions = totalQuestionsResponse.data.length;

    // Check if answer is correct
    const userAnswer = answer.trim().toLowerCase();
    const correctAnswers = [
      currentQuestion.target_word.toLowerCase(),
      ...(currentQuestion.alternate_answers || '').split(',')
        .map((s: string) => s.trim().toLowerCase())
        .filter(Boolean)
    ];

    const isCorrect = correctAnswers.includes(userAnswer);
    
    // Update progress arrays
    const completedQuestions: number[] = session.completed_questions || [];
    const incorrectQuestions: number[] = session.incorrect_questions || [];
    
    let newCompletedQuestions = [...completedQuestions];
    let newIncorrectQuestions = [...incorrectQuestions];
    let newCorrectCount = session.correct_count;
    let newIncorrectCount = session.incorrect_count;

    if (isCorrect) {
      // Add to completed if not already there
      if (!newCompletedQuestions.includes(questionIndex)) {
        newCompletedQuestions.push(questionIndex);
        newCorrectCount++;
      }
      // Remove from incorrect if it was there
      newIncorrectQuestions = newIncorrectQuestions.filter(q => q !== questionIndex);
    } else {
      // Add to incorrect if not already there
      if (!newIncorrectQuestions.includes(questionIndex)) {
        newIncorrectQuestions.push(questionIndex);
        newIncorrectCount++;
      }
    }

    // Calculate next question index
    const nextQuestionIndex = getNextQuestionIndex(
      session.current_question_index + 1,
      newCompletedQuestions,
      newIncorrectQuestions,
      totalQuestions
    );

    // Check if quiz is completed
    const isCompleted = newCompletedQuestions.length >= totalQuestions;

    // Update session in database
    const { error: updateError } = await supabase
      .from('user_sessions')
      .update({
        current_question_index: nextQuestionIndex,
        correct_count: newCorrectCount,
        incorrect_count: newIncorrectCount,
        completed_questions: newCompletedQuestions,
        incorrect_questions: newIncorrectQuestions,
        quiz_completed: isCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session:', updateError);
    }

    // Only fetch next question if needed and not completed
    let nextQuestion = null;
    if (!isCompleted && nextQuestionIndex >= 0 && nextQuestionIndex < totalQuestions) {
      const { data: nextQuestionData } = await supabase
        .from('questions')
        .select('*')
        .eq('drill_file_id', drillId)
        .eq('order_index', nextQuestionIndex)
        .single();
      
      if (nextQuestionData) {
        nextQuestion = formatQuestion(nextQuestionData, nextQuestionIndex);
      }
    }

    return NextResponse.json({
      correct: isCorrect,
      targetWord: currentQuestion.target_word,
      nextQuestion,
      progress: {
        correct: newCompletedQuestions.length,
        incorrect: newIncorrectQuestions.length,
        remaining: totalQuestions - newCompletedQuestions.length,
        total: totalQuestions,
        completed: isCompleted
      }
    });

  } catch (error) {
    console.error('Answer route error:', error);
    return NextResponse.json({ error: 'Failed to check answer' }, { status: 500 });
  }
}

function getNextQuestionIndex(
  currentIndex: number,
  completedQuestions: number[],
  incorrectQuestions: number[],
  totalQuestions: number
): number {
  const completedSet = new Set(completedQuestions);
  const incorrectSet = new Set(incorrectQuestions);

  // First pass: go through questions sequentially
  if (currentIndex < totalQuestions) {
    for (let i = currentIndex; i < totalQuestions; i++) {
      if (!completedSet.has(i)) {
        return i;
      }
    }
  }

  // Second pass: prioritize incorrect answers
  if (incorrectQuestions.length > 0) {
    const availableIncorrect = incorrectQuestions.filter(q => !completedSet.has(q));
    if (availableIncorrect.length > 0) {
      return availableIncorrect[Math.floor(Math.random() * availableIncorrect.length)];
    }
  }

  // Third pass: any remaining questions
  for (let i = 0; i < totalQuestions; i++) {
    if (!completedSet.has(i)) {
      return i;
    }
  }

  return -1; // No more questions
}

function formatQuestion(dbQuestion: any, questionIndex: number) {
  const blankSentence = dbQuestion.full_sentence.replace(dbQuestion.target_word, '_____');
  
  return {
    id: dbQuestion.id,
    questionIndex,
    blankSentence,
    prompt: dbQuestion.prompt,
    targetWord: dbQuestion.target_word,
    alternateAnswers: dbQuestion.alternate_answers 
      ? dbQuestion.alternate_answers.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [],
    hint: dbQuestion.hint || '',
    grammarConcept: dbQuestion.grammar_concept
  };
}
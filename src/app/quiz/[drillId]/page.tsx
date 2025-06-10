'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ExplanationModal from '@/components/ExplanationModal';

interface QuizQuestion {
  id: string;
  questionIndex: number;
  fullSentence: string;
  targetWord: string;
  blankSentence: string;
  prompt: string;
  alternateAnswers: string[];
  hint: string;
  grammarConcept: string;
}

interface DrillInfo {
  id: string;
  title: string;
  target_language: string;
  difficulty: string;
}

interface QuizState {
  currentQuestionIndex: number;
  correctAnswers: Set<number>;
  incorrectAnswers: Set<number>;
  questionOrder: number[];
  firstRoundComplete: boolean;
  lastShownQuestionIndex: number | null; // Track last question to prevent back-to-back
  totalQuestionsAnswered: number; // Total attempts across all questions
  totalCorrectResponses: number; // Total correct answers across all attempts
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const drillId = params.drillId as string;

  const [sessionId, setSessionId] = useState<string>('');
  const [drillInfo, setDrillInfo] = useState<DrillInfo | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    correctAnswers: new Set(),
    incorrectAnswers: new Set(),
    questionOrder: [],
    firstRoundComplete: false,
    lastShownQuestionIndex: null,
    totalQuestionsAnswered: 0,
    totalCorrectResponses: 0
  });
  
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{ 
    correct: boolean; 
    targetWord: string; 
    userAnswer: string;
    answeredQuestion: QuizQuestion;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  const startQuiz = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/quiz/${drillId}/start`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start quiz');
      }

      const data = await response.json();
      
      setSessionId(data.sessionId || '');
      setDrillInfo(data.drillFile);
      setQuestions(data.questions);
      
      // Create shuffled question order
      const shuffledOrder = Array.from({ length: data.questions.length }, (_, i) => i)
        .sort(() => Math.random() - 0.5);
      
      setQuizState({
        currentQuestionIndex: 0,
        correctAnswers: new Set(),
        incorrectAnswers: new Set(),
        questionOrder: shuffledOrder,
        firstRoundComplete: false,
        lastShownQuestionIndex: null,
        totalQuestionsAnswered: 0,
        totalCorrectResponses: 0
      });

      setQuizCompleted(false);
      setShowResult(false);
      setUserAnswer('');
      setLastResult(null);

    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [drillId]);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  const getNextSmartQuestionIndex = useCallback((state: QuizState, totalQuestions: number): number => {
    const incorrectQuestionIndices = Array.from(state.incorrectAnswers);
    const unansweredQuestionIndices = Array.from({ length: totalQuestions }, (_, i) => i)
      .filter(i => !state.correctAnswers.has(i) && !state.incorrectAnswers.has(i));
    const correctQuestionIndices = Array.from(state.correctAnswers);

    let candidateQuestionIndices: number[];

    if (unansweredQuestionIndices.length > 0) {
      // Still have unanswered questions - prioritize them + incorrect
      candidateQuestionIndices = [...incorrectQuestionIndices, ...unansweredQuestionIndices];
    } else if (incorrectQuestionIndices.length > 0) {
      // Only incorrect questions remain - mix with correct questions for extra practice
      // 60% chance of incorrect question, 40% chance of correct question for variety
      const useIncorrect = Math.random() < 0.6;
      
      if (useIncorrect) {
        candidateQuestionIndices = incorrectQuestionIndices;
      } else {
        // Mix in correct questions for practice
        candidateQuestionIndices = [...incorrectQuestionIndices, ...correctQuestionIndices];
      }
    } else {
      // All questions answered correctly - quiz should complete
      return -1;
    }

    // CRITICAL: Prevent back-to-back repetition
    if (state.lastShownQuestionIndex !== null) {
      candidateQuestionIndices = candidateQuestionIndices.filter(idx => idx !== state.lastShownQuestionIndex);
    }

    // If we filtered out everything (e.g., only one question left), allow it to prevent infinite loop
    if (candidateQuestionIndices.length === 0) {
      if (incorrectQuestionIndices.length > 0) {
        candidateQuestionIndices = incorrectQuestionIndices;
      } else if (unansweredQuestionIndices.length > 0) {
        candidateQuestionIndices = unansweredQuestionIndices;
      } else {
        return -1; // No questions available
      }
    }

    // Select randomly from candidates
    const randomIndex = Math.floor(Math.random() * candidateQuestionIndices.length);
    const selectedQuestionIndex = candidateQuestionIndices[randomIndex];
    
    // Convert question index to position in shuffled order
    const positionInOrder = state.questionOrder.indexOf(selectedQuestionIndex);
    return positionInOrder !== -1 ? positionInOrder : -1;
  }, []);

  const getCurrentQuestion = useCallback((): QuizQuestion | null => {
    if (!questions.length || quizCompleted) return null;
    
    const { questionOrder, currentQuestionIndex } = quizState;
    
    if (currentQuestionIndex < questionOrder.length) {
      const actualQuestionIndex = questionOrder[currentQuestionIndex];
      return questions[actualQuestionIndex];
    }
    
    return null;
  }, [questions, quizCompleted, quizState]);

  const saveResultsWithValues = useCallback(async (correctAnswers: Set<number>, incorrectAnswers: Set<number>) => {
    if (!sessionId) return;

    try {
      await fetch(`/api/quiz/${drillId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          results: {
            correctCount: correctAnswers.size,
            incorrectCount: incorrectAnswers.size,
            completedQuestions: Array.from(correctAnswers),
            incorrectQuestions: Array.from(incorrectAnswers)
          }
        })
      });
    } catch (error) {
      console.error('Error saving results:', error);
    }
  }, [sessionId, drillId]);

  const submitAnswer = useCallback(() => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !userAnswer.trim()) return;

    // Check if answer is correct
    const userAnswerLower = userAnswer.trim().toLowerCase();
    const correctAnswers = [
      currentQuestion.targetWord.toLowerCase(),
      ...currentQuestion.alternateAnswers.map(a => a.toLowerCase())
    ].filter(Boolean);

    const isCorrect = correctAnswers.includes(userAnswerLower);
    
    // Calculate new state values
    const newCorrectAnswers = new Set(quizState.correctAnswers);
    const newIncorrectAnswers = new Set(quizState.incorrectAnswers);
    
    if (isCorrect) {
      newCorrectAnswers.add(currentQuestion.questionIndex);
      newIncorrectAnswers.delete(currentQuestion.questionIndex);
    } else {
      newIncorrectAnswers.add(currentQuestion.questionIndex);
    }

    // Check completion: all questions answered correctly AND no more incorrect ones to practice
    const isCompleted = newCorrectAnswers.size >= questions.length && newIncorrectAnswers.size === 0;
    
    if (isCompleted) {
      setQuizCompleted(true);
      saveResultsWithValues(newCorrectAnswers, newIncorrectAnswers);
    }

    // Update state including last shown question and performance counters
    setQuizState(prev => ({
      ...prev,
      correctAnswers: newCorrectAnswers,
      incorrectAnswers: newIncorrectAnswers,
      lastShownQuestionIndex: currentQuestion.questionIndex,
      totalQuestionsAnswered: prev.totalQuestionsAnswered + 1,
      totalCorrectResponses: prev.totalCorrectResponses + (isCorrect ? 1 : 0)
    }));

    // Store result
    setLastResult({
      correct: isCorrect,
      targetWord: currentQuestion.targetWord,
      userAnswer: userAnswer.trim(),
      answeredQuestion: currentQuestion
    });
    
    setShowResult(true);
  }, [getCurrentQuestion, userAnswer, questions.length, quizState.correctAnswers, quizState.incorrectAnswers, saveResultsWithValues]);

  const nextQuestion = useCallback(() => {
    if (quizCompleted) {
      return;
    }

    setQuizState(prev => {
      let nextIndex = prev.currentQuestionIndex + 1;
      let firstRoundComplete = prev.firstRoundComplete;

      // If we've gone through all questions once, switch to smart selection
      if (nextIndex >= prev.questionOrder.length && !firstRoundComplete) {
        firstRoundComplete = true;
        nextIndex = getNextSmartQuestionIndex(prev, questions.length);
      } else if (firstRoundComplete) {
        nextIndex = getNextSmartQuestionIndex(prev, questions.length);
      }

      // If no valid next question, quiz should be completed
      if (nextIndex === -1) {
        setQuizCompleted(true);
        saveResultsWithValues(prev.correctAnswers, prev.incorrectAnswers);
        return prev;
      }

      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        firstRoundComplete
      };
    });

    setShowResult(false);
    setUserAnswer('');
    setLastResult(null);

    // Focus on input
    setTimeout(() => {
      const input = document.getElementById('answer') as HTMLInputElement;
      input?.focus();
    }, 100);
  }, [quizCompleted, getNextSmartQuestionIndex, questions.length, saveResultsWithValues]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        if (showResult) {
          nextQuestion();
        } else if (userAnswer.trim()) {
          submitAnswer();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showResult, userAnswer, nextQuestion, submitAnswer]);

  const overrideAnswer = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !lastResult) return;

    // Calculate new state values
    const newCorrectAnswers = new Set(quizState.correctAnswers);
    const newIncorrectAnswers = new Set(quizState.incorrectAnswers);
    
    newCorrectAnswers.add(currentQuestion.questionIndex);
    newIncorrectAnswers.delete(currentQuestion.questionIndex);

    // Check completion
    const isCompleted = newCorrectAnswers.size >= questions.length && newIncorrectAnswers.size === 0;
    
    if (isCompleted) {
      setQuizCompleted(true);
      saveResultsWithValues(newCorrectAnswers, newIncorrectAnswers);
    }

    // Update state
    setQuizState(prev => ({
      ...prev,
      correctAnswers: newCorrectAnswers,
      incorrectAnswers: newIncorrectAnswers,
      totalCorrectResponses: prev.totalCorrectResponses + 1 // Override counts as a correct response
    }));

    setLastResult({ ...lastResult, correct: true });
  };

  const getProgress = () => {
    const correct = quizState.correctAnswers.size;
    const incorrect = quizState.incorrectAnswers.size;
    const total = questions.length;
    const remaining = Math.max(0, total - correct); // Remaining unique questions to get right

    return { correct, incorrect, total, remaining, completed: quizCompleted };
  };

  const handleExplainConcept = () => {
    setShowExplanationModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const progress = getProgress();
  const currentQuestion = getCurrentQuestion();

  // Quiz completed
  if (quizCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-card border rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 Quiz Completed!</h1>
          <h2 className="text-xl mb-6">{drillInfo?.title}</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-muted p-4 rounded">
              <div className="text-2xl font-bold">{quizState.totalQuestionsAnswered}</div>
              <div className="text-sm text-muted-foreground">Total Questions Answered</div>
            </div>
            <div className="bg-muted p-4 rounded">
              <div className="text-2xl font-bold text-green-600">{quizState.totalCorrectResponses}</div>
              <div className="text-sm text-muted-foreground">Correct Responses</div>
            </div>
            <div className="bg-muted p-4 rounded">
              <div className="text-2xl font-bold">
                {quizState.totalQuestionsAnswered > 0 ? Math.round((quizState.totalCorrectResponses / quizState.totalQuestionsAnswered) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
          </div>

          <div className="space-x-4">
            <button
              onClick={startQuiz}
              className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Restart Quiz
            </button>
            <button
              onClick={() => router.push('/drills')}
              className="px-6 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
            >
              Back to Drills
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p>No more questions available.</p>
          <button
            onClick={() => router.push('/drills')}
            className="mt-4 px-4 py-2 bg-secondary text-secondary-foreground rounded"
          >
            Back to Drills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-6">
        <h1 className="text-2xl font-bold break-words flex-1 min-w-0">
          {drillInfo?.title}
        </h1>
        <button
          onClick={() => router.push('/drills')}
          className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 flex-shrink-0"
        >
          Quit Quiz
        </button>
      </div>

      {/* Progress */}
      <div className="bg-card border rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">
            {progress.total - progress.remaining}/{progress.total} mastered
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${((progress.total - progress.remaining) / progress.total) * 100}%` 
            }}
          />
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span>Mastered: {progress.correct}</span>
          <span>Practicing: {quizState.incorrectAnswers.size}</span>
          <span>Remaining: {progress.remaining}</span>
        </div>
      </div>

      {/* Question or Result */}
      <div className="bg-card border rounded-lg p-6">
        {!showResult ? (
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-2">{currentQuestion.prompt}</p>
              <h2 className="text-2xl text-center font-medium">
                {currentQuestion.blankSentence}
              </h2>
            </div>

            <div className="max-w-md mx-auto">
              <label htmlFor="answer" className="block text-sm font-medium mb-2">
                Your answer:
              </label>
              <div className="flex gap-2">
                <input
                  id="answer"
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="flex-1 px-3 py-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Type your answer..."
                  autoFocus
                />
                <button
                  onClick={submitAnswer}
                  disabled={!userAnswer.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                >
                  Check
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Press Enter to submit</p>
            </div>

            {currentQuestion.hint && (
              <details className="max-w-md mx-auto">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  💡 Show hint
                </summary>
                <p className="mt-2 text-sm bg-muted p-3 rounded">{currentQuestion.hint}</p>
              </details>
            )}
          </div>
        ) : lastResult ? (
          <div className="text-center space-y-6">
            <div className={`text-2xl font-bold ${lastResult.correct ? 'text-green-600' : 'text-red-600'}`}>
              {lastResult.correct ? '✅ Correct!' : '❌ Incorrect'}
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Question:</h3>
                  <p className="text-lg">{lastResult.answeredQuestion.blankSentence}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Your Answer:</h3>
                    <p className={`text-lg font-medium ${lastResult.correct ? 'text-green-600' : 'text-red-600'}`}>
                      {lastResult.userAnswer}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Correct Answer:</h3>
                    <p className="text-lg font-medium text-green-600">
                      {lastResult.targetWord}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Complete Sentence:</h3>
                  <p className="text-lg">
                    {lastResult.answeredQuestion.blankSentence.split('_____').map((part, index) => (
                      <span key={index}>
                        {part}
                        {index === 0 && (
                          <strong className="text-green-600">{lastResult.targetWord}</strong>
                        )}
                      </span>
                    ))}
                  </p>
                </div>

                {lastResult.answeredQuestion.alternateAnswers.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Alternative Answers:</h3>
                    <p className="text-sm">{lastResult.answeredQuestion.alternateAnswers.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-3 flex-wrap">
              <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                {quizCompleted ? 'View Results' : 'Next Question'} 
                <span className="text-xs ml-1">(Enter)</span>
              </button>
              
              {!lastResult.correct && !quizCompleted && (
                <button
                  onClick={overrideAnswer}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  ✓ Mark as Correct
                </button>
              )}
              
              <button
                onClick={handleExplainConcept}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                🧠 Explain Concept
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Explanation Modal */}
      {showResult && lastResult && (
        <ExplanationModal
          isOpen={showExplanationModal}
          onClose={() => setShowExplanationModal(false)}
          drillId={drillId}
          question={{
            blankSentence: lastResult.answeredQuestion.blankSentence,
            targetWord: lastResult.targetWord,
            grammarConcept: lastResult.answeredQuestion.grammarConcept,
            fullSentence: lastResult.answeredQuestion.fullSentence
          }}
          userAnswer={lastResult.userAnswer}
          targetLanguage={drillInfo?.target_language}
        />
      )}
    </div>
  );
}
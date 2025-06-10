import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const {
      question,
      userAnswer,
      targetWord,
      targetLanguage,
      grammarConcept,
      fullSentence
    } = await request.json();

    if (!question || !targetWord || !grammarConcept) {
      return NextResponse.json(
        { error: 'Missing required question data' },
        { status: 400 }
      );
    }

    console.log('=== Generating Grammar Explanation ===');
    console.log(`Concept: ${grammarConcept}`);
    console.log(`Language: ${targetLanguage || 'Unknown'}`);
    console.log(`Question: ${question}`);
    console.log(`Target: ${targetWord}`);
    console.log(`User answer: ${userAnswer || 'Not provided'}`);

    // Load prompt template
    console.log('Loading explanation prompt template...');
    const promptPath = join(process.cwd(), 'src/lib/prompts/grammar-explanation.txt');
    const promptTemplate = readFileSync(promptPath, 'utf-8');

    // Determine user answer section
    const userAnswerSection = userAnswer 
      ? `Student's Answer: ${userAnswer}`
      : 'Student\'s Answer: No answer provided';

    // Determine error or example section instruction - now more nuanced
    let errorOrExampleSection: string;
    if (!userAnswer) {
      errorOrExampleSection = 'Give 1-2 similar examples to help them practice this concept.';
    } else if (userAnswer.toLowerCase().trim() === targetWord.toLowerCase().trim()) {
      errorOrExampleSection = 'Give 1-2 similar examples to reinforce this concept.';
    } else {
      errorOrExampleSection = 'If their answer was actually wrong, explain why. If there are multiple correct answers possible, explain the differences between them.';
    }

    // Format the prompt with actual values
    const formattedPrompt = promptTemplate
      .replace(/{target_language}/g, targetLanguage || 'the target language')
      .replace(/{grammar_concept}/g, grammarConcept)
      .replace(/{question}/g, question)
      .replace(/{target_word}/g, targetWord)
      .replace(/{full_sentence}/g, fullSentence || question.replace('_____', targetWord))
      .replace(/{user_answer_section}/g, userAnswerSection)
      .replace(/{user_answer}/g, userAnswer || 'your answer')
      .replace(/{error_or_example_section}/g, errorOrExampleSection);

    console.log('Prompt formatted, calling AI...');

    // Create OpenAI client
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY!
    });

    const startTime = Date.now();

    // Call AI for explanation
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are an expert language teacher and grammar analyst. Your primary job is to determine what is actually grammatically correct, not just explain what the quiz says is correct. Quiz data can sometimes be wrong, and students may give valid alternative answers. Always validate grammar rules first, then explain. If a student was marked wrong but was actually right, tell them clearly to use the override button.'
        },
        {
          role: 'user',
          content: formattedPrompt
        }
      ],
      temperature: 0.3, // Low temperature for consistent, clear explanations
      max_tokens: 400   // Slightly higher to allow for good explanations
    });

    const duration = Date.now() - startTime;
    console.log(`Explanation generated in ${duration}ms`);

    const explanation = response.choices[0]?.message?.content;
    
    if (!explanation) {
      throw new Error('No explanation received from AI');
    }

    console.log('Explanation generated successfully');

    return NextResponse.json({
      success: true,
      explanation: explanation,
      // Include debug info for development (remove in production)
      debug: process.env.NODE_ENV === 'development' ? {
        promptUsed: formattedPrompt,
        userAnswer: userAnswer,
        targetWord: targetWord,
        grammarConcept: grammarConcept
      } : undefined
    });

  } catch (error) {
    console.error('=== Explanation Generation Error ===');
    console.error(error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate explanation'
      },
      { status: 500 }
    );
  }
}
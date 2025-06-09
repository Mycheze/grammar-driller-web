import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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

    // Create the explanation prompt
    const explanationPrompt = `You are explaining a grammar concept to a language learner. Keep your explanation extremely clear, concise, and practical.

Language: ${targetLanguage || 'Unknown'}
Grammar concept: ${grammarConcept}

Sentence with blank: ${question}
Correct answer: ${targetWord}
Full correct sentence: ${fullSentence}
${userAnswer ? `User's answer: ${userAnswer}` : ''}

Give a brief, clear explanation in 3-4 short paragraphs maximum:
1. First, explain THIS specific grammar rule in very simple terms
2. Explain why the correct answer (${targetWord}) works in this case
${userAnswer && userAnswer.toLowerCase() !== targetWord.toLowerCase() ? 
  '3. Explain why the user\'s answer was incorrect' : 
  '3. Give 1-2 similar examples to reinforce the concept'}
4. End with a practical tip for remembering this rule

FORMAT REQUIREMENTS:
- Use plain, everyday language - imagine explaining to a friend
- Keep it short: aim for about 150 words total
- Use short sentences and paragraphs (1-3 sentences per paragraph)
- Use **bold** for key terms and rules
- Provide practical advice, not theoretical linguistics`;

    // Create OpenAI client
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY!
    });

    const startTime = Date.now();

    // Call AI for explanation (using deepseek-chat for faster response)
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful language learning assistant. Your explanations are clear, concise, and educational. Always use markdown formatting for better readability.'
        },
        {
          role: 'user',
          content: explanationPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent explanations
      max_tokens: 500   // Keep explanations concise
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
      explanation: explanation
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
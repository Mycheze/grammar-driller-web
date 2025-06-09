import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params before using

    // Fetch drill file
    const { data: drillFile, error: drillError } = await supabase
      .from('drill_files')
      .select('*')
      .eq('id', id)
      .single();

    if (drillError) {
      console.error('Error fetching drill file:', drillError);
      return NextResponse.json(
        { error: 'Drill file not found' },
        { status: 404 }
      );
    }

    // Fetch questions for this drill file
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('drill_file_id', id)
      .order('order_index');

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      drillFile,
      questions: questions || [],
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete the drill file (questions will be deleted automatically due to CASCADE)
    const { error } = await supabase
      .from('drill_files')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting drill file:', error);
      return NextResponse.json(
        { error: 'Failed to delete drill file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Drill file deleted successfully',
    });

  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
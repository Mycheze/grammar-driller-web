import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    // Simple query - get all drill files, no filtering
    const { data: drillFiles, error } = await supabase
      .from('drill_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching drill files:', error);
      return NextResponse.json(
        { error: 'Failed to fetch drill files' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      drillFiles: drillFiles || [],
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
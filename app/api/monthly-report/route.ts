import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { generateMonthlyAISummary } from '@/lib/openai';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) {
      return NextResponse.json(
        { error: 'month and year are required' },
        { status: 400 }
      );
    }

    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
    const endYear =
      parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

    const supabase = createServerSupabaseClient();
    const { data: incidents, error } = await supabase
      .from('incidents')
      .select('*')
      .gte('incident_date', startDate)
      .lt('incident_date', endDate)
      .order('incident_date', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch incidents' },
        { status: 500 }
      );
    }

    const typeCounts: Record<string, number> = {};
    incidents?.forEach((inc) => {
      typeCounts[inc.incident_type] =
        (typeCounts[inc.incident_type] || 0) + 1;
    });

    const topIncidentTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));

    const slaBreaches = incidents?.filter((i) => i.sla_met === 'No').length || 0;
    const slaMet = incidents?.filter((i) => i.sla_met === 'Yes').length || 0;

    const monthName = new Date(parseInt(year), parseInt(month) - 1, 1)
      .toLocaleString('default', { month: 'long' });

    const aiSummary = await generateMonthlyAISummary(
      incidents || [],
      monthName,
      year
    );

    return NextResponse.json({
      month: monthName,
      year,
      totalIncidents: incidents?.length || 0,
      topIncidentTypes,
      slaBreaches,
      slaMet,
      aiSummary,
      incidents: incidents || [],
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

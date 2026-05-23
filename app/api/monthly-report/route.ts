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

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
    const endMonthNum = monthNum === 12 ? 1 : monthNum + 1;
    const endYearNum = monthNum === 12 ? yearNum + 1 : yearNum;
    const endDate = `${endYearNum}-${String(endMonthNum).padStart(2, '0')}-01`;

    let incidents: Record<string, unknown>[] = [];
    try {
      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .gte('incident_date', startDate)
        .lt('incident_date', endDate)
        .order('incident_date', { ascending: true });

      if (error) {
        console.error('Supabase error:', JSON.stringify(error));
        return NextResponse.json(
          { error: `Database error: ${error.message}` },
          { status: 500 }
        );
      }
      incidents = data || [];
    } catch (dbErr) {
      console.error('DB connection error:', dbErr);
      return NextResponse.json(
        { error: 'Could not connect to database. Check Supabase environment variables.' },
        { status: 500 }
      );
    }

    // Aggregate stats
    const typeCounts: Record<string, number> = {};
    const agencyCounts: Record<string, number> = {};
    incidents.forEach((inc) => {
      const type = inc.incident_type as string;
      const agency = inc.vvip_agency_name as string;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      agencyCounts[agency] = (agencyCounts[agency] || 0) + 1;
    });

    const topIncidentTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    const agencyBreakdown = Object.entries(agencyCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([agency, count]) => ({ agency, count }));

    const slaBreaches = incidents.filter((i) => i.sla_met === 'No').length;
    const slaMet = incidents.filter((i) => i.sla_met === 'Yes').length;
    const urgentCount = incidents.filter((i) => i.urgency === true).length;

    const monthName = new Date(yearNum, monthNum - 1, 1).toLocaleString('default', {
      month: 'long',
    });

    let aiSummary = '';
    try {
      aiSummary = await generateMonthlyAISummary(incidents as never, monthName, year);
    } catch (aiErr) {
      console.error('AI summary error:', aiErr);
      aiSummary = `Report generated for ${monthName} ${year}. Total incidents: ${incidents.length}. SLA Met: ${slaMet}. SLA Breached: ${slaBreaches}.`;
    }

    return NextResponse.json({
      month: monthName,
      year,
      totalIncidents: incidents.length,
      urgentCount,
      topIncidentTypes,
      agencyBreakdown,
      slaBreaches,
      slaMet,
      aiSummary,
      incidents,
    });
  } catch (err) {
    console.error('Monthly report unexpected error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 }
    );
  }
}

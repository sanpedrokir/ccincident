import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { sendDailyAgencyReport } from '@/lib/email';

const TARGET_AGENCIES = ['MOF', 'MOM'];

// Triggered by Vercel Cron at 14:00 UTC = 22:00 SGT
// vercel.json cron: "0 14 * * *"
export async function GET(request: NextRequest) {
  // Protect the cron endpoint
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const todaySGT = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Singapore',
    });

    const supabase = createServerSupabaseClient();
    const results: Record<string, string> = {};

    for (const agency of TARGET_AGENCIES) {
      const { data: incidents, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('vvip_agency_name', agency)
        .eq('incident_date', todaySGT);

      if (error) {
        console.error(`Error fetching incidents for ${agency}:`, error);
        results[agency] = `error: ${error.message}`;
        continue;
      }

      if (!incidents || incidents.length === 0) {
        results[agency] = 'no incidents today — skipped';
        continue;
      }

      try {
        await sendDailyAgencyReport(agency, incidents);
        results[agency] = `email sent for ${incidents.length} incident(s)`;
      } catch (emailError) {
        console.error(`Email failed for ${agency}:`, emailError);
        results[agency] = 'email send failed';
      }
    }

    return NextResponse.json({
      date: todaySGT,
      results,
    });
  } catch (err) {
    console.error('Daily report error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

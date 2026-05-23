import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { calculateSLA } from '@/lib/sla';
import { sendUrgentIncidentEmail } from '@/lib/email';
import { IncidentFormData } from '@/types/incident';

export async function POST(request: NextRequest) {
  try {
    const body: IncidentFormData = await request.json();

    const {
      vvip_name,
      vvip_agency_name,
      engineer_name,
      incident_type,
      incident_detail,
      urgency,
      incident_date,
      time_of_call,
      resolution_completion_date,
      resolution_completion_time,
    } = body;

    if (
      !vvip_name ||
      !vvip_agency_name ||
      !engineer_name ||
      !incident_type ||
      !incident_detail ||
      !incident_date ||
      !time_of_call ||
      !resolution_completion_date ||
      !resolution_completion_time
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const { sla_met, incident_start_datetime, resolution_completion_datetime } =
      calculateSLA(
        incident_date,
        time_of_call,
        resolution_completion_date,
        resolution_completion_time
      );

    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Singapore',
    });

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        vvip_name,
        vvip_agency_name,
        engineer_name,
        incident_type,
        incident_detail,
        urgency,
        incident_date,
        time_of_call,
        resolution_completion_date,
        resolution_completion_time,
        form_entry_date: today,
        incident_start_datetime: incident_start_datetime.toISOString(),
        resolution_completion_datetime:
          resolution_completion_datetime.toISOString(),
        sla_met,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message} (code: ${error.code})` },
        { status: 500 }
      );
    }

    let emailStatus: string | null = null;
    if (urgency && data) {
      try {
        const emailResult = await sendUrgentIncidentEmail(data);
        emailStatus = 'sent';
        console.log('Urgent email sent:', emailResult);
      } catch (emailError) {
        const msg = emailError instanceof Error ? emailError.message : String(emailError);
        emailStatus = `failed: ${msg}`;
        console.error('Email send failed:', msg);
      }
    }

    return NextResponse.json({ incident: data, emailStatus }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const agency = searchParams.get('agency');
    const urgency = searchParams.get('urgency');
    const sla_met = searchParams.get('sla_met');

    const supabase = createServerSupabaseClient();
    let query = supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (month && year) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
      const endYear =
        parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
      query = query
        .gte('incident_date', startDate)
        .lt('incident_date', endDate);
    }

    if (agency) query = query.eq('vvip_agency_name', agency);
    if (urgency === 'true') query = query.eq('urgency', true);
    if (urgency === 'false') query = query.eq('urgency', false);
    if (sla_met) query = query.eq('sla_met', sla_met);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: `Database error: ${error.message} (code: ${error.code})` },
        { status: 500 }
      );
    }

    return NextResponse.json({ incidents: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

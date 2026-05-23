import { Resend } from 'resend';
import { Incident } from '@/types/incident';

function clean(val: string | undefined): string {
  return (val || '').replace(/^﻿/, '').trim();
}

function getResend(): Resend {
  return new Resend(clean(process.env.EMAIL_API_KEY) || 'placeholder');
}

const FROM_EMAIL = () => clean(process.env.EMAIL_FROM) || 'onboarding@resend.dev';
const ALERT_EMAIL = 'sanpedrobeach9@gmail.com';

export async function sendUrgentIncidentEmail(incident: Incident) {
  const subject = `Urgent CC Incident Alert - ${incident.vvip_agency_name}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc2626; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">🚨 Urgent CC Incident Alert</h1>
        <p style="margin: 4px 0 0; opacity: 0.9;">${incident.vvip_agency_name}</p>
      </div>
      <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 40%;">VVIP Name</td>
            <td style="padding: 8px 0; color: #111827;">${incident.vvip_name}</td>
          </tr>
          <tr style="background: #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #374151;">VVIP Agency</td>
            <td style="padding: 8px; color: #111827;">${incident.vvip_agency_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Engineer Name</td>
            <td style="padding: 8px 0; color: #111827;">${incident.engineer_name}</td>
          </tr>
          <tr style="background: #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #374151;">Incident Type</td>
            <td style="padding: 8px; color: #111827;">${incident.incident_type}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151; vertical-align: top;">Incident Detail</td>
            <td style="padding: 8px 0; color: #111827;">${incident.incident_detail}</td>
          </tr>
          <tr style="background: #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #374151;">Date of Incident</td>
            <td style="padding: 8px; color: #111827;">${incident.incident_date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Time of Call</td>
            <td style="padding: 8px 0; color: #111827;">${incident.time_of_call}</td>
          </tr>
          <tr style="background: #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #374151;">Resolution Date</td>
            <td style="padding: 8px; color: #111827;">${incident.resolution_completion_date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Resolution Time</td>
            <td style="padding: 8px 0; color: #111827;">${incident.resolution_completion_time}</td>
          </tr>
          <tr style="background: #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #374151;">SLA Met</td>
            <td style="padding: 8px;">
              <span style="background: ${incident.sla_met === 'Yes' ? '#dcfce7' : '#fee2e2'}; color: ${incident.sla_met === 'Yes' ? '#166534' : '#991b1b'}; padding: 2px 10px; border-radius: 12px; font-weight: bold;">
                ${incident.sla_met}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Date of Form Entry</td>
            <td style="padding: 8px 0; color: #111827;">${incident.form_entry_date}</td>
          </tr>
        </table>
      </div>
      <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">This is an automated alert from CC Incident Management System.</p>
    </div>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL(),
    to: [ALERT_EMAIL],
    subject,
    html,
  });
}

export async function sendDailyAgencyReport(
  agencyName: string,
  incidents: Incident[]
) {
  const subject = `Daily Report - ${agencyName}`;
  const today = new Date().toLocaleDateString('en-SG', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const incidentRows = incidents
    .map(
      (inc) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${inc.incident_type}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${inc.incident_detail}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${inc.resolution_completion_date} ${inc.resolution_completion_time}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">
          <span style="background: ${inc.sla_met === 'Yes' ? '#dcfce7' : '#fee2e2'}; color: ${inc.sla_met === 'Yes' ? '#166534' : '#991b1b'}; padding: 2px 8px; border-radius: 10px; font-size: 12px;">
            ${inc.sla_met}
          </span>
        </td>
      </tr>
    `
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
      <div style="background: #1e3a5f; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">Daily CC Incident Report</h1>
        <p style="margin: 4px 0 0; opacity: 0.85;">${agencyName} — ${today}</p>
      </div>
      <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="color: #374151;"><strong>Agency:</strong> ${agencyName}</p>
        <p style="color: #374151;"><strong>Total Incidents Today:</strong> ${incidents.length}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <thead>
            <tr style="background: #1e3a5f; color: white;">
              <th style="padding: 10px 8px; text-align: left; border: 1px solid #1e3a5f;">Incident Type</th>
              <th style="padding: 10px 8px; text-align: left; border: 1px solid #1e3a5f;">Detail</th>
              <th style="padding: 10px 8px; text-align: left; border: 1px solid #1e3a5f;">Resolution Date & Time</th>
              <th style="padding: 10px 8px; text-align: center; border: 1px solid #1e3a5f;">SLA Met</th>
            </tr>
          </thead>
          <tbody>
            ${incidentRows}
          </tbody>
        </table>
      </div>
      <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">This is an automated daily report from CC Incident Management System.</p>
    </div>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL(),
    to: [ALERT_EMAIL],
    subject,
    html,
  });
}

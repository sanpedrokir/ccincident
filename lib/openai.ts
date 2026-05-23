import OpenAI from 'openai';
import { Incident } from '@/types/incident';

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function generateMonthlyAISummary(
  incidents: Incident[],
  month: string,
  year: string
): Promise<string> {
  const client = getOpenAIClient();
  if (!client) {
    return generateFallbackSummary(incidents, month, year);
  }

  const totalIncidents = incidents.length;
  const slaBreaches = incidents.filter((i) => i.sla_met === 'No').length;
  const slaMet = incidents.filter((i) => i.sla_met === 'Yes').length;
  const urgentCount = incidents.filter((i) => i.urgency).length;

  const typeCounts: Record<string, number> = {};
  incidents.forEach((inc) => {
    typeCounts[inc.incident_type] = (typeCounts[inc.incident_type] || 0) + 1;
  });

  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, count]) => `${type} (${count})`)
    .join(', ');

  const agencyCounts: Record<string, number> = {};
  incidents.forEach((inc) => {
    agencyCounts[inc.vvip_agency_name] =
      (agencyCounts[inc.vvip_agency_name] || 0) + 1;
  });

  const agencySummary = Object.entries(agencyCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([agency, count]) => `${agency}: ${count}`)
    .join(', ');

  const incidentLines = incidents.map((inc, i) =>
    `Incident ${i + 1}: Customer: ${inc.vvip_name}, Agency: ${inc.vvip_agency_name}, Type: ${inc.incident_type}, Detail: ${inc.incident_detail}, Urgent: ${inc.urgency ? 'Yes' : 'No'}, SLA Met: ${inc.sla_met}, Date: ${inc.incident_date}`
  ).join('\n');

  const prompt = `You are a professional IT service management analyst writing a monthly incident report for the Customer Care (CC) engineering team.

Period: ${month} ${year}
Total incidents: ${totalIncidents} | Urgent: ${urgentCount} | SLA Met: ${slaMet} (${totalIncidents > 0 ? Math.round((slaMet / totalIncidents) * 100) : 0}%) | SLA Breached: ${slaBreaches}
Top incident types: ${topTypes || 'N/A'}
Incidents by agency: ${agencySummary || 'N/A'}

Individual incidents:
${incidentLines || 'No incidents recorded.'}

Write a structured management summary with these sections:

**Overview**
One paragraph on overall incident volume, urgency level, and month's activity.

**Individual Incident Analysis**
For each incident, write a short dedicated paragraph (2-3 sentences) describing what happened, the customer/agency affected, and whether SLA was met. Clearly separate each incident.

**SLA Performance**
One paragraph assessing SLA compliance for the month.

**Observations & Recommendations**
One paragraph with key patterns noticed and actionable recommendations.

Use only the data provided. Be concise, professional, and factual.`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
    });
    return (
      completion.choices[0]?.message?.content ||
      generateFallbackSummary(incidents, month, year)
    );
  } catch {
    return generateFallbackSummary(incidents, month, year);
  }
}

function generateFallbackSummary(
  incidents: Incident[],
  month: string,
  year: string
): string {
  const total = incidents.length;
  const slaBreaches = incidents.filter((i) => i.sla_met === 'No').length;
  const slaMet = incidents.filter((i) => i.sla_met === 'Yes').length;
  const slaRate = total > 0 ? Math.round((slaMet / total) * 100) : 0;
  const urgentCount = incidents.filter((i) => i.urgency).length;

  const typeCounts: Record<string, number> = {};
  incidents.forEach((inc) => {
    typeCounts[inc.incident_type] = (typeCounts[inc.incident_type] || 0) + 1;
  });
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

  if (total === 0) {
    return `No incidents were recorded for ${month} ${year}. The CC team maintained service availability with no reported VVIP support requests during this period.`;
  }

  return `During ${month} ${year}, the CC team handled a total of ${total} VVIP incident${total !== 1 ? 's' : ''}, of which ${urgentCount} were classified as urgent. This reflects the ongoing support demand from senior management stakeholders.

${topType ? `The most frequently occurring incident type was "${topType[0]}" with ${topType[1]} occurrence${topType[1] !== 1 ? 's' : ''}, indicating a recurring area that may benefit from proactive measures or additional resources.` : ''}

SLA performance for the period stood at ${slaRate}%, with ${slaMet} incident${slaMet !== 1 ? 's' : ''} resolved within the 24-hour target and ${slaBreaches} breach${slaBreaches !== 1 ? 'es' : ''} recorded. ${slaRate < 80 ? 'The SLA compliance rate warrants attention and a review of escalation procedures may be beneficial.' : slaRate === 100 ? 'Excellent SLA compliance was achieved for the period.' : 'SLA performance remains within acceptable thresholds.'}

Overall, the CC team demonstrated continued commitment to VVIP support excellence. Ongoing monitoring of incident trends and proactive engagement with frequently affected agencies is recommended to maintain service quality.`;
}

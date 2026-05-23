export interface Incident {
  id: string;
  vvip_name: string;
  vvip_agency_name: string;
  engineer_name: string;
  incident_type: string;
  incident_detail: string;
  urgency: boolean;
  incident_date: string;
  time_of_call: string;
  resolution_completion_date: string;
  resolution_completion_time: string;
  form_entry_date: string;
  incident_start_datetime: string;
  resolution_completion_datetime: string;
  sla_met: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentFormData {
  vvip_name: string;
  vvip_agency_name: string;
  engineer_name: string;
  incident_type: string;
  incident_detail: string;
  urgency: boolean;
  incident_date: string;
  time_of_call: string;
  resolution_completion_date: string;
  resolution_completion_time: string;
}

export interface MonthlyReportData {
  month: string;
  year: string;
  totalIncidents: number;
  urgentCount: number;
  topIncidentTypes: { type: string; count: number }[];
  agencyBreakdown: { agency: string; count: number }[];
  slaBreaches: number;
  slaMet: number;
  aiSummary: string;
  incidents: Incident[];
}

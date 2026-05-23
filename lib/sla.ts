// Combine date + time strings (SGT) into a JS Date
export function combineDateTimeToUTC(date: string, time: string): Date {
  // date: "YYYY-MM-DD", time: "HH:MM" or "HH:MM:SS"
  // Treat as Singapore time (UTC+8)
  const isoString = `${date}T${time.length === 5 ? time + ':00' : time}+08:00`;
  return new Date(isoString);
}

export function calculateSLA(
  incidentDate: string,
  timeOfCall: string,
  resolutionDate: string,
  resolutionTime: string
): { sla_met: string; incident_start_datetime: Date; resolution_completion_datetime: Date } {
  const incident_start_datetime = combineDateTimeToUTC(incidentDate, timeOfCall);
  const resolution_completion_datetime = combineDateTimeToUTC(resolutionDate, resolutionTime);

  const diffMs = resolution_completion_datetime.getTime() - incident_start_datetime.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  const sla_met = diffHours <= 24 ? 'Yes' : 'No';

  return { sla_met, incident_start_datetime, resolution_completion_datetime };
}

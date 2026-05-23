'use client';

import { useState } from 'react';
import { MonthlyReportData, Incident } from '@/types/incident';

const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' },
  { value: '3', label: 'March' }, { value: '4', label: 'April' },
  { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' },
  { value: '9', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
];

function formatTime(t: string) {
  if (!t) return '-';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

export default function MonthlyReport() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [report, setReport] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => String(currentYear - i));

  const generateReport = async () => {
    if (!month || !year) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/monthly-report?month=${month}&year=${year}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate report');
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const slaRate = report && report.totalIncidents > 0
    ? Math.round((report.slaMet / report.totalIncidents) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Select Report Period</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]">
              {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]">
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={generateReport} disabled={loading}
            className="px-5 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#162d4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {report && (
        <>
          {/* Report Header */}
          <div className="bg-[#1e3a5f] text-white rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">CC Monthly Incident Report</h2>
                <p className="text-white/70 mt-1">{report.month} {report.year}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs">Generated</p>
                <p className="text-white/90 text-sm">
                  {new Date().toLocaleDateString('en-SG', { timeZone: 'Asia/Singapore' })}
                </p>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Total Incidents" value={report.totalIncidents} color="bg-blue-50 border-blue-100" textColor="text-blue-700"
              icon={<svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>} />
            <KPICard label="Urgent" value={report.urgentCount} color="bg-red-50 border-red-100" textColor="text-red-700"
              icon={<svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
            <KPICard label="SLA Met" value={report.slaMet} color="bg-green-50 border-green-100" textColor="text-green-700"
              icon={<svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <KPICard label="SLA Rate" value={`${slaRate}%`} color={slaRate >= 80 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'} textColor={slaRate >= 80 ? 'text-green-700' : 'text-orange-700'}
              icon={<svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
          </div>

          {/* Charts Row */}
          {report.totalIncidents > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Incident Types Chart */}
              <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Incidents by Type
                </h3>
                {report.topIncidentTypes.length === 0 ? (
                  <p className="text-gray-400 text-sm">No data</p>
                ) : (
                  <div className="space-y-3">
                    {report.topIncidentTypes.map((item) => {
                      const maxCount = report.topIncidentTypes[0]?.count || 1;
                      const pct = Math.round((item.count / maxCount) * 100);
                      const totalPct = Math.round((item.count / report.totalIncidents) * 100);
                      return (
                        <div key={item.type}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 truncate max-w-[70%]">{item.type}</span>
                            <span className="text-gray-500 flex-shrink-0 ml-2">{item.count} ({totalPct}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div className="bg-[#1e3a5f] h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SLA Donut */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  SLA Performance
                </h3>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <SLADonut met={report.slaMet} breached={report.slaBreaches} rate={slaRate} />
                </div>
              </div>
            </div>
          )}

          {/* Agency Breakdown */}
          {report.agencyBreakdown.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Incidents by Agency
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {report.agencyBreakdown.map((item) => {
                  const pct = Math.round((item.count / report.totalIncidents) * 100);
                  return (
                    <div key={item.agency} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-gray-800">{item.agency}</span>
                        <span className="text-lg font-bold text-[#1e3a5f]">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-[#1e3a5f] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{pct}% of total</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Individual Incidents */}
          {report.incidents.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                All Incidents — {report.month} {report.year}
                <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
                  {report.incidents.length} total
                </span>
              </h3>
              <div className="space-y-3">
                {report.incidents.map((inc: Incident, idx: number) => (
                  <IncidentCard key={inc.id} incident={inc} index={idx + 1} />
                ))}
              </div>
            </div>
          )}

          {/* AI Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Management Summary
              <span className="ml-auto text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-normal">AI Generated</span>
            </h3>
            <div className="text-gray-700 text-sm leading-relaxed space-y-3">
              {report.aiSummary.split('\n\n').map((block, i) => {
                const trimmed = block.trim();
                if (!trimmed) return null;
                // Render **Heading** lines as bold headers
                if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                  return (
                    <p key={i} className="font-semibold text-gray-900 mt-4 first:mt-0">
                      {trimmed.replace(/\*\*/g, '')}
                    </p>
                  );
                }
                // Render lines with **bold** inline
                const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
                return (
                  <p key={i}>
                    {parts.map((part, j) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={j}>{part.replace(/\*\*/g, '')}</strong>
                        : part
                    )}
                  </p>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KPICard({ label, value, color, textColor, icon }: {
  label: string; value: string | number; color: string; textColor: string; icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border p-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}

function SLADonut({ met, breached, rate }: { met: number; breached: number; rate: number }) {
  const total = met + breached;
  if (total === 0) return <p className="text-gray-400 text-sm">No data</p>;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const metDash = (met / total) * circumference;
  const breachedDash = (breached / total) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r={radius} fill="none" stroke="#fee2e2" strokeWidth="14" />
          <circle cx="55" cy="55" r={radius} fill="none" stroke="#22c55e" strokeWidth="14"
            strokeDasharray={`${metDash} ${circumference}`}
            strokeDashoffset={circumference * 0.25}
            transform="rotate(-90 55 55)"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
          {breached > 0 && (
            <circle cx="55" cy="55" r={radius} fill="none" stroke="#ef4444" strokeWidth="14"
              strokeDasharray={`${breachedDash} ${circumference}`}
              strokeDashoffset={circumference * 0.25 - metDash}
              transform="rotate(-90 55 55)"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${rate >= 80 ? 'text-green-700' : 'text-orange-600'}`}>{rate}%</span>
          <span className="text-xs text-gray-400">SLA</span>
        </div>
      </div>
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-gray-600">Met ({met})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="text-gray-600">Breached ({breached})</span>
        </div>
      </div>
    </div>
  );
}

function IncidentCard({ incident: inc, index }: { incident: Incident; index: number }) {
  return (
    <div className={`rounded-lg border p-4 ${inc.urgency ? 'border-red-200 bg-red-50/30' : 'border-gray-100 bg-gray-50/50'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded">#{index}</span>
          <span className="text-sm font-semibold text-gray-800">{inc.vvip_name}</span>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">{inc.vvip_agency_name}</span>
          {inc.urgency && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">URGENT</span>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
          inc.sla_met === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          SLA {inc.sla_met === 'Yes' ? 'Met' : 'Breached'}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
        <div><span className="font-medium text-gray-500">Engineer:</span> {inc.engineer_name}</div>
        <div><span className="font-medium text-gray-500">Type:</span> {inc.incident_type}</div>
        <div><span className="font-medium text-gray-500">Incident:</span> {inc.incident_date} at {formatTime(inc.time_of_call)}</div>
        <div><span className="font-medium text-gray-500">Resolved:</span> {inc.resolution_completion_date} at {formatTime(inc.resolution_completion_time)}</div>
      </div>
      <div className="text-xs text-gray-600 bg-white rounded border border-gray-100 px-3 py-2">
        <span className="font-medium text-gray-500">Detail: </span>{inc.incident_detail}
      </div>
    </div>
  );
}

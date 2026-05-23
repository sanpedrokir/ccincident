'use client';

import { useState, useEffect, useCallback } from 'react';
import { Incident } from '@/types/incident';

const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' },
  { value: '3', label: 'March' }, { value: '4', label: 'April' },
  { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' },
  { value: '9', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
];

export default function IncidentTable() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1));
  const [filterYear, setFilterYear] = useState(String(now.getFullYear()));
  const [filterAgency, setFilterAgency] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterSLA, setFilterSLA] = useState('');

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterMonth && filterYear) {
        params.set('month', filterMonth);
        params.set('year', filterYear);
      }
      if (filterAgency) params.set('agency', filterAgency);
      if (filterUrgency) params.set('urgency', filterUrgency);
      if (filterSLA) params.set('sla_met', filterSLA);

      const res = await fetch(`/api/incidents?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIncidents(data.incidents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  }, [filterMonth, filterYear, filterAgency, filterUrgency, filterSLA]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const uniqueAgencies = Array.from(new Set(incidents.map((i) => i.vvip_agency_name))).sort();

  const formatTime = (t: string) => {
    if (!t) return '-';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => String(currentYear - i));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            >
              <option value="">All months</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            >
              <option value="">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Agency</label>
            <select
              value={filterAgency}
              onChange={(e) => setFilterAgency(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            >
              <option value="">All agencies</option>
              {uniqueAgencies.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Urgency</label>
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            >
              <option value="">All</option>
              <option value="true">Urgent</option>
              <option value="false">Non-urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">SLA Status</label>
            <select
              value={filterSLA}
              onChange={(e) => setFilterSLA(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            >
              <option value="">All</option>
              <option value="Yes">SLA Met</option>
              <option value="No">SLA Breached</option>
            </select>
          </div>

          <button
            onClick={() => {
              setFilterMonth('');
              setFilterYear('');
              setFilterAgency('');
              setFilterUrgency('');
              setFilterSLA('');
            }}
            className="px-3 py-1.5 text-sm text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>

          <button
            onClick={fetchIncidents}
            className="px-3 py-1.5 text-sm bg-[#1e3a5f] text-white rounded-md hover:bg-[#162d4a] transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: incidents.length, color: 'text-gray-800' },
            { label: 'Urgent', value: incidents.filter((i) => i.urgency).length, color: 'text-red-600' },
            { label: 'SLA Met', value: incidents.filter((i) => i.sla_met === 'Yes').length, color: 'text-green-600' },
            { label: 'SLA Breached', value: incidents.filter((i) => i.sla_met === 'No').length, color: 'text-orange-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <svg className="w-6 h-6 animate-spin text-[#1e3a5f]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48 text-red-500 text-sm">{error}</div>
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No incidents found</p>
          </div>
        ) : (
          <div>
          <p className="md:hidden text-xs text-gray-400 px-4 pt-3 pb-1">← Scroll to see all columns</p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    'Customer Name', 'Agency', 'Engineer', 'Incident Type',
                    'Detail', 'Urgency', 'Incident Date', 'Call Time',
                    'Resolution Date', 'Resolution Time', 'Entry Date', 'SLA Met',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">{inc.vvip_name}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                        {inc.vvip_agency_name}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{inc.engineer_name}</td>
                    <td className="px-3 py-3 text-gray-700 whitespace-nowrap max-w-[160px] truncate" title={inc.incident_type}>
                      {inc.incident_type}
                    </td>
                    <td className="px-3 py-3 text-gray-600 max-w-[200px]">
                      <p className="line-clamp-2" title={inc.incident_detail}>{inc.incident_detail}</p>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {inc.urgency ? (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">URGENT</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">Normal</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{inc.incident_date}</td>
                    <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{formatTime(inc.time_of_call)}</td>
                    <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{inc.resolution_completion_date}</td>
                    <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{formatTime(inc.resolution_completion_time)}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap text-xs">{inc.form_entry_date}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        inc.sla_met === 'Yes'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {inc.sla_met === 'Yes' ? 'Met' : 'Breached'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

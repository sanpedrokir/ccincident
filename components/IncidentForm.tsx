'use client';

import { useState } from 'react';
import { IncidentFormData } from '@/types/incident';

const INCIDENT_TYPES = [
  'Network Connectivity Issue',
  'Hardware Failure',
  'Software / Application Error',
  'Account Access / Login Issue',
  'Email / Communication Issue',
  'Printer / Peripheral Issue',
  'Security Incident',
  'System Performance Issue',
  'Data / File Issue',
  'Video Conferencing Issue',
  'Other',
];

const defaultForm: IncidentFormData = {
  vvip_name: '',
  vvip_agency_name: '',
  engineer_name: '',
  incident_type: '',
  incident_detail: '',
  urgency: false,
  incident_date: '',
  time_of_call: '',
  resolution_completion_date: '',
  resolution_completion_time: '',
};

function isResolutionBeforeIncident(form: IncidentFormData): boolean {
  if (!form.incident_date || !form.time_of_call || !form.resolution_completion_date || !form.resolution_completion_time) return false;
  const start = new Date(`${form.incident_date}T${form.time_of_call}:00+08:00`);
  const end = new Date(`${form.resolution_completion_date}T${form.resolution_completion_time}:00+08:00`);
  return end <= start;
}

export default function IncidentForm() {
  const [form, setForm] = useState<IncidentFormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolutionError, setResolutionError] = useState<string | null>(null);

  const todaySGT = new Date().toLocaleDateString('en-SG', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const updated = {
      ...form,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    };
    setForm(updated);

    // Validate resolution vs incident datetime whenever any of the 4 fields change
    if (['incident_date', 'time_of_call', 'resolution_completion_date', 'resolution_completion_time'].includes(name)) {
      if (
        updated.incident_date &&
        updated.time_of_call &&
        updated.resolution_completion_date &&
        updated.resolution_completion_time
      ) {
        if (isResolutionBeforeIncident(updated)) {
          setResolutionError('Resolution date/time must be after the date and time of incident.');
        } else {
          setResolutionError(null);
        }
      } else {
        setResolutionError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isResolutionBeforeIncident(form)) {
      setResolutionError('Resolution date/time must be after the date and time of incident.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit incident');
        return;
      }

      setSuccess(true);
      setEmailStatus(data.emailStatus ?? null);
      setForm(defaultForm);
      setResolutionError(null);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Min date for resolution = incident date (can't pick earlier date in calendar)
  const resolutionDateMin = form.incident_date || undefined;
  // Min time for resolution = time of call, only when same date is selected
  const resolutionTimeMin =
    form.resolution_completion_date && form.incident_date &&
    form.resolution_completion_date === form.incident_date
      ? form.time_of_call || undefined
      : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-green-800 font-medium">Incident submitted successfully</p>
            <p className="text-green-600 text-sm mt-0.5">
              {emailStatus === 'sent'
                ? 'Urgent alert email has been sent.'
                : emailStatus
                ? `Email status: ${emailStatus}`
                : 'The incident has been saved.'}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Auto-generated entry date */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm text-blue-700">
          <span className="font-medium">Date of Form Entry:</span> {todaySGT} (auto-generated)
        </span>
      </div>

      {/* Parties Involved */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Parties Involved</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vvip_name"
              value={form.vvip_name}
              onChange={handleChange}
              required
              placeholder="e.g. Minister John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Agency Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vvip_agency_name"
              value={form.vvip_agency_name}
              onChange={handleChange}
              required
              placeholder="e.g. MOF, MOM, MTI"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Engineer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="engineer_name"
              value={form.engineer_name}
              onChange={handleChange}
              required
              placeholder="e.g. Jane Tan"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Incident Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Incident Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Incident Type <span className="text-red-500">*</span>
            </label>
            <select
              name="incident_type"
              value={form.incident_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent bg-white"
            >
              <option value="">Select incident type</option>
              {INCIDENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex items-start gap-3 pt-6">
            <label
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                form.urgency ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                name="urgency"
                checked={form.urgency}
                onChange={handleChange}
                className="w-4 h-4 accent-red-600"
              />
              <span className={`text-sm font-medium ${form.urgency ? 'text-red-700' : 'text-gray-600'}`}>
                Mark as Urgent
              </span>
              <span className="text-xs text-gray-400 font-normal">(An email will be sent to DD for an urgent case)</span>
              {form.urgency && (
                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  URGENT
                </span>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Incident Detail <span className="text-red-500">*</span>
          </label>
          <textarea
            name="incident_detail"
            value={form.incident_detail}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe the incident in detail..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Dates & Times */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Dates & Times</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Incident <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="incident_date"
              value={form.incident_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time of Call <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="time_of_call"
              value={form.time_of_call}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resolution Completion Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="resolution_completion_date"
              value={form.resolution_completion_date}
              onChange={handleChange}
              required
              min={resolutionDateMin}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent ${
                resolutionError ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resolution Completion Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="resolution_completion_time"
              value={form.resolution_completion_time}
              onChange={handleChange}
              required
              min={resolutionTimeMin}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent ${
                resolutionError ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
        </div>

        {/* Resolution validation error */}
        {resolutionError && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{resolutionError}</p>
          </div>
        )}

        {/* SLA preview */}
        {form.incident_date && form.time_of_call && form.resolution_completion_date && form.resolution_completion_time && !resolutionError && (
          <SLAPreview form={form} />
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !!resolutionError}
          className="px-6 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#162d4a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Submit Incident
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function SLAPreview({ form }: { form: IncidentFormData }) {
  const start = new Date(`${form.incident_date}T${form.time_of_call}:00+08:00`);
  const end = new Date(`${form.resolution_completion_date}T${form.resolution_completion_time}:00+08:00`);
  const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  const slaMet = diffHours <= 24;
  const hrs = Math.floor(Math.abs(diffHours));
  const mins = Math.round((Math.abs(diffHours) - hrs) * 60);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
      slaMet ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    }`}>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${slaMet ? 'bg-green-500' : 'bg-red-500'}`} />
      <div>
        <span className="text-sm font-medium">
          SLA Preview:{' '}
          <span className={slaMet ? 'text-green-700' : 'text-red-700'}>
            {slaMet ? 'Met' : 'Not Met'}
          </span>
        </span>
        <span className="text-sm text-gray-500 ml-2">
          ({hrs}h {mins}m resolution time — target: 24h)
        </span>
      </div>
    </div>
  );
}

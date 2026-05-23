import IncidentTable from '@/components/IncidentTable';

export default function IncidentsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">View Incidents</h1>
        <p className="text-gray-500 text-sm mt-1">
          Browse and filter all recorded VVIP incidents
        </p>
      </div>
      <IncidentTable />
    </div>
  );
}

import IncidentForm from '@/components/IncidentForm';

export default function SubmitPage() {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit Incident</h1>
        <p className="text-gray-500 text-sm mt-1">
          Record a new VVIP incident or support call
        </p>
      </div>
      <IncidentForm />
    </div>
  );
}

import MonthlyReport from '@/components/MonthlyReport';

export default function ReportPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Monthly Report</h1>
        <p className="text-gray-500 text-sm mt-1">
          AI-generated analysis and summary for a selected month
        </p>
      </div>
      <MonthlyReport />
    </div>
  );
}

import { Metadata } from 'next';
import ReportsDashboard from './ReportsDashboard';

export const metadata: Metadata = {
    title: 'Raporlar | ProTransfer CRM',
    description: 'ProTransfer CRM raporlama ve muhasebe yönetimi',
};

export default function ReportsPage() {
    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Raporlar ve Muhasebe</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Finansal raporlar, transfer istatistikleri ve muhasebe yönetimi
                </p>
            </div>
            <ReportsDashboard />
        </div>
    );
}

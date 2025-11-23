import { useEffect, useState } from 'react';
import api from '../lib/api';
import { formatDateTime } from '../lib/utils';
import { Plus } from 'lucide-react';

export default function Samples() {
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const response = await api.get('/samples');
      setSamples(response.data.samples);
    } catch (error) {
      console.error('Error fetching samples:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Samples</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          New Sample
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Sample ID</th>
                <th className="text-left py-3 px-4 font-semibold">Patient Name</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Priority</th>
                <th className="text-left py-3 px-4 font-semibold">Received</th>
                <th className="text-left py-3 px-4 font-semibold">Tests</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((sample) => (
                <tr key={sample.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{sample.sampleId}</td>
                  <td className="py-3 px-4">{sample.patientName || 'N/A'}</td>
                  <td className="py-3 px-4">{sample.sampleType}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {sample.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        sample.priority === 'URGENT'
                          ? 'bg-red-100 text-red-800'
                          : sample.priority === 'HIGH'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {sample.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">{formatDateTime(sample.receivedDate)}</td>
                  <td className="py-3 px-4">{sample.tests?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {samples.length === 0 && (
          <div className="text-center py-12 text-gray-500">No samples found</div>
        )}
      </div>
    </div>
  );
}

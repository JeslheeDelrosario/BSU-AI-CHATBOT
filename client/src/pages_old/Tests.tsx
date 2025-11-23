import { useEffect, useState } from 'react';
import api from '../lib/api';
import { formatDateTime } from '../lib/utils';
import { Plus } from 'lucide-react';

export default function Tests() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await api.get('/tests');
      setTests(response.data.tests);
    } catch (error) {
      console.error('Error fetching tests:', error);
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
        <h1 className="text-3xl font-bold">Tests</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          New Test
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Sample ID</th>
                <th className="text-left py-3 px-4 font-semibold">Test Name</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Assigned To</th>
                <th className="text-left py-3 px-4 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{test.sample?.sampleId}</td>
                  <td className="py-3 px-4">{test.template?.name}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        test.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : test.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {test.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {test.assignedTo
                      ? `${test.assignedTo.firstName} ${test.assignedTo.lastName}`
                      : 'Unassigned'}
                  </td>
                  <td className="py-3 px-4">{formatDateTime(test.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tests.length === 0 && (
          <div className="text-center py-12 text-gray-500">No tests found</div>
        )}
      </div>
    </div>
  );
}

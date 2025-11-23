import { useEffect, useState } from 'react';
import api from '../lib/api';
import { TestTube, FlaskConical, Users, CheckCircle } from 'lucide-react';

interface DashboardStats {
  overview: {
    totalSamples: number;
    totalTests: number;
    totalUsers: number;
    pendingTests: number;
    completedTests: number;
  };
  recentSamples: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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

  const statCards = [
    {
      title: 'Total Samples',
      value: stats?.overview.totalSamples || 0,
      icon: TestTube,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Tests',
      value: stats?.overview.totalTests || 0,
      icon: FlaskConical,
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Tests',
      value: stats?.overview.pendingTests || 0,
      icon: FlaskConical,
      color: 'bg-yellow-500',
    },
    {
      title: 'Completed Tests',
      value: stats?.overview.completedTests || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Samples</h2>
        {stats?.recentSamples && stats.recentSamples.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Sample ID</th>
                  <th className="text-left py-3 px-4">Patient</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Tests</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSamples.map((sample: any) => (
                  <tr key={sample.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{sample.sampleId}</td>
                    <td className="py-3 px-4">{sample.patientName || 'N/A'}</td>
                    <td className="py-3 px-4">{sample.sampleType}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {sample.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{sample.tests?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent samples</p>
        )}
      </div>
    </div>
  );
}

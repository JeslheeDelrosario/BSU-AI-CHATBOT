import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus } from 'lucide-react';

export default function TestTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/test-templates');
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
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
        <h1 className="text-3xl font-bold">Test Templates</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.code}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-4">{template.description || 'No description'}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{template.category}</span>
              </div>
              {template.unit && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit:</span>
                  <span className="font-medium">{template.unit}</span>
                </div>
              )}
              {template.price && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">${template.price}</span>
                </div>
              )}
              {template.turnaroundTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">TAT:</span>
                  <span className="font-medium">{template.turnaroundTime}h</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {templates.length === 0 && (
        <div className="text-center py-12 text-gray-500">No test templates found</div>
      )}
    </div>
  );
}

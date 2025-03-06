import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProjectChanges } from '../services/projectChanges';
import { FileText, GitCommit } from 'lucide-react';

export function ProjectChanges() {
  const { user } = useAuth();
  const [changes, setChanges] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadChanges() {
      if (!user) return;
      try {
        const data = await getProjectChanges(user.id);
        setChanges(data);
      } catch (error) {
        console.error('Error loading changes:', error);
      } finally {
        setLoading(false);
      }
    }
    loadChanges();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading changes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Project Changes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track all modifications made to your project
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {changes.map((change) => (
          <div key={change.id} className="p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <GitCommit className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {change.description}
                  </p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {change.category}
                  </span>
                </div>
                <div className="mt-2">
                  {change.files_changed.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">Files changed:</p>
                      {change.files_changed.map((file: string) => (
                        <div key={file} className="flex items-center text-sm text-gray-500">
                          <FileText className="h-4 w-4 mr-2" />
                          {file}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(change.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {changes.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No changes recorded yet
          </div>
        )}
      </div>
    </div>
  );
}
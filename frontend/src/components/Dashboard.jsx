import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import { Plus, TrendingUp, Users, Eye, Edit, Trash2, Loader } from 'lucide-react';
import aiService from '../services/aiService';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [userRoadmaps, setUserRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressById, setProgressById] = useState({});
  const [error, setError] = useState('');

  // Fetch user's roadmaps on component mount
  useEffect(() => {
    const fetchUserRoadmaps = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await aiService.getUserProfiles();
        if (response.success) {
          setUserRoadmaps(response.profiles);
          // After list load, fetch details to compute accurate progress
          try {
            const details = await Promise.all(
              (response.profiles || []).map(async (p) => {
                try {
                  const d = await aiService.getProfileById(p._id);
                  const road = d?.profile?.aiResponse?.roadmap || [];
                  const done = Array.isArray(d?.profile?.progress?.completedSteps)
                    ? d.profile.progress.completedSteps.length
                    : 0;
                  const total = Array.isArray(road) ? road.length : 0;
                  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
                  return [p._id, { pct, done, total }];
                } catch (_) {
                  return [p._id, { pct: 0, done: 0, total: 0 }];
                }
              })
            );
            const map = Object.fromEntries(details);
            setProgressById(map);
          } catch (_) {
            // ignore
          }
        } else {
          setError('Failed to load roadmaps');
        }
      } catch (err) {
        console.error('Error fetching roadmaps:', err);
        setError('Failed to load roadmaps');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoadmaps();
  }, [user]);

  const handleDeleteRoadmap = async (profileId) => {
    if (!window.confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await aiService.deleteProfile(profileId);
      if (response.success) {
        // Remove the deleted roadmap from the state
        setUserRoadmaps(prev => prev.filter(roadmap => roadmap._id !== profileId));
      } else {
        setError('Failed to delete roadmap');
      }
    } catch (err) {
      console.error('Error deleting roadmap:', err);
      setError('Failed to delete roadmap');
    }
  };

  const handleViewRoadmap = async (profileId) => {
    try {
      const response = await aiService.getProfileById(profileId);
      if (response.success) {
        // Navigate to roadmap view with the specific roadmap data
        navigate('/roadmap-view', { 
          state: { 
            roadmapData: {
              roadmap: response.profile.aiResponse.roadmap,
              summary: response.profile.aiResponse.summary,
              totalEstimatedDuration: response.profile.aiResponse.totalEstimatedDuration,
              profileId: response.profile._id
            }
          } 
        });
      } else {
        setError('Failed to load roadmap');
      }
    } catch (err) {
      console.error('Error loading roadmap:', err);
      setError('Failed to load roadmap');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} onLogout={onLogout} />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username || user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your career roadmaps and track your progress
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/input-form')}
            className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors text-left">
            <Plus className="h-8 w-8 mb-2" />
            <h3 className="text-lg font-semibold">Create New Roadmap</h3>
            <p className="text-blue-100">Start building your career path</p>
          </button>
          <button
            onClick={async () => {
              try {
                const res = await aiService.getUserProfiles();
                const latest = res?.profiles?.[0];
                if (latest?._id) {
                  navigate(`/progress?profileId=${latest._id}`);
                } else {
                  navigate('/progress');
                }
              } catch (_) {
                navigate('/progress');
              }
            }}
            className="bg-white p-6 rounded-lg shadow text-left hover:shadow-md transition-shadow">
            <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Progress Tracking
            </h3>
            <p className="text-gray-600">Monitor your career milestones</p>
          </button>
          {/* Career Insights removed as requested */}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Roadmaps</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading your roadmaps...</span>
              </div>
            ) : userRoadmaps.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <Plus className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No roadmaps yet</h3>
                <p className="text-gray-600 mb-4">Create your first career roadmap to get started</p>
                <button
                  onClick={() => navigate('/input-form')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Create Roadmap
                </button>
              </div>
            ) : (
              userRoadmaps.map((roadmap) => (
                <div
                  key={roadmap._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-4 hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {roadmap.aiResponse?.summary || 'Career Roadmap'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Created: {formatDate(roadmap.createdAt)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Duration: {roadmap.aiResponse?.totalEstimatedDuration || 'N/A'}
                    </p>
                    {(() => {
                      const cached = progressById[roadmap._id];
                      const total = cached?.total ?? (Array.isArray(roadmap.aiResponse?.roadmap) ? roadmap.aiResponse.roadmap.length : 0);
                      const done = cached?.done ?? (Array.isArray(roadmap.progress?.completedSteps) ? roadmap.progress.completedSteps.length : 0);
                      const pct = cached?.pct ?? (total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0);
                      let computed = 'not_started';
                      if (total > 0 && done >= total) computed = 'completed';
                      else if (done > 0) computed = 'in_progress';
                      return (
                        <div className="mt-2 flex items-center gap-3">
                          <div className="w-40">
                            <div className="w-full h-2 bg-gray-100 rounded">
                              <div className="h-2 bg-blue-600 rounded" style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-[11px] text-gray-600 mt-1">{pct}%</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            computed === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : computed === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {computed}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/progress?profileId=${roadmap._id}`)}
                      className="p-2 text-green-700 hover:bg-green-50 rounded"
                      title="Track Progress">
                      Track
                    </button>
                    <button
                      onClick={() => handleViewRoadmap(roadmap._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="View Roadmap">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoadmap(roadmap._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete Roadmap">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
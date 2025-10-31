import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import {
  Save,
  Edit,
  Calendar,
  CheckCircle,
  BookOpen,
  ChevronRight,
  Award,
} from 'lucide-react';
import aiService from '../services/aiService';

const RoadmapView = ({ roadmapData, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get roadmap data from props or location state; allow dynamic load override
  const [loadedData, setLoadedData] = useState(null);
  const currentRoadmapData = loadedData || roadmapData || location.state?.roadmapData;
  
  // Handle both AI-generated data and sample data
  const isAIData = currentRoadmapData && currentRoadmapData.roadmap;
  
  const title = isAIData ? 'Your AI-Generated Career Roadmap' : currentRoadmapData?.title || 'Career Roadmap';
  const summary = currentRoadmapData?.summary || 'Your personalized career journey';
  const totalDuration = currentRoadmapData?.totalEstimatedDuration;
  const roadmap = isAIData ? currentRoadmapData.roadmap : currentRoadmapData?.timeline;

  // const profileId = currentRoadmapData?.profileId; // tracking removed
  // Tracking UI removed for RoadmapView; progress is handled in ProgressTracker

  // If demo is showing but user is logged in, try auto-load latest AI roadmap
  useEffect(() => {
    const tryLoadLatest = async () => {
      if (isAIData || !user) return;
      try {
        const res = await aiService.getUserProfiles();
        const latest = res?.profiles?.[0];
        if (!latest?._id) return;
        const detail = await aiService.getProfileById(latest._id);
        const p = detail?.profile;
        if (p?.aiResponse?.roadmap) {
          setLoadedData({
            roadmap: p.aiResponse.roadmap,
            summary: p.aiResponse.summary,
            totalEstimatedDuration: p.aiResponse.totalEstimatedDuration,
            profileId: p._id,
          });
        }
      } catch {
        // ignore
      }
    };
    tryLoadLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Removed tracking state effects

  // Removed tracking handlers from view-only page

  return (
  <div className="min-h-screen bg-gray-50">
    <Navigation user={user} onLogout={onLogout} />
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {!isAIData && (
        <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg text-blue-800">
          <div className="flex items-center justify-between">
            <div>
              You are viewing a demo roadmap. To track progress, open one of your generated roadmaps or create a new one.
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate('/dashboard')} className="px-3 py-2 border border-blue-300 rounded text-blue-700 bg-white hover:bg-blue-50">Open My Roadmaps</button>
              <button onClick={() => navigate('/input-form')} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Generate Roadmap</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="text-gray-600 mt-2">{summary}</p>
          {totalDuration && (
            <p className="text-sm text-blue-600 mt-1">
              Estimated Duration: {totalDuration}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save Roadmap
          </button>
          <button 
            onClick={() => navigate('/input-form')}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Edit className="h-4 w-4 mr-2" />
            Create New Roadmap
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Back to Dashboard
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-8">
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>
          {roadmap && roadmap.map((phase, index) => (
            <div key={index} className="relative mb-12 last:mb-0">
              <div className="absolute left-6 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
              <div className="ml-16">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-600">
                    {phase.timeline || phase.year}
                  </span>
                  {phase.difficulty && (
                    <span className="ml-3 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {phase.difficulty}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {phase.title}
                </h3>
                <p className="text-gray-700 mb-4">{phase.description}</p>
                {phase.estimatedDuration && (
                  <p className="text-sm text-blue-600 mb-4">
                    Duration: {phase.estimatedDuration}
                  </p>
                )}
                <div className="grid gap-3">
                  {isAIData && phase.resources && phase.resources.length > 0 ? (
                    phase.resources.map((resource, itemIndex) => (
                      <div key={itemIndex} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{resource}</span>
                      </div>
                    ))
                  ) : (
                    phase.items && phase.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Progress tracking UI removed here; use ProgressTracker instead */}
              </div>
            </div>
          ))}
        </div>
        {/* Actions removed on view page */}
      </div>
      {/* Next steps list removed on view page */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
            Recommended Courses
          </h3>
          <ul className="space-y-2">
            <li className="flex items-center text-gray-700">
              <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
              JavaScript Fundamentals
            </li>
            <li className="flex items-center text-gray-700">
              <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
              React Development
            </li>
            <li className="flex items-center text-gray-700">
              <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
              System Design
            </li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 text-purple-600 mr-2" />
            Certifications
          </h3>
          <ul className="space-y-2">
            <li className="flex items-center text-gray-700">
              <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
              AWS Cloud Practitioner
            </li>
            <li className="flex items-center text-gray-700">
              <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
              Google Cloud Professional
            </li>
            <li className="flex items-center text-gray-700">
              <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
              Scrum Master
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  );
};

export default RoadmapView;
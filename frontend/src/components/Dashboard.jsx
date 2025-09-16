import React from 'react';
import Navigation from './Navigation';
import { Plus, TrendingUp, Users, Eye, Edit, Trash2 } from 'lucide-react';

const Dashboard = ({ user, savedRoadmaps, setCurrentView }) => (
  <div className="min-h-screen bg-gray-50">
    <Navigation user={user} setCurrentView={setCurrentView} />
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your career roadmaps and track your progress
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => setCurrentView('input-form')}
          className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors text-left">
          <Plus className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-semibold">Create New Roadmap</h3>
          <p className="text-blue-100">Start building your career path</p>
        </button>
        <div className="bg-white p-6 rounded-lg shadow">
          <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Progress Tracking
          </h3>
          <p className="text-gray-600">Monitor your career milestones</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <Users className="h-8 w-8 text-purple-600 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Career Insights
          </h3>
          <p className="text-gray-600">Get personalized recommendations</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Roadmaps</h2>
        </div>
        <div className="p-6">
          {savedRoadmaps.map((roadmap) => (
            <div
              key={roadmap.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-4">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{roadmap.title}</h3>
                <p className="text-sm text-gray-500">
                  Created: {roadmap.created}
                </p>
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2 w-32">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${roadmap.progress}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {roadmap.progress}% complete
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentView('roadmap-view')}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-50 rounded">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;

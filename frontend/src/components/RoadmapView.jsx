import React from 'react';
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

const RoadmapView = ({ sampleRoadmap }) => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {sampleRoadmap.title}
          </h1>
          <p className="text-gray-600 mt-2">Your personalized career journey</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save Roadmap
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-8">
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>
          {sampleRoadmap.timeline.map((phase, index) => (
            <div key={index} className="relative mb-12 last:mb-0">
              <div className="absolute left-6 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
              <div className="ml-16">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-600">
                    {phase.year}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {phase.title}
                </h3>
                <div className="grid gap-3">
                  {phase.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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

export default RoadmapView;

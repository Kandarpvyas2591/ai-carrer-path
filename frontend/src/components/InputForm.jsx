import React from 'react';
import Navigation from './Navigation';

const InputForm = ({ setCurrentView }) => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Tell Us About Yourself
        </h1>
        <p className="text-gray-600 mb-8">
          We'll use this information to create a personalized career roadmap
          just for you.
        </p>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Skills
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="e.g., JavaScript, Python, Problem-solving, Communication..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Career Interests
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="e.g., Software Development, Data Science, Artificial Intelligence..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Educational Background
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Select your education level</option>
              <option value="high-school">High School</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="phd">PhD</option>
              <option value="bootcamp">Coding Bootcamp</option>
              <option value="self-taught">Self-Taught</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Experience
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Select your experience level</option>
              <option value="0">No experience</option>
              <option value="1-2">1-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Career Goals
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="e.g., Become a senior developer, Start my own company, Work at a FAANG company..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Values
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Work-Life Balance',
                'High Salary',
                'Remote Work',
                'Innovation',
                'Leadership',
                'Social Impact',
              ].map((value) => (
                <label key={value} className="flex items-center">
                  <input type="checkbox" className="mr-2 text-blue-600" />
                  <span className="text-sm text-gray-700">{value}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={() => setCurrentView('roadmap-view')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Generate My Career Roadmap
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default InputForm;

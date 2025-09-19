import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import aiService from '../services/aiService';

const InputForm = ({ setRoadmapData, user, onLogout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentSkills: '',
    careerInterests: '',
    educationalBackground: '',
    workExperience: '',
    careerGoals: '',
    personalValues: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (value) => {
    setFormData(prev => ({
      ...prev,
      personalValues: prev.personalValues.includes(value)
        ? prev.personalValues.filter(v => v !== value)
        : [...prev.personalValues, value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.currentSkills.trim() || 
        !formData.careerInterests.trim() || 
        !formData.educationalBackground || 
        !formData.workExperience || 
        !formData.careerGoals.trim()) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const data = await aiService.generateCareerRoadmap(formData);

      if (data.success) {
        setRoadmapData && setRoadmapData(data);
        navigate('/roadmap-view');
      } else {
        setError(data.message || 'Failed to generate roadmap');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gray-50">
    <Navigation user={user} onLogout={onLogout} />
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Tell Us About Yourself
        </h1>
        <p className="text-gray-600 mb-8">
          We'll use this information to create a personalized career roadmap
          just for you.
        </p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Skills *
            </label>
            <textarea
              name="currentSkills"
              value={formData.currentSkills}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="e.g., JavaScript, Python, Problem-solving, Communication..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Career Interests *
            </label>
            <textarea
              name="careerInterests"
              value={formData.careerInterests}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="e.g., Software Development, Data Science, Artificial Intelligence..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Educational Background *
            </label>
            <select 
              name="educationalBackground"
              value={formData.educationalBackground}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
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
              Work Experience *
            </label>
            <select 
              name="workExperience"
              value={formData.workExperience}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
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
              Career Goals *
            </label>
            <textarea
              name="careerGoals"
              value={formData.careerGoals}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="e.g., Become a senior developer, Start my own company, Work at a FAANG company..."
              required
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
                  <input 
                    type="checkbox" 
                    checked={formData.personalValues.includes(value)}
                    onChange={() => handleCheckboxChange(value)}
                    className="mr-2 text-blue-600" 
                  />
                  <span className="text-sm text-gray-700">{value}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Generating Roadmap...' : 'Generate My Career Roadmap'}
          </button>
        </form>
      </div>
    </div>
  </div>
  );
};

export default InputForm;
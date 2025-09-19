import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, MapPin } from 'lucide-react';
import Navigation from './Navigation';

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation does not need user/menu props for landing */}
      <Navigation />
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Navigate Your
              <span className="text-blue-600 block">Career Journey</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get personalized, AI-powered career roadmaps that adapt to your
              skills, interests, and goals. Plan your next 5, 10, or 20 years
              with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors">
                Start Your Journey
              </button>
              <button
                onClick={() => navigate('/roadmap-view')}
                className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CareerNavigator?
            </h2>
            <p className="text-xl text-gray-600">
              Powered by AI to give you the most relevant and personalized
              career guidance
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-blue-50">
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI-Powered Insights
              </h3>
              <p className="text-gray-600">
                Leverage GPT-4 to analyze market trends and create personalized
                career paths
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-green-50">
              <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Goal-Oriented Planning
              </h3>
              <p className="text-gray-600">
                Set clear milestones and track your progress over 5, 10, and
                20-year timelines
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-purple-50">
              <MapPin className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Interactive Roadmaps
              </h3>
              <p className="text-gray-600">
                Visualize your career journey with interactive timelines and
                detailed guidance
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

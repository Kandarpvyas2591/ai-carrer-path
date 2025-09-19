import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import InputForm from './components/InputForm';
import RoadmapView from './components/RoadmapView';
import authService from './services/authService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roadmapData, setRoadmapData] = useState(null);

  // Check if user is already logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getMe();
        setUser(response.user);
      } catch {
        // User is not authenticated, this is normal
        console.log('No authenticated user found');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const sampleRoadmap = {
    title: 'Software Engineer Career Path',
    timeline: [
      {
        year: 'Year 1-2',
        title: 'Foundation Building',
        items: [
          'Complete Computer Science degree or coding bootcamp',
          'Learn JavaScript, Python, and SQL',
          'Build 3-5 personal projects',
          'Start contributing to open source',
        ],
      },
      {
        year: 'Year 3-5',
        title: 'Junior Developer',
        items: [
          'Land first developer role',
          'Master React and Node.js',
          'Get AWS Cloud Practitioner certification',
          'Build professional network',
        ],
      },
      {
        year: 'Year 6-10',
        title: 'Senior Developer',
        items: [
          'Lead development projects',
          'Mentor junior developers',
          'Specialize in system architecture',
          'Contribute to technical decisions',
        ],
      },
      {
        year: 'Year 10+',
        title: 'Tech Lead/Manager',
        items: [
          'Lead engineering teams',
          'Drive technical strategy',
          'Speak at conferences',
          'Consider startup opportunities',
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={<AuthForm type="login" setUser={setUser} />}
          />
          <Route
            path="/signup"
            element={<AuthForm type="register" setUser={setUser} />}
          />
          <Route
            path="/dashboard"
            element={<Dashboard user={user} onLogout={handleLogout} />}
          />
          <Route 
            path="/input-form" 
            element={<InputForm setRoadmapData={setRoadmapData} user={user} onLogout={handleLogout} />} 
          />
          <Route
            path="/roadmap-view"
            element={<RoadmapView roadmapData={roadmapData || sampleRoadmap} user={user} onLogout={handleLogout} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
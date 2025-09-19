import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import InputForm from './components/InputForm';
import RoadmapView from './components/RoadmapView';

function App() {
  const [user, setUser] = useState(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState([
    {
      id: 1,
      title: 'Software Engineer Path',
      created: '2024-01-15',
      progress: 65,
    },
    {
      id: 2,
      title: 'Data Scientist Journey',
      created: '2024-01-20',
      progress: 30,
    },
  ]);
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
            element={<Dashboard user={user} savedRoadmaps={savedRoadmaps} />}
          />
          <Route path="/input-form" element={<InputForm />} />
          <Route
            path="/roadmap-view"
            element={<RoadmapView sampleRoadmap={sampleRoadmap} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

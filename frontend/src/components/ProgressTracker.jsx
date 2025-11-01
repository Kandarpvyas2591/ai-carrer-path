import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import aiService from '../services/aiService';

function ProgressTracker({ user, onLogout }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const profileId = searchParams.get('profileId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [nextSteps, setNextSteps] = useState([]);

  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatError, setChatError] = useState('');

  const roadmap = useMemo(() => profile?.aiResponse?.roadmap || [], [profile]);
  const summary = profile?.aiResponse?.summary;
  const totalEstimatedDuration = profile?.aiResponse?.totalEstimatedDuration;

  // Load selected profile roadmap
  useEffect(() => {
    const load = async () => {
      if (!profileId) {
        // Try to auto-load latest profile if none provided
        try {
          const list = await aiService.getUserProfiles();
          const latest = list?.profiles?.[0];
          if (latest?._id) {
            navigate(`/progress?profileId=${latest._id}`, { replace: true });
            return;
          }
          setError('No roadmap selected. Open a roadmap from your Dashboard.');
        } catch (e) {
          setError('No roadmap selected. Open a roadmap from your Dashboard.');
        } finally {
          setLoading(false);
        }
        return;
      }
      try {
        setLoading(true);
        const res = await aiService.getProfileById(profileId);
        setProfile(res.profile);
        // If backend returns stored progress, hydrate it here (fallback empty)
        const stored = res.profile?.progress?.completedSteps;
        if (Array.isArray(stored)) setCompletedSteps(stored);
      } catch (e) {
        setError(e.message || 'Failed to load roadmap');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profileId]);

  const overallPercent = useMemo(() => {
    const totalSteps = roadmap?.length || 0;
    if (totalSteps === 0) return 0;
    const done = completedSteps.length;
    return Math.round((done / totalSteps) * 100);
  }, [roadmap, completedSteps]);

  const toggleStep = async (stepNumber) => {
    const next = completedSteps.includes(stepNumber)
      ? completedSteps.filter((s) => s !== stepNumber)
      : [...completedSteps, stepNumber];
    setCompletedSteps(next);

    // Save immediately (optimistic)
    if (profileId) {
      try {
        setSaving(true);
        await aiService.updateProgress(profileId, { completedSteps: next });
      } catch (e) {
        setError(e.message || 'Failed to save progress');
      } finally {
        setSaving(false);
      }
    }

    // If a step became completed, ask for new next steps
    if (!completedSteps.includes(stepNumber)) {
      try {
        setSuggesting(true);
        const res = await aiService.suggestNextSteps(profileId, next);
        let suggestions = res.nextSteps || [];
        if (!suggestions.length) {
          suggestions = buildFallbackSuggestions('', roadmap, next);
        }
        setNextSteps(suggestions);
        setAiMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: suggestions.length
              ? `Nice progress! New next steps:\n- ${suggestions.map(s => s.title || s).join('\n- ')}`
              : 'Nice progress! No new suggestions at the moment.',
            id: crypto.randomUUID(),
            ts: Date.now(),
          },
        ]);
      } catch {
        // ignore suggest error
      } finally {
        setSuggesting(false);
      }
    }
  };

  const sendAiMessage = async () => {
    const content = aiInput.trim();
    if (!content) return;
    const userMessage = { role: 'user', content, id: crypto.randomUUID(), ts: Date.now() };
    setAiMessages((prev) => [...prev, userMessage]);
    setAiInput('');
    setAiLoading(true);
    setChatError('');

    // Call backend next steps API using current progress
    try {
      const history = aiMessages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await aiService.suggestNextSteps(profileId, completedSteps, content, history);
      let suggestions = res.nextSteps || [];
      
      // Debug logging
      console.log('AI Response:', { 
        hasSuggestions: suggestions.length > 0, 
        count: suggestions.length,
        suggestions: suggestions 
      });

      // If the user asks about certifications or budget options, tailor suggestions
      if (detectCertificationIntent(content)) {
        suggestions = buildCertificationPlanSuggestions();
      }

      // Build fallback suggestions if none returned OR if backend returned empty
      const useFallback = !suggestions.length;
      if (useFallback) {
        suggestions = buildFallbackSuggestions(content, roadmap, completedSteps);
      }

      // De-duplicate: Only check against recent messages (last 2 assistant messages) to avoid over-filtering
      const recentShown = new Set(
        aiMessages
          .filter(m => m.role === 'assistant')
          .slice(-2) // Only check last 2 assistant messages
          .flatMap(m => {
            const matches = m.content.match(/- (.+)/g) || [];
            return matches.map(line => line.replace(/^-[\s]*/, '').toLowerCase().trim());
          })
      );
      
      // Always show fallback suggestions even if similar to previous (they're context-specific)
      const unique = useFallback 
        ? suggestions.slice(0, 5) // Always show fallback suggestions
        : suggestions.filter(s => !recentShown.has((s.title || s).toString().trim().toLowerCase()));

      // If still empty after deduplication but we have suggestions, use first 3
      const finalSuggestions = unique.length > 0 ? unique : suggestions.slice(0, 3);

      const text = finalSuggestions.length
        ? `Given your message, here are tailored next steps:\n- ${finalSuggestions.map(s => s.title || s).join('\n- ')}`
        : 'I could not infer new steps. Try marking a roadmap step done or add more context.';
      setAiMessages((prev) => [
        ...prev,
        { role: 'assistant', content: text, id: crypto.randomUUID(), ts: Date.now() },
      ]);
      if (finalSuggestions.length) setNextSteps(finalSuggestions);
    } catch (e) {
      // On error, show fallback suggestions instead of just error message
      const fallback = buildFallbackSuggestions(content, roadmap, completedSteps);
      const msg = e?.message || 'Failed to fetch suggestions right now.';
      setChatError(msg);
      const errorText = fallback.length
        ? `${msg}\n\nHere are some helpful next steps:\n- ${fallback.slice(0, 3).map(s => s.title || s).join('\n- ')}`
        : msg;
      setAiMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorText, id: crypto.randomUUID(), ts: Date.now() },
      ]);
      if (fallback.length) setNextSteps(fallback.slice(0, 3));
    } finally {
      setAiLoading(false);
    }
  };

  function buildFallbackSuggestions(message, roadmapList, doneSteps) {
    const remaining = (roadmapList || []).filter(p => !doneSteps.includes(p.stepNumber));
    const byOrder = remaining.slice(0, 3).map(p => ({ title: `Continue with: ${p.title}` }));
    const m = (message || '').toLowerCase();
    const keyword = [];
    
    // Expanded keyword matching for better suggestions
    if (m.includes('auth') || m.includes('login') || m.includes('password')) {
      keyword.push({ title: 'Review authentication requirements and test the login flow' });
      keyword.push({ title: 'Set up secure password hashing and session management' });
    }
    if (m.includes('api') || m.includes('endpoint') || m.includes('backend')) {
      keyword.push({ title: 'Define API contracts, endpoints, and add test calls' });
      keyword.push({ title: 'Document API endpoints and create Postman collections' });
    }
    if (m.includes('ui') || m.includes('frontend') || m.includes('interface') || m.includes('design')) {
      keyword.push({ title: 'Create wireframes and build a small UI component slice' });
      keyword.push({ title: 'Set up responsive design and accessibility features' });
    }
    if (m.includes('error') || m.includes('bug') || m.includes('issue') || m.includes('problem')) {
      keyword.push({ title: 'Create a minimal reproduction case and add unit tests' });
      keyword.push({ title: 'Review error logs and identify the root cause' });
    }
    if (m.includes('database') || m.includes('db') || m.includes('data')) {
      keyword.push({ title: 'Design the database schema and create migration scripts' });
      keyword.push({ title: 'Set up database indexes and optimize queries' });
    }
    if (m.includes('test') || m.includes('testing') || m.includes('quality')) {
      keyword.push({ title: 'Write unit tests for core functionality' });
      keyword.push({ title: 'Set up automated testing pipeline' });
    }
    if (m.includes('deploy') || m.includes('host') || m.includes('production')) {
      keyword.push({ title: 'Set up staging environment and deployment pipeline' });
      keyword.push({ title: 'Configure CI/CD and monitor deployment health' });
    }
    if (m.includes('learn') || m.includes('study') || m.includes('skill')) {
      keyword.push({ title: 'Find relevant online courses or tutorials' });
      keyword.push({ title: 'Practice with hands-on projects and build a portfolio' });
    }
    if (m.includes('job') || m.includes('career') || m.includes('interview')) {
      keyword.push({ title: 'Update your resume and LinkedIn profile' });
      keyword.push({ title: 'Practice coding interviews and system design problems' });
    }
    
    // Always include some generic helpful suggestions
    const generic = [
      { title: 'Break down the task into smaller, manageable steps' },
      { title: 'Research best practices and review documentation' },
      { title: 'Create a proof-of-concept to validate your approach' },
    ];
    
    // Combine: keyword suggestions first, then roadmap steps, then generic
    const merged = [...keyword.slice(0, 3), ...byOrder.slice(0, 2), ...generic.slice(0, 2)];
    
    // Always return at least 3-5 suggestions
    return merged.slice(0, 5);
  }

  function detectCertificationIntent(message) {
    const m = (message || '').toLowerCase();
    return (
      m.includes('cert') ||
      m.includes('certification') ||
      m.includes('certificate') ||
      m.includes('cheap') ||
      m.includes('low cost') ||
      m.includes('budget') ||
      m.includes('affordable') ||
      m.includes('free')
    );
  }

  function buildCertificationPlanSuggestions() {
    // Keep them as simple title strings or { title } objects compatible with UI
    return [
      { title: 'Shortlist budget-friendly certificates (Google, AWS CCP, Microsoft Fundamentals)' },
      { title: 'Use free prep: Google Digital Garage, AWS Skill Builder, Microsoft Learn' },
      { title: 'Apply financial aid (Coursera) or hunt discount vouchers (exam retake promos)' },
      { title: 'Schedule one exam within 30 days and set weekly study blocks' },
      { title: 'Take 2 practice tests and review weak domains before the exam' },
    ];
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Progress Tracker</h1>
          <div className="flex items-center gap-3">
            {user ? <span className="text-sm text-gray-600">Signed in as {user.email}</span> : null}
            {onLogout ? (
              <button onClick={onLogout} className="px-3 py-1.5 text-sm rounded bg-gray-100 hover:bg-gray-200">
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 bg-white rounded-lg border p-4">
          {!profileId || !profile?.aiResponse?.roadmap ? (
            <div>
              <p className="text-gray-700 mb-3">{error || 'No roadmap found.'}</p>
              <div className="flex gap-2">
                <button onClick={() => navigate('/dashboard')} className="px-3 py-2 border rounded">Back to Dashboard</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-medium">Your Roadmap Progress</h2>
                  {summary && <p className="text-sm text-gray-600">{summary}</p>}
                  {totalEstimatedDuration && (
                    <p className="text-xs text-blue-600 mt-1">Estimated Duration: {totalEstimatedDuration}</p>
                  )}
                </div>
                <div className="w-40">
                  <div className="w-full h-2 bg-gray-100 rounded">
                    <div className="h-2 bg-green-600 rounded" style={{ width: `${overallPercent}%` }} />
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1 text-right">{overallPercent}%</p>
                </div>
              </div>

              <ul className="divide-y">
                {roadmap.map((phase, idx) => (
                  <li key={idx} className="py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">{phase.title}</p>
                        {phase.description && (
                          <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                        )}
                        {phase.estimatedDuration && (
                          <p className="text-xs text-blue-600 mt-1">Duration: {phase.estimatedDuration}</p>
                        )}
                      </div>
                      <label className="inline-flex items-center whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={completedSteps.includes(phase.stepNumber)}
                          onChange={() => toggleStep(phase.stepNumber)}
                        />
                        <span className="text-sm">Done</span>
                      </label>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={async () => {
                    try {
                      setSaving(true);
                      await aiService.updateProgress(profileId, { completedSteps });
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Progress'}
                </button>
                <button
                  onClick={async () => {
                    try {
                      setSuggesting(true);
                      const res = await aiService.suggestNextSteps(profileId, completedSteps);
                      let suggestions = res.nextSteps || [];
                      if (!suggestions.length) {
                        suggestions = buildFallbackSuggestions('', roadmap, completedSteps);
                      }
                      // de-duplicate against current nextSteps
                      const shown = new Set(nextSteps.map(s => (s.title || s).toString().trim().toLowerCase()));
                      const unique = suggestions.filter(s => !shown.has((s.title || s).toString().trim().toLowerCase()));
                      setNextSteps(unique.length ? unique : suggestions);
                    } finally {
                      setSuggesting(false);
                    }
                  }}
                  disabled={suggesting}
                  className="px-3 py-2 border rounded disabled:opacity-50"
                >
                  {suggesting ? 'Asking AI...' : 'Get Next Steps'}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-medium mb-2">Chat with AI</h2>
            <p className="text-sm text-gray-600 mb-3">Share your blockers; AI suggests next steps based on your roadmap.</p>
            {chatError && (
              <div className="mb-3 p-2 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{chatError}</div>
            )}
            <textarea
              className="w-full border rounded px-3 py-2 text-sm min-h-[90px]"
              placeholder="Describe your difficulty..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={sendAiMessage}
                disabled={aiLoading || !profileId}
                className={`px-3 py-2 rounded text-white text-sm ${aiLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {aiLoading ? 'Thinking...' : 'Send'}
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-64 overflow-auto">
              {aiMessages.map((m) => (
                <div key={m.id} className={`p-3 rounded ${m.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <p className="text-xs text-gray-500 mb-1">{m.role === 'user' ? 'You' : 'AI'}</p>
                  <pre className="whitespace-pre-wrap text-sm">{m.content}</pre>
                </div>
              ))}
            </div>
          </div>

          {nextSteps.length > 0 && (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-medium mb-2">AI Suggested Next Steps</h3>
              <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                {nextSteps.map((s, i) => (
                  <li key={i}>{s.title || s}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ProgressTracker;



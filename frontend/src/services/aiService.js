const API_BASE_URL = 'http://localhost:3000/api/v1';

class AIService {
  async generateCareerRoadmap(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/career-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate roadmap');
      }

      return data;
    } catch (error) {
      console.error('AI Roadmap generation error:', error);
      throw error;
    }
  }

  async getUserProfiles() {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/profiles`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profiles');
      }

      return data;
    } catch (error) {
      console.error('Get profiles error:', error);
      throw error;
    }
  }

  async getProfileById(profileId) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/profiles/${profileId}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      return data;
    } catch (error) {
      console.error('Get profile by ID error:', error);
      throw error;
    }
  }

  async deleteProfile(profileId) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/profiles/${profileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete profile');
      }

      return data;
    } catch (error) {
      console.error('Delete profile error:', error);
      throw error;
    }
  }

  async updateProgress(profileId, payload) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/profiles/${profileId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update progress');
      }
      return data;
    } catch (error) {
      console.error('Update progress error:', error);
      throw error;
    }
  }

  async suggestNextSteps(profileId, completedSteps, message, history) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/profiles/${profileId}/next-steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ completedSteps, message, history }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get next steps');
      }
      return data;
    } catch (error) {
      console.error('Suggest next steps error:', error);
      throw error;
    }
  }
}

export default new AIService();
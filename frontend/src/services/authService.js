const API_BASE_URL = 'http://localhost:3000/api/v1';

class AuthService {
  async signup(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use backend message if available, otherwise provide context-aware defaults
        const message = data.message || 
          (response.status === 409 ? 'This account already exists. Please try logging in or use a different email/username.' :
           response.status === 400 ? 'Please check your input and try again.' :
           response.status >= 500 ? 'Server error occurred. Please try again in a moment.' :
           'Signup failed. Please try again.');
        throw new Error(message);
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      // If it's already an Error with a message, re-throw it
      if (error instanceof Error) {
        throw error;
      }
      // Handle network errors
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      }
      throw new Error(error.message || 'An unexpected error occurred. Please try again.');
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }

      return data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getMe() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user info');
      }

      return data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }
}

export default new AuthService();

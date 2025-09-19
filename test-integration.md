# Frontend-Backend Integration Test Guide

## Setup Instructions

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   The backend should run on `http://localhost:3000`

2. **Start the Frontend Development Server:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend should run on `http://localhost:5173`

3. **Environment Setup:**
   - Make sure you have a `.env` file in the backend directory with:
     - `JWT_SECRET=your_jwt_secret_key`
     - `OPENROUTER_API_KEY=your_openrouter_api_key`
     - `MONGODB_URI=your_mongodb_connection_string`

## Test Cases

### Authentication Tests

#### 1. User Registration
- Navigate to `http://localhost:5173/signup`
- Fill in the form with:
  - Full Name: Test User
  - Email: test@example.com
  - Password: password123
- Click "Create Account"
- **Expected:** User should be created and redirected to dashboard

#### 2. User Login
- Navigate to `http://localhost:5173/login`
- Fill in the form with:
  - Email: test@example.com
  - Password: password123
- Click "Sign In"
- **Expected:** User should be logged in and redirected to dashboard

#### 3. User Logout
- While logged in, click the "Logout" button in the navigation
- **Expected:** User should be logged out and redirected to home page

#### 4. Session Persistence
- After logging in, refresh the page
- **Expected:** User should remain logged in (session should persist)

### AI Roadmap Generation Tests

#### 5. Create Career Roadmap
- Navigate to `http://localhost:5173/input-form` (while logged in)
- Fill in the form with:
  - Current Skills: "JavaScript, Python, React, Node.js"
  - Career Interests: "Full-stack development, AI/ML"
  - Educational Background: "Bachelor's Degree"
  - Work Experience: "1-2 years"
  - Career Goals: "Become a senior full-stack developer at a tech company"
  - Personal Values: Select "Work-Life Balance", "Innovation"
- Click "Generate My Career Roadmap"
- **Expected:** 
  - Loading state should show "Generating Roadmap..."
  - After successful generation, redirect to `/roadmap-view`
  - Roadmap should display with AI-generated steps, resources, and timeline

#### 6. View Generated Roadmap
- After generating a roadmap, verify the roadmap view shows:
  - Title: "Your AI-Generated Career Roadmap"
  - Summary of the career path
  - Estimated total duration
  - Step-by-step roadmap with:
    - Step numbers and titles
    - Detailed descriptions
    - Timeline information
    - Difficulty levels
    - Resources and recommendations
- **Expected:** Roadmap should be well-formatted and personalized

#### 7. Create New Roadmap
- From the roadmap view, click "Create New Roadmap"
- **Expected:** Should navigate back to input form

#### 8. Dashboard Navigation
- From dashboard, click "Create New Roadmap"
- **Expected:** Should navigate to input form

## API Endpoints Used

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user info

### AI Roadmap Generation
- `POST /api/v1/ai/career-plan` - Generate AI career roadmap
- `GET /api/v1/ai/profiles` - Get user's AI profiles
- `GET /api/v1/ai/profiles/:profileId` - Get specific AI profile

## Features Implemented

### Authentication
✅ Form validation and error handling
✅ Loading states during API calls
✅ JWT token-based authentication with cookies
✅ Automatic session restoration on page load
✅ Proper logout functionality
✅ Responsive UI with error messages

### AI Roadmap Generation
✅ Comprehensive input form with validation
✅ AI service integration with proper error handling
✅ Real-time loading states during AI generation
✅ Dynamic roadmap display with AI-generated content
✅ React Router navigation between components
✅ Responsive design for all screen sizes
✅ Error handling for API failures
✅ Form data persistence and validation

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure backend CORS is configured for `http://localhost:5173`
2. **Authentication Errors**: Check JWT_SECRET is set in backend .env
3. **AI Generation Fails**: Verify OPENROUTER_API_KEY is valid and has credits
4. **Database Errors**: Ensure MongoDB connection string is correct
5. **Frontend Build Errors**: Run `npm install` in frontend directory

### Debug Tips
- Check browser console for JavaScript errors
- Check backend console for server errors
- Verify API responses in Network tab
- Test API endpoints directly with Postman/curl

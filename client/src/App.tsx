// client/src/App.tsx
// Main application routing
// Fixed: Removed duplicate /signup route from private section
// All private pages now render correctly, including Settings

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { ToastProvider } from './components/Toast';
import { PrivateRoute } from './components/PrivateRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import LessonViewer from './pages/LessonViewer';
import AITutor from './pages/AITutor';
import Settings from './pages/Settings';
import Progress from './pages/Progress';
import Consultations from './pages/Consultations';
import Profile from './pages/Profile';
import Classrooms from './pages/Classrooms';
import ClassroomDetail from './pages/ClassroomDetail';

// Admin Pages
import AdminCOSPrograms from './pages/AdminCOSPrograms';
import AdminFaculty from './pages/AdminFaculty';
import AdminCurriculum from './pages/AdminCurriculum';
import AdminFAQs from './pages/AdminFAQs';
import AdminStudents from './pages/AdminStudents';
import AdminAnalytics from './pages/AdminAnalytics';

// Public Pages
import FAQs from './pages/FAQs';

function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <ToastProvider>
          <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/faqs" element={<FAQs />} />

        {/* PRIVATE ROUTES – Protected by PrivateRoute and wrapped in Layout */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  {/* Dashboard is default after login */}
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Main Pages */}
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/courses/:id" element={<CourseDetail />} />
                  <Route path="/my-courses" element={<MyCourses />} />
                  <Route path="/lessons/:id" element={<LessonViewer />} />
                  <Route path="/ai-tutor" element={<AITutor />} />
                  <Route path="/classrooms" element={<Classrooms />} />
                  <Route path="/classrooms/:id" element={<ClassroomDetail />} />
                  <Route path="/consultations" element={<Consultations />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/progress" element={<Progress />} />

                  {/* Admin Pages */}
                  <Route path="/AdminCOSPrograms" element={<AdminCOSPrograms />} />
                  <Route path="/AdminFaculty" element={<AdminFaculty />} />
                  <Route path="/AdminCurriculum" element={<AdminCurriculum />} />
                  <Route path="/AdminFAQs" element={<AdminFAQs />} />
                  <Route path="/AdminStudents" element={<AdminStudents />} />
                  <Route path="/AdminAnalytics" element={<AdminAnalytics />} />

                  {/* Catch-all: redirect to dashboard if unknown route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
          </Routes>
        </ToastProvider>
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App;
// client/src/App.tsx
// Main application routing

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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

// Admin Pages
import AdminCOSPrograms from './pages/Admin/AdminCOSPrograms';
import AdminFaculty from './pages/Admin/AdminFaculty';
import AdminCurriculum from './pages/Admin/AdminCurriculum';
import AdminModules from './pages/Admin/AdminModules';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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
                  <Route path="/settings" element={<Settings />} />

                  {/* Admin Pages */}
                  <Route path="/AdminCOSPrograms" element={<AdminCOSPrograms />} />
                  <Route path="/AdminFaculty" element={<AdminFaculty />} />
                  <Route path="/AdminCurriculum" element={<AdminCurriculum />} />
                  <Route path="/AdminModules/:courseId" element={<AdminModules />} />

                  {/* Catch-all: redirect to dashboard if unknown route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
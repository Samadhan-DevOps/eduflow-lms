import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import AIChatBot from './components/common/AIChatBot';

// Pages
import HomePage         from './pages/HomePage';
import CoursesPage      from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LearnPage        from './pages/LearnPage';
import DashboardPage    from './pages/DashboardPage';
import MyLearningPage   from './pages/MyLearningPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import ProfilePage      from './pages/ProfilePage';
import NotFoundPage     from './pages/NotFoundPage';

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000*60*5, retry:1, refetchOnWindowFocus:false } },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner fullScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <AIChatBot />
              <Routes>
                {/* Public */}
                <Route path="/"               element={<HomePage />} />
                <Route path="/courses"        element={<CoursesPage />} />
                <Route path="/courses/:id"    element={<CourseDetailPage />} />

                {/* Auth */}
                <Route path="/login"    element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

                {/* Protected */}
                <Route path="/dashboard"   element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/my-learning" element={<PrivateRoute><MyLearningPage /></PrivateRoute>} />
                <Route path="/learn/:courseId"            element={<PrivateRoute><LearnPage /></PrivateRoute>} />
                <Route path="/learn/:courseId/:lessonId"  element={<PrivateRoute><LearnPage /></PrivateRoute>} />
                <Route path="/profile"     element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

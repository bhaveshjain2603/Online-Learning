import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import VideoPlayer from './components/VideoPlayer/VideoPlayer';
import './App.css';
import SignupForm from './components/Auth/SignupForm';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route
              path="/lecture"
              element={
                <ProtectedRoute>
                  <VideoPlayer 
                    videoId="video123" 
                    videoUrl="/videos/sample_recording.mp4"
                  />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;

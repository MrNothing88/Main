import BrandingBadge from './components/BrandingBadge';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './screens/SplashScreen';
import MainScreen from './screens/MainScreen';
import AIGuidanceScreen from './screens/AIGuidanceScreen';
import { initializeUser } from './services/api';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUserId(userData.id);
          setIsLoading(false);
        } else {
          const user = await initializeUser();
          localStorage.setItem('user_data', JSON.stringify(user));
          setUserId(user.id);
          setTimeout(() => setIsLoading(false), 2000);
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
        setTimeout(() => setIsLoading(false), 2000);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/main" replace />} />
        <Route path="/main" element={<MainScreen userId={userId} />} />
        <Route path="/ai-guidance" element={<AIGuidanceScreen userId={userId} />} />
        <Route path="*" element={<Navigate to="/main" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
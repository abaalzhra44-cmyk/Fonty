import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { AnimatedBackground } from './components/AnimatedBackground';
import { AuthModal } from './components/AuthModal';
import { RegistrationOnboardingModal } from './components/RegistrationOnboardingModal';
import { WelcomeBackModal } from './components/WelcomeBackModal';
import { SupportChatWidget } from './components/SupportChatWidget';

import { WelcomePage } from './pages/WelcomePage';
import { HomePage } from './pages/HomePage';
import { GalleryPage } from './pages/GalleryPage';
import { LabPage } from './pages/LabPage';
import { InspectorPage } from './pages/InspectorPage';
import { ComparePage } from './pages/ComparePage';
import { MyFontsPage } from './pages/MyFontsPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';
import { MaintenancePage } from './pages/MaintenancePage';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{
          duration: 0.12,
          ease: 'easeOut',
        }}
        className="w-full h-full"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/lab" element={<LabPage />} />
          <Route path="/inspector" element={<InspectorPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/my-fonts" element={<MyFontsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const MainAppContent: React.FC = () => {
  const { isLoggedIn, isAdmin } = useAuth();

  const isMaintenanceMode = localStorage.getItem('df_maintenance_mode') === 'true';
  const announcementActive = localStorage.getItem('df_announcement_active') === 'true';
  const announcementMsg = localStorage.getItem('df_announcement_msg');

  if (isMaintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] text-[#0f172a] flex flex-col font-body transition-colors duration-300 relative overflow-x-hidden">
        <AnimatedBackground />
        <MaintenancePage />
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#0f172a] flex flex-col font-body transition-colors duration-300 relative selection:bg-sky-500/20 selection:text-sky-800 overflow-x-hidden">
      {/* Announcement Banner */}
      {announcementActive && announcementMsg && (
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white text-xs py-2 px-4 text-center font-medium shadow-sm relative z-30 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{announcementMsg}</span>
        </div>
      )}

      {/* Animated Background */}
      <AnimatedBackground />

      {/* Top Sticky Header */}
      <TopHeader />

      {/* Global Auth Modal */}
      <AuthModal />

      {/* Post Registration Guided Onboarding Wizard Modal */}
      <RegistrationOnboardingModal />

      {/* Post Login Welcome Back Greeting Modal */}
      <WelcomeBackModal />

      {/* Main Body View */}
      <main className="flex-1 relative z-10">
        {!isLoggedIn ? <WelcomePage /> : <AnimatedRoutes />}
      </main>

      {/* Floating Bottom Navigation (Only visible when logged in) */}
      {isLoggedIn && <BottomNav />}

      {/* Floating Live Support Chat Widget */}
      <SupportChatWidget />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainAppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

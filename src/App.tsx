import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db, testFirestoreConnection, syncDomainConfigToFirestore } from './firebase';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { RegistrationOnboardingModal } from './components/RegistrationOnboardingModal';
import { WelcomeBackModal } from './components/WelcomeBackModal';

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

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.995,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1], // Smooth Apple-grade easeOut
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.995,
    transition: {
      duration: 0.15,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top upon navigating to a new route smoothly
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
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
  const [remoteMaintenance, setRemoteMaintenance] = useState<boolean>(false);

  useEffect(() => {
    // CRITICAL: Test Firestore connection handshake at boot
    testFirestoreConnection().catch(() => {});

    // Automatically sync official domain config to Firestore
    syncDomainConfigToFirestore().catch(() => {});

    // Fetch system configurations from Firebase Firestore
    async function loadSystemConfig() {
      try {
        const snap = await getDoc(doc(db, 'systemSettings', 'announcements'));
        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.maintenanceMode === 'boolean') setRemoteMaintenance(data.maintenanceMode);
        }
      } catch {
        // Fallback to local settings
      }
    }
    loadSystemConfig();
  }, []);

  const localMaintenanceMode = localStorage.getItem('df_maintenance_mode') === 'true';
  const isMaintenanceMode = remoteMaintenance || localMaintenanceMode;

  if (isMaintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-body transition-colors duration-300 relative overflow-x-hidden">
        <MaintenancePage />
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-body transition-colors duration-300 relative selection:bg-sky-500/20 selection:text-sky-800 overflow-x-hidden">
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

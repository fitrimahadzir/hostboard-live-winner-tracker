import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { ToastContainer } from './components/ToastContainer';
import { CreateGameModal } from './components/CreateGameModal';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { HomeTab } from './components/HomeTab';
import { ListGamesTab } from './components/ListGamesTab';
import { ProfileTab } from './components/ProfileTab';
import { ActivityTab } from './components/ActivityTab';
import { GameDetailView } from './components/GameDetailView';
import { OverlayPage } from './components/OverlayPage';
import { DEV_MODE } from './config/env';

// Inner component to access App Context values safely
const MainAppContent: React.FC = () => {
  const { user, loading, createGame } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'games' | 'activity' | 'profile'>('home');
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);
  const [isAuthRegister, setIsAuthRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070b12] gap-3">
        <div className="animate-spin text-rose-500 w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starting Host Engine...</p>
      </div>
    );
  }

  // Auth Redirects
  if (!user) {
    if (isAuthRegister) {
      return <RegisterView onNavigateToLogin={() => setIsAuthRegister(false)} />;
    }
    return <LoginView onNavigateToRegister={() => setIsAuthRegister(true)} />;
  }

  const handleCreateGame = async (title: string, gameType: string) => {
    try {
      const newGame = await createGame(title, gameType);
      // Navigate to the newly created game detail lobby automatically
      navigate(`/game/${newGame.id}`);
    } catch (err) {
      console.error('Failed to create game', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans pb-16">
      
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* FIXED SIDE NAVIGATION FOR DESKTOP & BOTTOM STICKY FOR MOBILE */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          navigate('/'); // Return to custom layout view index
        }}
        onRequestCreateGame={() => setIsCreateGameOpen(true)}
      />

      {/* CORE DISPLAY STAGE */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <Routes>
          
          {/* Main dashboard tab matching dispatcher */}
          <Route
            path="/"
            element={
              <>
                {activeTab === 'home' && (
                  <HomeTab
                    onSelectGame={(gameId) => navigate(`/game/${gameId}`)}
                    onRequestCreateGame={() => setIsCreateGameOpen(true)}
                  />
                )}
                {activeTab === 'games' && (
                  <ListGamesTab
                    onSelectGame={(gameId) => navigate(`/game/${gameId}`)}
                    onRequestCreateGame={() => setIsCreateGameOpen(true)}
                  />
                )}
                {activeTab === 'activity' && <ActivityTab />}
                {activeTab === 'profile' && <ProfileTab />}
              </>
            }
          />

          {/* Dedicated Game Detail Lobby Route */}
          <Route
            path="/game/:gameId"
            element={<GameDetailWrapper onBack={() => navigate('/')} />}
          />

          {/* Catch-all redirect to Dashboard layout route */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>

      {/* CREATE GAME POPUP MODAL SHEETS */}
      <CreateGameModal
        isOpen={isCreateGameOpen}
        onClose={() => setIsCreateGameOpen(false)}
        onCreate={handleCreateGame}
      />

      {/* FLOATING DEV MODE BADGE */}
      {DEV_MODE && (
        <div 
          className="fixed bottom-24 right-6 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-900/90 dark:bg-slate-950/90 text-rose-500 border border-rose-500/20 shadow-lg shadow-rose-500/10 backdrop-blur select-none"
          title="HostBoard bypassed login state for fast local iterations."
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>DEV MODE ACTIVE</span>
        </div>
      )}

    </div>
  );
};

// Simple Wrapper to read dynamic game params and manage Detail Lobbies cleanly
const GameDetailWrapper: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { gameId } = useParams<{ gameId: string }>();
  return gameId ? <GameDetailView gameId={gameId} onBack={onBack} /> : null;
};

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id-please-configure.apps.googleusercontent.com';

// Root Router shell
export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppProvider>
        <HashRouter>
          <Routes>
            {/* Realtime Transparent OBS Window handles its own wrapper layout without margins or layout toolbars */}
            <Route path="/overlay/:gameId" element={<OverlayPage />} />
            
            {/* Primary dashboards */}
            <Route path="*" element={<MainAppContent />} />
          </Routes>
        </HashRouter>
      </AppProvider>
    </GoogleOAuthProvider>
  );
}

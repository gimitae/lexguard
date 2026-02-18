import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './views/LandingPage';
import PreviewResult from './views/PreviewResult';
import AnalysisView from './views/AnalysisView';
// import LawFirmsView from './views/LawFirmsView'; // 삭제됨
import TermsView from './views/TermsView';
import SupportView from './views/SupportView';
import PrivacyView from './views/PrivacyView';
import LoadingScreen from './components/LoadingScreen';
import MyPage from './components/MyPage';

import SignupView from './Signup';
import LoginView from './Login';

import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const API_BASE_URL = 'http://localhost:8000';

const App = () => {
  const [appState, setAppState] = useState({
    user: {
      isLoggedIn: false,
      coins: 0,
      email: '',
      createdAt: null,
      isPremium: false,
      stats: {
        analyzed: 0,
        risksFound: 0,
        tokensUsed: 0
      }
    },
    analysis: {
      file: null,
      isProcessing: false,
      result: null
    },
    ui: {
      currentView: 'landing',
      selectedRisk: 'R1',
      isTransitioning: false,
      isMyPageOpen: false
    }
  });

  const updateUser = (updates) => {
    setAppState(prev => ({
      ...prev,
      user: { ...prev.user, ...updates }
    }));
  };

  const updateAnalysis = (updates) => {
    setAppState(prev => ({
      ...prev,
      analysis: { ...prev.analysis, ...updates }
    }));
  };

  const updateUI = (updates) => {
    setAppState(prev => ({
      ...prev,
      ui: { ...prev.ui, ...updates }
    }));
  };

  useEffect(() => {
    let unsubscribeUserDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);

        unsubscribeUserDoc = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            updateUser({
              isLoggedIn: true,
              email: currentUser.email,
              coins: userData.coins || 0,
              createdAt: userData.createdAt,
              isPremium: userData.isPremium || false,
              stats: {
                analyzed: userData.analysisCount || 0,
                risksFound: userData.totalRisksFound || 0,
                tokensUsed: userData.tokensUsed || 0
              }
            });
          }
        });
      } else {
        if (unsubscribeUserDoc) unsubscribeUserDoc();
        updateUser({
          isLoggedIn: false,
          coins: 0,
          email: '',
          createdAt: null,
          isPremium: false,
          stats: { analyzed: 0, risksFound: 0, tokensUsed: 0 }
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const navigateTo = useCallback((view) => {
    updateUI({ isTransitioning: true });
    setTimeout(() => {
      updateUI({ currentView: view, isTransitioning: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  }, []);

  const handleOpenMyPage = () => updateUI({ isMyPageOpen: true });
  const handleCloseMyPage = () => updateUI({ isMyPageOpen: false });

  const analyzeWithAPI = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      let idToken = '';
      if (auth.currentUser) {
        idToken = await auth.currentUser.getIdToken();
      }

      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          ...(idToken && { 'Authorization': `Bearer ${idToken}` })
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 402) throw new Error('코인이 부족합니다! 충전해주세요.');
        if (response.status === 401) throw new Error('로그인이 필요합니다.');
        const error = await response.json();
        throw new Error(error.detail || '분석 중 오류가 발생했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const handleFileUpload = useCallback((file) => {
    const maxSize = 20 * 1024 * 1024;
    if (!file) return alert('파일을 선택해주세요.');
    if (file.size > maxSize) return alert('파일 크기는 20MB를 초과할 수 없습니다.');

    updateAnalysis({ file, isProcessing: true });
    navigateTo('loading');

    analyzeWithAPI(file)
      .then((result) => {
        updateAnalysis({ isProcessing: false, result });
        if (!auth.currentUser) {
          navigateTo('preview_result');
        } else {
          navigateTo('analysis');
        }
      })
      .catch((error) => {
        alert(error.message);
        updateAnalysis({ isProcessing: false });
        navigateTo(error.message.includes('로그인') ? 'login' : 'landing');
      });
  }, [navigateTo]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      updateAnalysis({ file: null, result: null });
      updateUI({ isMyPageOpen: false });
      navigateTo('landing');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  }, [navigateTo]);

  const renderView = () => {
    const { currentView, isTransitioning } = appState.ui;

    if (appState.analysis.isProcessing) return <LoadingScreen />;

    const animationClass = isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0';

    return (
      <div className={`transition-all duration-300 ease-out ${animationClass}`}>
        {(currentView === 'landing' || currentView === 'login' || currentView === 'signup') && (
          <LandingPage onFileUpload={handleFileUpload} onNavigate={navigateTo} />
        )}

        {/* LawFirmsView 삭제됨 */}
        
        {currentView === 'terms' && <TermsView />}
        {currentView === 'support' && <SupportView />}
        {currentView === 'privacy' && (
          <PrivacyView onBack={() => navigateTo('signup')} />
        )}

        {currentView === 'preview_result' && (
          <PreviewResult
            file={appState.analysis.file}
            result={appState.analysis.result}
            onAuth={() => navigateTo('login')}
          />
        )}

        {currentView === 'analysis' && (
          <AnalysisView
            file={appState.analysis.file}
            result={appState.analysis.result}
            selectedRisk={appState.ui.selectedRisk}
            onRiskSelect={(riskId) => updateUI({ selectedRisk: riskId })}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Header
        isLoggedIn={appState.user.isLoggedIn}
        coins={appState.user.coins}
        onLogout={handleLogout}
        onNavigate={navigateTo}
        currentView={appState.ui.currentView}
        userEmail={appState.user.email}
        onOpenMyPage={handleOpenMyPage}
      />

      <main className="relative overflow-hidden pt-[73px]">
        {renderView()}
      </main>

      <MyPage
        isOpen={appState.ui.isMyPageOpen}
        onClose={handleCloseMyPage}
        user={appState.user}
        onLogout={handleLogout}
      />

      {appState.ui.currentView === 'login' && (
        <LoginView
          onLogin={() => navigateTo('landing')}
          onCancel={() => navigateTo('landing')}
          onSwitchToBjSignup={() => navigateTo('signup')}
        />
      )}

      {appState.ui.currentView === 'signup' && (
        <SignupView
          onAuth={() => navigateTo('landing')}
          onCancel={() => navigateTo('landing')}
          onNavigate={navigateTo}
        />
      )}

      {appState.ui.currentView === 'landing' && (
        <footer className="py-12 border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            © 2026 Barungyeyak LEGAL. ALL SECURED.
          </p>
        </footer>
      )}
    </div>
  );
};

export default App;
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './views/LandingPage';
import PreviewResult from './views/PreviewResult';
import AnalysisView from './views/AnalysisView';
import LawFirmsView from './views/LawFirmsView';
import TermsView from './views/TermsView';
import SupportView from './views/SupportView';
import LoadingScreen from './components/LoadingScreen';

// ✨ 회원가입과 로그인 컴포넌트
import SignupView from './Signup'; 
import LoginView from './Login'; 

// ✨ 파이어베이스 관련
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const API_BASE_URL = 'http://localhost:8000';

const App = () => {
  const [appState, setAppState] = useState({
    user: {
      isLoggedIn: false,
      tokens: 0, 
      email: '' 
    },
    analysis: {
      file: null,
      isProcessing: false,
      result: null
    },
    ui: {
      currentView: 'landing',
      selectedRisk: 'R1',
      isTransitioning: false
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

  // 파이어베이스 로그인 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            updateUser({ 
              isLoggedIn: true, 
              tokens: userData.coins, 
              email: currentUser.email 
            });
          }
        } catch (error) {
          console.error("코인 정보 로딩 실패:", error);
        }
      } else {
        updateUser({ isLoggedIn: false, tokens: 0, email: '' });
      }
    });
    return () => unsubscribe(); 
  }, []);

  const navigateTo = useCallback((view) => {
    updateUI({ isTransitioning: true });
    setTimeout(() => {
      updateUI({ currentView: view, isTransitioning: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  }, []);

  // API 호출
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

      const result = await response.json();
      
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
           updateUser({ tokens: userDoc.data().coins });
        }
      }
      return result;

    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // ✨ 여기 오타 수정했습니다! (PvHandleFileUpload -> handleFileUpload)
  const handleFileUpload = useCallback((file) => {
    const maxSize = 20 * 1024 * 1024;
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!file) return alert('파일을 선택해주세요.');
    if (file.size > maxSize) return alert('파일 크기는 20MB를 초과할 수 없습니다.');
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx)$/i)) return alert('PDF/DOCX만 가능합니다.');

    updateAnalysis({ file, isProcessing: true });
    navigateTo('loading');

    analyzeWithAPI(file)
      .then((result) => {
        handleAnalysisComplete(result);
      })
      .catch((error) => {
        alert(error.message);
        updateAnalysis({ isProcessing: false });
        
        if (error.message.includes('로그인')) {
            navigateTo('login'); 
        } else {
            navigateTo('landing');
        }
      });
  }, [navigateTo]); 

  const handleAnalysisComplete = (result) => {
    updateAnalysis({ isProcessing: false, result });
    navigateTo('analysis');
  };

  const handleLogout = useCallback(async () => {
    await signOut(auth); 
    updateAnalysis({ file: null, result: null });
    navigateTo('landing');
  }, [navigateTo]);

  // 메인 화면 렌더링
  const renderView = () => {
    const { currentView, isTransitioning } = appState.ui;

    if (appState.analysis.isProcessing) {
      return <LoadingScreen />;
    }

    const animationClass = isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0';

    return (
      <div className={`transition-all duration-300 ease-out ${animationClass}`}>
        {/* ✨ 로그인/회원가입 상태일 때도 뒤에 랜딩페이지가 보이도록 조건 추가 */}
        {(currentView === 'landing' || currentView === 'login' || currentView === 'signup') && (
          <LandingPage onFileUpload={handleFileUpload} />
        )}
        
        {currentView === 'lawfirms' && <LawFirmsView />}
        {currentView === 'terms' && <TermsView />}
        {currentView === 'support' && <SupportView />}
        
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
        tokens={appState.user.tokens}
        onLogout={handleLogout}
        onNavigate={navigateTo}
        currentView={appState.ui.currentView}
        userEmail={appState.user.email} 
      />
      
      {/* ⚠️ 중요: Modal은 애니메이션이나 overflow-hidden이 적용된 main 태그 밖으로 빼야 합니다! */}
      <main className="relative overflow-hidden">
        {renderView()}
      </main>

      {/* ✨ 모달을 여기로 이동 (Main 태그 바깥) */}
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
        />
      )}
      
      {appState.ui.currentView === 'landing' && (
        <footer className="py-12 border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            © 2024 바른계약 LEGAL. ALL SECURED.
          </p>
        </footer>
      )}
    </div>
  );
};

export default App;

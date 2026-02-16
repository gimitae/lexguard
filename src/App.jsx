import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './views/LandingPage';
import PreviewResult from './views/PreviewResult';
import AnalysisView from './views/AnalysisView';
import LawFirmsView from './views/LawFirmsView';
import TermsView from './views/TermsView';
import SupportView from './views/SupportView';
import LoadingScreen from './components/LoadingScreen';
import MyPage from './components/MyPage'; // ✨ 마이페이지 추가

// 회원가입과 로그인 컴포넌트
import SignupView from './Signup'; 
import LoginView from './Login'; 

// 파이어베이스 관련
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const API_BASE_URL = 'http://localhost:8000';

const App = () => {
  const [appState, setAppState] = useState({
    user: {
      isLoggedIn: false,
      tokens: 0, 
      email: '',
      createdAt: null,
      isPremium: false
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
      isMyPageOpen: false // ✨ 마이페이지 상태 추가
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

  // ✨ 파이어베이스 인증 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            updateUser({ 
              isLoggedIn: true,
              email: firebaseUser.email,
              tokens: userData.tokens || 0,
              createdAt: userData.createdAt || null,
              isPremium: userData.isPremium || false
            });
          }
        } catch (error) {
          console.error('사용자 데이터 로딩 오류:', error);
        }
      } else {
        updateUser({ 
          isLoggedIn: false,
          email: '',
          tokens: 0,
          createdAt: null,
          isPremium: false
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // 페이지 전환
  const navigateTo = useCallback((view) => {
    updateUI({ isTransitioning: true });
    
    setTimeout(() => {
      updateUI({ currentView: view, isTransitioning: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  }, []);

  // ✨ 마이페이지 열기/닫기
  const handleOpenMyPage = () => {
    updateUI({ isMyPageOpen: true });
  };

  const handleCloseMyPage = () => {
    updateUI({ isMyPageOpen: false });
  };

  // API 호출
  const analyzeWithAPI = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '분석 중 오류가 발생했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // 파일 업로드
  const handleFileUpload = useCallback((file) => {
    const maxSize = 20 * 1024 * 1024;
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!file) {
      alert('파일을 선택해주세요.');
      return;
    }

    if (file.size > maxSize) {
      alert('파일 크기는 20MB를 초과할 수 없습니다.');
      return;
    }

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx)$/i)) {
      alert('PDF 또는 DOCX 파일만 업로드 가능합니다.');
      return;
    }

    updateAnalysis({ file, isProcessing: true });
    navigateTo('loading');

    analyzeWithAPI(file)
      .then((result) => {
        handleAnalysisComplete(result);
      })
      .catch((error) => {
        alert(error.message);
        updateAnalysis({ isProcessing: false });
        navigateTo('landing');
      });
  }, [navigateTo]);

  const handleAnalysisComplete = (result) => {
    updateAnalysis({ 
      isProcessing: false,
      result 
    });
    
    if (!appState.user.isLoggedIn) {
      navigateTo('preview_result');
    } else {
      navigateTo('analysis');
    }
  };

  // 로그아웃
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      updateUser({ 
        isLoggedIn: false, 
        email: '',
        tokens: 0,
        createdAt: null,
        isPremium: false
      });
      updateAnalysis({ file: null, result: null });
      updateUI({ isMyPageOpen: false }); // ✨ 마이페이지 닫기
      navigateTo('landing');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  }, [navigateTo]);

  // 뷰 렌더링
  const renderView = () => {
    const { currentView, isTransitioning } = appState.ui;

    if (appState.analysis.isProcessing) {
      return <LoadingScreen />;
    }

    const animationClass = isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0';

    return (
      <div className={`transition-all duration-300 ease-out ${animationClass}`}>
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
        onOpenMyPage={handleOpenMyPage} // ✨ 마이페이지 열기 함수 전달
      />
      
      <main className="relative overflow-hidden">
        {renderView()}
      </main>

      {/* 로그인/회원가입 모달 */}
      {appState.ui.currentView === 'login' && (
        <LoginView 
          onLogin={() => navigateTo('landing')} 
          onCancel={() => navigateTo('landing')}
          onSwitchToSignup={() => navigateTo('signup')}
        />
      )}

      {appState.ui.currentView === 'signup' && (
        <SignupView 
          onAuth={() => navigateTo('landing')} 
          onCancel={() => navigateTo('landing')}
        />
      )}

      {/* ✨ 마이페이지 (오른쪽 슬라이드) */}
      <MyPage
        isOpen={appState.ui.isMyPageOpen}
        onClose={handleCloseMyPage}
        user={appState.user}
        onLogout={handleLogout}
      />
      
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
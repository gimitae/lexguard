import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './views/LandingPage';
import PreviewResult from './views/PreviewResult';
import AnalysisView from './views/AnalysisView';
import SignupView from './views/SignupView';
import LawFirmsView from './views/LawFirmsView';
import TermsView from './views/TermsView';
import SupportView from './views/SupportView';
import LoadingScreen from './components/LoadingScreen';

const API_BASE_URL = 'http://localhost:8000';

const App = () => {
  const [appState, setAppState] = useState({
    user: {
      isLoggedIn: false,
      tokens: 0
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

  // 페이지 전환 애니메이션
  const navigateTo = useCallback((view) => {
    // 페이드 아웃
    updateUI({ isTransitioning: true });
    
    setTimeout(() => {
      // 뷰 변경
      updateUI({ currentView: view, isTransitioning: false });
      // 페이지 최상단으로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  }, []);

  // 실제 API 호출
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

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

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

    // 실제 API 호출
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

  const handleAuth = useCallback(() => {
    updateUser({ 
      isLoggedIn: true, 
      tokens: 2 
    });
    
    if (appState.analysis.result) {
      navigateTo('analysis');
    } else {
      navigateTo('landing');
    }
  }, [appState.analysis.result, navigateTo]);

  const handleLogout = useCallback(() => {
    updateUser({ 
      isLoggedIn: false, 
      tokens: 0 
    });
    updateAnalysis({
      file: null,
      result: null
    });
    navigateTo('landing');
  }, [navigateTo]);

  // 페이지 컴포넌트 렌더링
  const renderView = () => {
    const { currentView, isTransitioning } = appState.ui;

    if (appState.analysis.isProcessing) {
      return <LoadingScreen />;
    }

    // 페이드 인/아웃 효과
    const animationClass = isTransitioning 
      ? 'opacity-0 translate-y-4' 
      : 'opacity-100 translate-y-0';

    return (
      <div className={`transition-all duration-300 ease-out ${animationClass}`}>
        {currentView === 'landing' && (
          <LandingPage onFileUpload={handleFileUpload} />
        )}
        
        {currentView === 'lawfirms' && (
          <LawFirmsView />
        )}
        
        {currentView === 'terms' && (
          <TermsView />
        )}
        
        {currentView === 'support' && (
          <SupportView />
        )}
        
        {currentView === 'preview_result' && (
          <PreviewResult 
            file={appState.analysis.file}
            result={appState.analysis.result}
            onAuth={handleAuth}
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
        
        {currentView === 'signup' && (
          <SignupView 
            onAuth={handleAuth}
            onCancel={() => navigateTo('landing')}
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
      />
      
      <main className="relative overflow-hidden">
        {renderView()}
      </main>
      
      {appState.ui.currentView === 'landing' && (
        <footer className="py-12 border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            © 2024 LEXGUARD LEGAL. ALL SECURED.
          </p>
        </footer>
      )}
    </div>
  );
};

export default App;
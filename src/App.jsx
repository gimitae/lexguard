import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './views/LandingPage';
import PreviewResult from './views/PreviewResult';
import AnalysisView from './views/AnalysisView';
import LawFirmsView from './views/LawFirmsView';
import TermsView from './views/TermsView';
import SupportView from './views/SupportView';
import LoadingScreen from './components/LoadingScreen';
<<<<<<< HEAD

// 컴포넌트
import SignupView from './Signup'; 
import LoginView from './Login'; 
import MyPage from './components/MyPage'; 

// 파이어베이스
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // ✨ getDoc 대신 onSnapshot 사용
=======
import MyPage from './components/MyPage'; // ✨ 마이페이지 추가

// 회원가입과 로그인 컴포넌트
import SignupView from './Signup'; 
import LoginView from './Login'; 

// 파이어베이스 관련
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
>>>>>>> origin/mypage

const API_BASE_URL = 'http://localhost:8000';

const App = () => {
  const [appState, setAppState] = useState({
    user: {
      isLoggedIn: false,
      tokens: 0, 
      email: '',
      createdAt: null,
<<<<<<< HEAD
      isPremium: false,
      // ✨ 통계 데이터 초기값 추가
      stats: {
        analyzed: 0,    // 분석 요청 횟수
        risksFound: 0,  // 발견한 위험 수
        tokensUsed: 0   // 사용한 토큰 수
      }
=======
      isPremium: false
>>>>>>> origin/mypage
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
<<<<<<< HEAD
      isMyPageOpen: false 
=======
      isMyPageOpen: false // ✨ 마이페이지 상태 추가
>>>>>>> origin/mypage
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

<<<<<<< HEAD
  // 🔥 [핵심 변경] 파이어베이스 실시간 데이터 연동 (onSnapshot)
  useEffect(() => {
    let unsubscribeUserDoc = null; // 유저 데이터 구독 취소 함수

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // 1. 로그인 함 -> 내 정보 실시간 구독 시작!
        const userDocRef = doc(db, "users", currentUser.uid);
        
        unsubscribeUserDoc = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            
            // DB에 있는 최신 정보로 싹 업데이트
            updateUser({ 
              isLoggedIn: true, 
              email: currentUser.email,
              tokens: userData.coins || 0,        // ✨ 토큰 실시간 반영
              createdAt: userData.createdAt, 
              isPremium: userData.isPremium || false,
              // ✨ 통계 정보 가져오기 (없으면 0)
              stats: {
                analyzed: userData.analysisCount || 0,
                risksFound: userData.totalRisksFound || 0,
                tokensUsed: userData.tokensUsed || 0
              }
            });
          }
        });
      } else {
        // 2. 로그아웃 함 -> 구독 취소 및 정보 초기화
        if (unsubscribeUserDoc) unsubscribeUserDoc();
        updateUser({ 
          isLoggedIn: false, 
          tokens: 0, 
          email: '', 
          createdAt: null, 
          isPremium: false,
          stats: { analyzed: 0, risksFound: 0, tokensUsed: 0 }
=======
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
>>>>>>> origin/mypage
        });
      }
    });

<<<<<<< HEAD
    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const navigateTo = useCallback((view) => {
    updateUI({ isTransitioning: true });
=======
    return () => unsubscribe();
  }, []);

  // 페이지 전환
  const navigateTo = useCallback((view) => {
    updateUI({ isTransitioning: true });
    
>>>>>>> origin/mypage
    setTimeout(() => {
      updateUI({ currentView: view, isTransitioning: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  }, []);

<<<<<<< HEAD
  // API 호출 함수
=======
  // ✨ 마이페이지 열기/닫기
  const handleOpenMyPage = () => {
    updateUI({ isMyPageOpen: true });
  };

  const handleCloseMyPage = () => {
    updateUI({ isMyPageOpen: false });
  };

  // API 호출
>>>>>>> origin/mypage
  const analyzeWithAPI = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
<<<<<<< HEAD
      let idToken = '';
      if (auth.currentUser) {
        idToken = await auth.currentUser.getIdToken();
      }

      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          ...(idToken && { 'Authorization': `Bearer ${idToken}` })
        },
=======
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
>>>>>>> origin/mypage
        body: formData,
      });

      if (!response.ok) {
<<<<<<< HEAD
        if (response.status === 402) throw new Error('코인이 부족합니다! 충전해주세요.');
        if (response.status === 401) throw new Error('로그인이 필요합니다.');
=======
>>>>>>> origin/mypage
        const error = await response.json();
        throw new Error(error.detail || '분석 중 오류가 발생했습니다.');
      }

<<<<<<< HEAD
      const result = await response.json();
      
      // 참고: 여기서 코인을 다시 불러올 필요가 없습니다. 
      // 위에서 만든 onSnapshot이 DB 변화를 감지해서 알아서 업데이트 해줍니다! 😎
      
      return result;

=======
      return await response.json();
>>>>>>> origin/mypage
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

<<<<<<< HEAD
  const handleFileUpload = useCallback((file) => {
    const maxSize = 20 * 1024 * 1024;
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!file) return alert('파일을 선택해주세요.');
    if (file.size > maxSize) return alert('파일 크기는 20MB를 초과할 수 없습니다.');
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx)$/i)) return alert('PDF/DOCX만 가능합니다.');
=======
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
>>>>>>> origin/mypage

    updateAnalysis({ file, isProcessing: true });
    navigateTo('loading');

    analyzeWithAPI(file)
      .then((result) => {
        handleAnalysisComplete(result);
      })
      .catch((error) => {
        alert(error.message);
        updateAnalysis({ isProcessing: false });
<<<<<<< HEAD
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
    updateUI({ isMyPageOpen: false }); 
    navigateTo('landing');
  }, [navigateTo]);

=======
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
>>>>>>> origin/mypage
  const renderView = () => {
    const { currentView, isTransitioning } = appState.ui;

    if (appState.analysis.isProcessing) {
      return <LoadingScreen />;
    }

    const animationClass = isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0';

    return (
      <div className={`transition-all duration-300 ease-out ${animationClass}`}>
        {(currentView === 'landing' || currentView === 'login' || currentView === 'signup') && (
<<<<<<< HEAD
          <LandingPage 
            onFileUpload={handleFileUpload} 
            // ✨ [추가됨] 랜딩페이지 버튼 클릭 시 이동 함수 전달
            onNavigate={navigateTo}
          />
        )}
        
        {currentView === 'lawfirms' && (
          <LawFirmsView onAuth={() => navigateTo('login')} />
        )}
        
=======
          <LandingPage onFileUpload={handleFileUpload} />
        )}
        
        {currentView === 'lawfirms' && <LawFirmsView />}
>>>>>>> origin/mypage
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
<<<<<<< HEAD
        tokens={appState.user.tokens} // ✨ 실시간 토큰값 전달
=======
        tokens={appState.user.tokens}
>>>>>>> origin/mypage
        onLogout={handleLogout}
        onNavigate={navigateTo}
        currentView={appState.ui.currentView}
        userEmail={appState.user.email}
<<<<<<< HEAD
        onOpenMyPage={() => updateUI({ isMyPageOpen: true })}
=======
        onOpenMyPage={handleOpenMyPage} // ✨ 마이페이지 열기 함수 전달
>>>>>>> origin/mypage
      />
      
      <main className="relative overflow-hidden">
        {renderView()}
      </main>

<<<<<<< HEAD
      <MyPage 
        isOpen={appState.ui.isMyPageOpen}
        onClose={() => updateUI({ isMyPageOpen: false })}
        user={appState.user} // ✨ 실시간 통계가 포함된 user 객체 전달
        onLogout={handleLogout}
      />

=======
      {/* 로그인/회원가입 모달 */}
>>>>>>> origin/mypage
      {appState.ui.currentView === 'login' && (
        <LoginView 
          onLogin={() => navigateTo('landing')} 
          onCancel={() => navigateTo('landing')}
<<<<<<< HEAD
          onSwitchToBjSignup={() => navigateTo('signup')}
=======
          onSwitchToSignup={() => navigateTo('signup')}
>>>>>>> origin/mypage
        />
      )}

      {appState.ui.currentView === 'signup' && (
        <SignupView 
          onAuth={() => navigateTo('landing')} 
          onCancel={() => navigateTo('landing')}
        />
      )}
<<<<<<< HEAD
=======

      {/* ✨ 마이페이지 (오른쪽 슬라이드) */}
      <MyPage
        isOpen={appState.ui.isMyPageOpen}
        onClose={handleCloseMyPage}
        user={appState.user}
        onLogout={handleLogout}
      />
>>>>>>> origin/mypage
      
      {appState.ui.currentView === 'landing' && (
        <footer className="py-12 border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
<<<<<<< HEAD
            © 2026 바른계약 LEGAL. ALL SECURED.
=======
            © 2024 바른계약 LEGAL. ALL SECURED.
>>>>>>> origin/mypage
          </p>
        </footer>
      )}
    </div>
  );
};

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> origin/mypage

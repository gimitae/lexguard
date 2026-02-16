<<<<<<< HEAD
import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useTranslation } from "react-i18next"; // ✨ 추가됨

const Login = ({ onLogin, onCancel, onSwitchToBjSignup }) => {
  const { t } = useTranslation(); // ✨ 훅 사용
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin(); 
    } catch (err) {
      setError(t('auth.loginError')); // ✨ 번역 적용
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">
          {t('auth.loginTitle')}
        </h2>
        
        {error && <p className="mb-4 text-sm text-red-500 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label 
              htmlFor="login-email" 
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              {t('auth.email')}
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="admin@lexguard.com"
              required
            />
          </div>
          
          <div>
            <label 
              htmlFor="login-password" 
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              {t('auth.password')}
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-lg shadow-blue-500/30"
          >
            {t('auth.loginButton')}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 underline block w-full"
          >
            {t('auth.close')}
          </button>
          <div className="text-sm text-gray-600">
            {t('auth.noAccount')}{" "}
            <button 
              onClick={onSwitchToBjSignup}
              className="font-bold text-blue-600 hover:text-blue-800 ml-1"
            >
              {t('auth.moveToSignup')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

=======
import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useTranslation } from "react-i18next"; // ✨ 추가됨

const Login = ({ onLogin, onCancel, onSwitchToBjSignup }) => {
  const { t } = useTranslation(); // ✨ 훅 사용
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin(); 
    } catch (err) {
      setError(t('auth.loginError')); // ✨ 번역 적용
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">
          {t('auth.loginTitle')}
        </h2>
        
        {error && <p className="mb-4 text-sm text-red-500 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label 
              htmlFor="login-email" 
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              {t('auth.email')}
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="admin@lexguard.com"
              required
            />
          </div>
          
          <div>
            <label 
              htmlFor="login-password" 
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              {t('auth.password')}
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-lg shadow-blue-500/30"
          >
            {t('auth.loginButton')}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 underline block w-full"
          >
            {t('auth.close')}
          </button>
          <div className="text-sm text-gray-600">
            {t('auth.noAccount')}{" "}
            <button 
              onClick={onSwitchToBjSignup}
              className="font-bold text-blue-600 hover:text-blue-800 ml-1"
            >
              {t('auth.moveToSignup')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

>>>>>>> origin/mypage
export default Login;
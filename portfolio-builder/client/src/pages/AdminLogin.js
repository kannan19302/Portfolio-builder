import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const AdminLogin = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasUsers, setHasUsers] = useState(true);
  const [checkingUsers, setCheckingUsers] = useState(true);

  const { login, register, checkUsers, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    // Check if any users exist when component mounts
    const checkUserStatus = async () => {
      setCheckingUsers(true);
      const result = await checkUsers();
      setHasUsers(result.hasUsers);
      
      // If no users exist, automatically switch to registration mode
      if (!result.hasUsers) {
        setIsLoginMode(false);
      }
      
      setCheckingUsers(false);
    };

    checkUserStatus();
  }, [checkUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Client-side validation
    if (!credentials.username || !credentials.password) {
      setError('Username and password are required');
      setLoading(false);
      return;
    }

    // Additional validation for registration
    if (!isLoginMode) {
      if (!credentials.confirmPassword) {
        setError('Username, password, and confirm password are required');
        setLoading(false);
        return;
      }
      if (credentials.password !== credentials.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (credentials.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }
      if (credentials.username.length < 3) {
        setError('Username must be at least 3 characters long');
        setLoading(false);
        return;
      }
    }

    const result = isLoginMode 
      ? await login({ username: credentials.username, password: credentials.password })
      : await register({
          username: credentials.username,
          password: credentials.password,
          email: credentials.email
        });
    
    if (result.success) {
      if (!isLoginMode) {
        setSuccess('Registration successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1500);
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const toggleMode = () => {
    if (!hasUsers && isLoginMode) {
      setError('No users exist. Please register first.');
      return;
    }
    
    setIsLoginMode(!isLoginMode);
    setCredentials({
      username: '',
      password: '',
      confirmPassword: '',
      email: ''
    });
    setError('');
    setSuccess('');
  };

  if (checkingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
            <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isLoginMode ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              )}
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isLoginMode ? 'Admin Login' : 'Admin Registration'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLoginMode 
              ? 'Sign in to access the portfolio dashboard' 
              : hasUsers 
                ? 'Create an admin account to manage your portfolio'
                : 'No admin users found. Create the first admin account.'
            }
          </p>
        </div>

        {!hasUsers && (
          <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">First Time Setup</h3>
                <p className="mt-1 text-sm">
                  This appears to be your first time setting up the portfolio. Please create an admin account to get started.
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={handleChange}
              />
            </div>

            {!isLoginMode && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email (optional)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={handleChange}
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>

            {!isLoginMode && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="Confirm your password"
                  value={credentials.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isLoginMode ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLoginMode ? 'Sign in' : 'Create Account'
              )}
            </button>
          </div>

          {hasUsers && (
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
              >
                {isLoginMode 
                  ? "Don't have an account? Register here" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          )}

          <div className="text-center">
            <a
              href="/"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
            >
              ← Back to Portfolio
            </a>
          </div>
        </form>

        {/* Default credentials info for development - only show if users exist and in login mode */}
        {hasUsers && isLoginMode && (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
              Default Credentials (if available)
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Username: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">admin</code><br />
              Password: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">admin123</code>
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
              Change these credentials after first login for security.
            </p>
          </div>
        )}

        {!isLoginMode && (
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">
              Registration Requirements
            </h3>
            <ul className="text-xs text-green-600 dark:text-green-300 space-y-1">
              <li>• Username must be at least 3 characters long</li>
              <li>• Password must be at least 6 characters long</li>
              <li>• Email is optional but recommended</li>
              <li>• You will be automatically logged in after registration</li>
            </ul>
          </div>
        )}


      </div>
    </div>
  );
};

export default AdminLogin;
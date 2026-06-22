import { useState } from 'react';

import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

export const AuthNavigator = () => {
  const [screen, setScreen] = useState<'login' | 'register'>('login');

  if (screen === 'register') {
    return <RegisterScreen onLogin={() => setScreen('login')} />;
  }

  return <LoginScreen onRegister={() => setScreen('register')} />;
};

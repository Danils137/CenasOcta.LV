import React, { useState } from 'react';
import { View, TextInput, Button, Text, ActivityIndicator } from 'react-native';
import { signInWithEmail, signUpWithEmail } from '../lib/authService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleSignIn = async () => {
    setErrorMsg(null);
    setLoadingLocal(true);
    const { user: u, error } = await signInWithEmail(email, password);
    setLoadingLocal(false);

    if (error) setErrorMsg(error.message);
    else if (!u) setErrorMsg(t('loginRequired'));
  };

  const handleSignUp = async () => {
    setErrorMsg(null);
    setLoadingLocal(true);
    const { user: u, error } = await signUpWithEmail(email, password);
    setLoadingLocal(false);

    if (error) setErrorMsg(error.message);
    else if (!u) setErrorMsg(t('forgotPassword'));
  };

  if (user) {
    return (
      <View style={{ padding: 20 }}>
        <Text>{t('signIn')} {t('email')}: {user.email}</Text>
        <Button title={t('signOut')} onPress={useAuth().signOut} />
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder={t('email')}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ marginBottom: 12, borderWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder={t('password')}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ marginBottom: 12, borderWidth: 1, padding: 8 }}
      />
      {errorMsg ? <Text style={{ color: 'red', marginBottom: 12 }}>{errorMsg}</Text> : null}
      <Button title={loadingLocal ? t('loginRequiredDesc') : t('signIn')} onPress={handleSignIn} disabled={loadingLocal} />
      <View style={{ height: 8 }} />
      <Button title={t('signUp')} onPress={handleSignUp} disabled={loadingLocal} />
      {loadingLocal && <ActivityIndicator style={{ marginTop: 12 }} />}
    </View>
  );
};

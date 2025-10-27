import React, { useState } from 'react';
import { View, TextInput, Button, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { signInWithEmail, signUpWithEmail, resetPassword } from '../lib/authService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoadingLocal(true);
    const { user: u, error } = await signInWithEmail(email, password);
    setLoadingLocal(false);

    if (error) setErrorMsg(error.message);
    else if (!u) setErrorMsg(t('loginRequired'));
  };

  const handleSignUp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoadingLocal(true);
    const { user: u, error } = await signUpWithEmail(email, password);
    setLoadingLocal(false);

    if (error) setErrorMsg(error.message);
    else if (!u) setErrorMsg(t('loginRequired'));
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMsg(t('email') + ' ' + t('loginRequired').toLowerCase());
      return;
    }
    
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoadingLocal(true);
    const { error } = await resetPassword(email);
    setLoadingLocal(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(t('resetLinkSent') + ' ' + t('checkEmail'));
      setTimeout(() => {
        setShowResetForm(false);
        setSuccessMsg(null);
      }, 3000);
    }
  };

  if (user) {
    return (
      <View style={{ padding: 20 }}>
        <Text>{t('signIn')} {t('email')}: {user.email}</Text>
        <Button title={t('signOut')} onPress={useAuth().signOut} />
      </View>
    );
  }

  if (showResetForm) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>{t('resetPasswordTitle')}</Text>
        <Text style={{ marginBottom: 16, color: '#666' }}>{t('resetPasswordDesc')}</Text>
        <TextInput
          placeholder={t('email')}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={{ marginBottom: 12, borderWidth: 1, padding: 8 }}
        />
        {errorMsg ? <Text style={{ color: 'red', marginBottom: 12 }}>{errorMsg}</Text> : null}
        {successMsg ? <Text style={{ color: 'green', marginBottom: 12 }}>{successMsg}</Text> : null}
        <Button 
          title={loadingLocal ? t('processing') : t('sendResetLink')} 
          onPress={handleResetPassword} 
          disabled={loadingLocal} 
        />
        <View style={{ height: 8 }} />
        <TouchableOpacity onPress={() => setShowResetForm(false)} disabled={loadingLocal}>
          <Text style={{ color: '#007bff', textAlign: 'center', padding: 8 }}>{t('backToLogin')}</Text>
        </TouchableOpacity>
        {loadingLocal && <ActivityIndicator style={{ marginTop: 12 }} />}
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
      {successMsg ? <Text style={{ color: 'green', marginBottom: 12 }}>{successMsg}</Text> : null}
      <Button title={loadingLocal ? t('processing') : t('signIn')} onPress={handleSignIn} disabled={loadingLocal} />
      <View style={{ height: 8 }} />
      <Button title={t('signUp')} onPress={handleSignUp} disabled={loadingLocal} />
      <TouchableOpacity onPress={() => setShowResetForm(true)} disabled={loadingLocal} style={{ marginTop: 12 }}>
        <Text style={{ color: '#007bff', textAlign: 'center' }}>{t('forgotPassword')}</Text>
      </TouchableOpacity>
      {loadingLocal && <ActivityIndicator style={{ marginTop: 12 }} />}
    </View>
  );
};

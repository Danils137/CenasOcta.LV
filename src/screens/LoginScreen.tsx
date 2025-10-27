import React, { useState } from 'react';
import { View, TextInput, Text, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { signInWithEmail, signUpWithEmail, resetPassword } from '../lib/authService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
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
      <View style={styles.container}>
        <LinearGradient
          colors={['#059669', '#10B981']}
          style={styles.gradient}
        >
          <View style={styles.loggedInCard}>
            <User size={64} color="#059669" />
            <Text style={styles.loggedInTitle}>{t('profile')}</Text>
            <Text style={styles.loggedInEmail}>{user.email}</Text>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={useAuth().signOut}
            >
              <Text style={styles.signOutButtonText}>{t('signOut')}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (showResetForm) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <LinearGradient
          colors={['#059669', '#10B981']}
          style={styles.gradient}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.title}>{t('resetPasswordTitle')}</Text>
              <Text style={styles.subtitle}>{t('resetPasswordDesc')}</Text>

              <View style={styles.inputContainer}>
                <Mail size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  placeholder={t('email')}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
              {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

              <TouchableOpacity
                style={[styles.button, loadingLocal && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={loadingLocal}
              >
                {loadingLocal ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>{t('sendResetLink')}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowResetForm(false)}
                disabled={loadingLocal}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>{t('backToLogin')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#059669', '#10B981']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>
              {isSignUp ? t('signUp') : t('signIn')}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp ? t('loginRequiredDesc') : t('loginRequiredDesc')}
            </Text>

            <View style={styles.inputContainer}>
              <Mail size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                placeholder={t('email')}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                placeholder={t('password')}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
            {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loadingLocal && styles.buttonDisabled]}
              onPress={isSignUp ? handleSignUp : handleSignIn}
              disabled={loadingLocal}
            >
              {loadingLocal ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? t('signUp') : t('signIn')}
                </Text>
              )}
            </TouchableOpacity>

            {!isSignUp && (
              <TouchableOpacity
                onPress={() => setShowResetForm(true)}
                disabled={loadingLocal}
                style={styles.forgotPassword}
              >
                <Text style={styles.linkText}>{t('forgotPassword')}</Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>
                {isSignUp ? t('signIn') : t('signUp')}
              </Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={loadingLocal}
              style={styles.switchButton}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp ? t('signIn') : t('signUp')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loggedInCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 40,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginTop: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  switchButton: {
    borderWidth: 2,
    borderColor: '#059669',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  loggedInTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  loggedInEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

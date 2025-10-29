import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmail, signUpWithEmail, resetPassword } from '../lib/authService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width, height } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

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

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrorMsg(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');
  };

  if (user) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loggedInContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#fff" />
          <Text style={styles.loggedInText}>{t('signIn')}</Text>
          <Text style={styles.loggedInEmail}>{user.email}</Text>
          <TouchableOpacity style={styles.signOutButton} onPress={useAuth().signOut}>
            <Text style={styles.signOutButtonText}>{t('signOut')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (showResetForm) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="key-outline" size={60} color="#667eea" />
              </View>

              <Text style={styles.title}>{t('resetPasswordTitle')}</Text>
              <Text style={styles.subtitle}>{t('resetPasswordDesc')}</Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#667eea"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder={t('email')}
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                />
              </View>

              {errorMsg ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color="#ff4757" />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              {successMsg ? (
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="#2ed573" />
                  <Text style={styles.successText}>{successMsg}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.primaryButton, loadingLocal && styles.disabledButton]}
                onPress={handleResetPassword}
                disabled={loadingLocal}
              >
                {loadingLocal ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="paper-plane-outline" size={20} color="#fff" />
                    <Text style={styles.primaryButtonText}>{t('sendResetLink')}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowResetForm(false)}
                disabled={loadingLocal}
                style={styles.linkButton}
              >
                <Ionicons name="arrow-back" size={18} color="#667eea" />
                <Text style={styles.linkText}>{t('backToLogin')}</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={isSignUp ? 'person-add' : 'person'}
                size={60}
                color="#667eea"
              />
            </View>

            <Text style={styles.title}>
              {isSignUp ? t('signUp') : t('signIn')}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Создайте аккаунт для продолжения' : 'Войдите в свой аккаунт'}
            </Text>

            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !isSignUp && styles.toggleButtonActive,
                ]}
                onPress={() => !isSignUp || toggleMode()}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    !isSignUp && styles.toggleButtonTextActive,
                  ]}
                >
                  {t('signIn')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  isSignUp && styles.toggleButtonActive,
                ]}
                onPress={() => isSignUp || toggleMode()}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    isSignUp && styles.toggleButtonTextActive,
                  ]}
                >
                  {t('signUp')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#667eea"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder={t('email')}
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#667eea"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder={t('password')}
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {isSignUp && (
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#667eea"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder={t('confirmPassword')}
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            )}

            {!isSignUp && (
              <TouchableOpacity
                onPress={() => setShowResetForm(true)}
                disabled={loadingLocal}
                style={styles.forgotButton}
              >
                <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
              </TouchableOpacity>
            )}

            {errorMsg ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#ff4757" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#2ed573" />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryButton, loadingLocal && styles.disabledButton]}
              onPress={isSignUp ? handleSignUp : handleSignIn}
              disabled={loadingLocal}
            >
              {loadingLocal ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={isSignUp ? 'person-add' : 'log-in'}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.primaryButtonText}>
                    {isSignUp ? t('signUp') : t('signIn')}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>или</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={24} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={24} color="#4267B2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  formContainer: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3436',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
    marginBottom: 30,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f4ff',
    borderRadius: 15,
    padding: 4,
    marginBottom: 25,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2d3436',
  },
  eyeIcon: {
    padding: 5,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe5e5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  errorText: {
    color: '#ff4757',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5ffe5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  successText: {
    color: '#2ed573',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    borderRadius: 15,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dfe6e9',
  },
  dividerText: {
    color: '#b2bec3',
    marginHorizontal: 15,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  socialButton: {
    width: 55,
    height: 55,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  linkText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  loggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loggedInText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  loggedInEmail: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 30,
  },
  signOutButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  signOutButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

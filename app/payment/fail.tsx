import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { XCircle, RefreshCcw, Mail } from 'lucide-react-native';

const SUPPORT_EMAIL = 'support@cenasocta.lv';

export default function PaymentFailScreen() {
  const handleRetry = () => {
    // If we have a previous screen in history, go back, otherwise send the user home.
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleContact = () => {
    const mailto = `mailto:${SUPPORT_EMAIL}`;
    Linking.openURL(mailto).catch(() => {
      // Fallback: copy email to clipboard is not readily available in RN web without extra deps,
      // so redirect to plain mailto even if Linking fails.
      if (Platform.OS === 'web') {
        window.location.href = mailto;
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <XCircle size={48} color="#DC2626" />
        </View>
        <Text style={styles.title}>Maksājums nav izdevies</Text>
        <Text style={styles.subtitle}>
          Lūdzu, mēģiniet vēlreiz. Ja kļūda atkārtojas, sazinieties ar mums.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={handleRetry}>
          <RefreshCcw size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Atkārtot maksājumu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleContact}>
          <Mail size={20} color="#059669" />
          <Text style={styles.secondaryButtonText}>{SUPPORT_EMAIL}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    width: '100%',
    maxWidth: 320,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    width: '100%',
    maxWidth: 320,
  },
  secondaryButtonText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '600',
  },
});


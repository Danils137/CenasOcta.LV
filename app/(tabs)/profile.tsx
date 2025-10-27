import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { User, Clock, FileText, Shield, BarChart3, Settings, LogOut } from 'lucide-react-native';
import { LoginScreen } from '@/src/screens/LoginScreen';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  if (!user) {
    return <LoginScreen />;
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(tabs)/(home)');
  };

  const menuItems = [
    { icon: Clock, label: t('transactionHistory'), onPress: () => {} },
    { icon: FileText, label: t('invoices'), onPress: () => {} },
    { icon: Shield, label: t('insurancePolicies'), onPress: () => {} },
    { icon: BarChart3, label: t('myDashboard'), onPress: () => {} },
    { icon: Settings, label: t('settings'), onPress: () => {} },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <User size={40} color="#1E40AF" />
        </View>
        <Text style={styles.name}>{user?.user_metadata?.full_name || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuItemContent}>
              <item.icon size={24} color="#1E40AF" />
              <Text style={styles.menuItemText}>{item.label}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <View style={styles.menuItemContent}>
            <LogOut size={24} color="#EF4444" />
            <Text style={[styles.menuItemText, { color: '#EF4444' }]}>{t('signOut')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
  },
  menuSection: {
    marginTop: 20,
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
});

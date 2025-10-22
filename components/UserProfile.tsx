import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  User as UserIcon,
  LogOut,
  Settings,
  FileText,
  Receipt,
  History,
  ChevronDown
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserProfileProps {
  onShowLoginModal: () => void;
}

export default function UserProfile({ onShowLoginModal }: UserProfileProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setShowDropdown(false);
            await logout();
          },
        },
      ]
    );
  };

  const handleProfileAction = (action: string) => {
    setShowDropdown(false);
    // Here you would navigate to different screens based on the action
    Alert.alert('Coming Soon', `${action} feature will be available soon!`);
  };

  if (!isAuthenticated || !user) {
    return (
      <TouchableOpacity
        style={styles.loginButton}
        onPress={onShowLoginModal}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Navigation Buttons on Header */}
      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => handleProfileAction(t('transactionHistory'))}
        >
          <History size={18} color="#fff" />
          <Text style={styles.headerButtonText}>{t('transactionHistory')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => handleProfileAction(t('invoices'))}
        >
          <Receipt size={18} color="#fff" />
          <Text style={styles.headerButtonText}>{t('invoices')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => handleProfileAction(t('insurancePolicies'))}
        >
          <FileText size={18} color="#fff" />
          <Text style={styles.headerButtonText}>{t('insurancePolicies')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => handleProfileAction(t('myDashboard'))}
        >
          <FileText size={18} color="#fff" />
          <Text style={styles.headerButtonText}>{t('myDashboard')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => handleProfileAction(t('settings'))}
        >
          <Settings size={18} color="#fff" />
          <Text style={styles.headerButtonText}>{t('settings')}</Text>
        </TouchableOpacity>
      </View>

      {/* User Profile Button */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <UserIcon size={20} color="#1E40AF" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>
              {user.name}
            </Text>
          </View>
        </View>
        <ChevronDown size={16} color="#6B7280" />
      </TouchableOpacity>

      {/* Dropdown Menu - Only show when showDropdown is true */}
      {showDropdown && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={[styles.dropdownItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <LogOut size={18} color="#EF4444" />
            <Text style={[styles.dropdownItemText, styles.logoutText]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  loginButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
    marginHorizontal: 16,
  },
  logoutItem: {
    marginTop: 4,
  },
  logoutText: {
    color: '#EF4444',
  },
});

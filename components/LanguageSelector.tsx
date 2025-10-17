import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Globe, Check } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/constants/translations';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const languages = [
  { code: 'lv' as Language, name: 'Latviešu', flag: '🇱🇻' },
  { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
  { code: 'ru' as Language, name: 'Русский', flag: '🇷🇺' },
];

export default function LanguageSelector({ visible, onClose }: LanguageSelectorProps) {
  const { language, changeLanguage } = useLanguage();

  const handleLanguageSelect = async (selectedLanguage: Language) => {
    await changeLanguage(selectedLanguage);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Globe size={24} color="#1E40AF" />
            <Text style={styles.title}>Select Language</Text>
          </View>
          
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                language === lang.code && styles.selectedLanguageItem,
              ]}
              onPress={() => handleLanguageSelect(lang.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.flag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageName,
                  language === lang.code && styles.selectedLanguageName,
                ]}>
                  {lang.name}
                </Text>
              </View>
              {language === lang.code && (
                <Check size={20} color="#1E40AF" />
              )}
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedLanguageItem: {
    backgroundColor: '#EFF6FF',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    color: '#1F2937',
  },
  selectedLanguageName: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';

interface Bank {
  id: string;
  name: string;
  logoUrl: string;
}

interface BankSelectorProps {
  onBankSelect: (bank: Bank) => void;
  selectedBank?: Bank;
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

// Функция для получения инициалов банка
const getBankInitials = (bankName: string): string => {
  const words = bankName.trim().split(' ');
  if (words.length === 1) {
    return bankName.substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};

export function BankSelector({ onBankSelect, selectedBank }: BankSelectorProps) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleImageError = (bankId: string) => {
    setImageErrors(prev => new Set(prev).add(bankId));
  };

  const fetchBanks = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!SUPABASE_URL) {
        throw new Error('Supabase URL is not configured');
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/get-payment-methods`);

      if (!response.ok) {
        throw new Error(`Failed to fetch banks: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setBanks(data.banks || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load banks';
      console.error('Error fetching banks:', err);
      setError(message);

      // Fallback: показываем демо-банки с инициалами (без внешних URL)
      setBanks([
        {
          id: 'swedbank',
          name: 'Swedbank',
          logoUrl: '' // Пустой URL, чтобы использовать инициалы
        },
        {
          id: 'seb',
          name: 'SEB',
          logoUrl: ''
        },
        {
          id: 'lhv',
          name: 'LHV',
          logoUrl: ''
        }
      ]);

      Alert.alert(
        'Loading Error',
        'Could not load bank list. Showing demo banks.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading banks...</Text>
      </View>
    );
  }

  if (error && banks.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load banks</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchBanks}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Bank</Text>
      <Text style={styles.subtitle}>Select your bank to complete the payment</Text>

      <ScrollView style={styles.banksContainer} showsVerticalScrollIndicator={false}>
        {banks.map((bank) => (
          <TouchableOpacity
            key={bank.id}
            style={[
              styles.bankItem,
              selectedBank?.id === bank.id && styles.bankItemSelected
            ]}
            onPress={() => onBankSelect(bank)}
          >
            <View style={styles.bankInfo}>
              {bank.logoUrl && !imageErrors.has(bank.id) ? (
                <Image
                  source={{ uri: bank.logoUrl }}
                  style={styles.bankLogo}
                  resizeMode="contain"
                  onError={() => handleImageError(bank.id)}
                />
              ) : (
                <View style={styles.bankInitials}>
                  <Text style={styles.bankInitialsText}>
                    {getBankInitials(bank.name)}
                  </Text>
                </View>
              )}
              <Text style={[
                styles.bankName,
                selectedBank?.id === bank.id && styles.bankNameSelected
              ]}>
                {bank.name}
              </Text>
            </View>
            <View style={[
              styles.checkbox,
              selectedBank?.id === bank.id && styles.checkboxSelected
            ]}>
              {selectedBank?.id === bank.id && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedBank && (
        <View style={styles.selectedBankInfo}>
          <Text style={styles.selectedText}>
            Selected: {selectedBank.name}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  banksContainer: {
    maxHeight: 300,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  bankItemSelected: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankLogo: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 4,
  },
  bankInitials: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankInitialsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  bankNameSelected: {
    color: '#059669',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedBankInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  selectedText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    textAlign: 'center',
  },
});

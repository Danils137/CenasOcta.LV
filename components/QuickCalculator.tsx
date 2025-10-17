import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Zap, ArrowRight, User, Building2 } from 'lucide-react-native';
import { router } from 'expo-router';

import { useLanguage } from '@/contexts/LanguageContext';
import { calculateInsurancePrices } from '@/data/insurance-companies';

type CustomerType = 'personal' | 'company';

interface QuickCalculatorProps {
  style?: any;
}

export default function QuickCalculator({ style }: QuickCalculatorProps) {
  const { t } = useLanguage();
  const [customerType, setCustomerType] = useState<CustomerType>('personal');
  const [carNumber, setCarNumber] = useState<string>('');
  const [carPassport, setCarPassport] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [quickQuote, setQuickQuote] = useState<{ minPrice: number; maxPrice: number } | null>(null);

  const getQuickQuote = async () => {
    if (!carNumber.trim() || !carPassport.trim()) {
      return;
    }
    
    setIsCalculating(true);
    
    // Simulate quick calculation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const carYear = parseInt(carPassport) || new Date().getFullYear();
    const offers = calculateInsurancePrices(carYear, carNumber, 'months12', customerType);
    
    const prices = offers.map(offer => offer.prices.months12);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    setQuickQuote({ minPrice, maxPrice });
    setIsCalculating(false);
  };

  const goToFullCalculator = () => {
    router.push(`/calculator?customerType=${customerType}`);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Zap size={24} color="#F59E0B" />
        <Text style={styles.title}>{t('quickQuoteTitle')}</Text>
      </View>
      <Text style={styles.subtitle}>{t('quickQuoteSubtitle')}</Text>
      
      <View style={styles.customerTypeSection}>
        <Text style={styles.sectionLabel}>{t('customerType')}</Text>
        <View style={styles.customerTypeRow}>
          <TouchableOpacity
            style={[
              styles.customerTypeButton,
              customerType === 'personal' && styles.customerTypeButtonActive
            ]}
            onPress={() => setCustomerType('personal')}
          >
            <User size={20} color={customerType === 'personal' ? '#fff' : '#6B7280'} />
            <View style={styles.customerTypeText}>
              <Text style={[
                styles.customerTypeTitle,
                customerType === 'personal' && styles.customerTypeTitleActive
              ]}>
                {t('personalCustomer')}
              </Text>
              <Text style={[
                styles.customerTypeDesc,
                customerType === 'personal' && styles.customerTypeDescActive
              ]}>
                {t('personalCustomerDesc')}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.customerTypeButton,
              customerType === 'company' && styles.customerTypeButtonActive
            ]}
            onPress={() => setCustomerType('company')}
          >
            <Building2 size={20} color={customerType === 'company' ? '#fff' : '#6B7280'} />
            <View style={styles.customerTypeText}>
              <Text style={[
                styles.customerTypeTitle,
                customerType === 'company' && styles.customerTypeTitleActive
              ]}>
                {t('companyCustomer')}
              </Text>
              <Text style={[
                styles.customerTypeDesc,
                customerType === 'company' && styles.customerTypeDescActive
              ]}>
                {t('companyCustomerDesc')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.inputHalf]}
          value={carNumber}
          onChangeText={setCarNumber}
          placeholder={t('carNumberPlaceholder')}
          autoCapitalize="characters"
        />
        <TextInput
          style={[styles.input, styles.inputHalf]}
          value={carPassport}
          onChangeText={setCarPassport}
          placeholder={t('carPassportPlaceholder')}
          keyboardType="numeric"
        />
      </View>
      
      <TouchableOpacity 
        style={[
          styles.quickButton,
          (!carNumber.trim() || !carPassport.trim()) && styles.buttonDisabled
        ]} 
        onPress={getQuickQuote}
        disabled={!carNumber.trim() || !carPassport.trim() || isCalculating}
      >
        {isCalculating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Zap size={18} color="#fff" />
        )}
        <Text style={styles.quickButtonText}>
          {isCalculating ? t('processing') : t('getQuote')}
        </Text>
      </TouchableOpacity>
      
      {quickQuote && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>{t('priceFrom')}</Text>
          <Text style={styles.resultPrice}>€{quickQuote.minPrice} - €{quickQuote.maxPrice}</Text>
          <Text style={styles.resultPeriod}>{t('months12')}</Text>
          
          <TouchableOpacity 
            style={styles.fullCalculatorButton}
            onPress={goToFullCalculator}
          >
            <Text style={styles.fullCalculatorText}>{t('viewAllOffers')}</Text>
            <ArrowRight size={16} color="#059669" />
          </TouchableOpacity>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputHalf: {
    flex: 1,
  },
  quickButton: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  resultCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  resultLabel: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 4,
  },
  resultPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultPeriod: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  fullCalculatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
  },
  fullCalculatorText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  
  // Customer Type Section
  customerTypeSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  customerTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  customerTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  customerTypeButtonActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  customerTypeText: {
    marginLeft: 12,
    flex: 1,
  },
  customerTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  customerTypeTitleActive: {
    color: '#fff',
  },
  customerTypeDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  customerTypeDescActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
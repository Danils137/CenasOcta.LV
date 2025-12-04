import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertCircle,
  Download,
  Mail,
  Calendar,
} from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as WebBrowser from 'expo-web-browser';

import { useLanguage } from '@/contexts/LanguageContext';
import { insuranceCompanies, calculateInsurancePrices, InsuranceCompany } from '@/data/insurance-companies';
import { BankSelector } from '@/components/BankSelector';
import { useAuth } from '@/src/contexts/AuthContext';
import { listUserCompanies, UserCompany } from '@/src/lib/companyService';

type Step = 'quote' | 'personal' | 'payment' | 'confirmation';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  personalCode: string;
  phone: string;
  email: string;
  address: string;
  // Company fields
  companyName?: string;
  companyRegNumber?: string;
  vatNumber?: string;
  contactPerson?: string;
}

interface PaymentInfo {
  method: 'card' | 'bank' | 'installments';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  selectedBank?: {
    id: string;
    name: string;
    logoUrl: string;
  };
}

interface Bank {
  id: string;
  name: string;
  logoUrl: string;
}

export default function QuoteScreen() {
  const { companyId, customerType, carNumber, carYear, period } = useLocalSearchParams<{ 
    companyId: string;
    customerType?: string;
    carNumber?: string;
    carYear?: string;
    period?: string;
  }>();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('quote');
  const [selectedPeriod, setSelectedPeriod] = useState<keyof InsuranceCompany['prices']>(
    (period && ['months1', 'months3', 'months6', 'months9', 'months12'].includes(period)
      ? period as keyof InsuranceCompany['prices']
      : 'months12')
  );
  const [isCompanyCustomer] = useState<boolean>(customerType === 'business');
  
  // Date states
  const [startDate, setStartDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const minStartDate = (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  })();
  const maxStartDate = (() => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    maxDate.setHours(0, 0, 0, 0);
    return maxDate;
  })();
  const webDateInputRef = useRef<any>(null);

  // Calculate end date based on start date and period
  useEffect(() => {
    const calculateEndDate = () => {
      const end = new Date(startDate);
      
      switch (selectedPeriod) {
        case 'months1':
          end.setMonth(end.getMonth() + 1);
          break;
        case 'months3':
          end.setMonth(end.getMonth() + 3);
          break;
        case 'months6':
          end.setMonth(end.getMonth() + 6);
          break;
        case 'months9':
          end.setMonth(end.getMonth() + 9);
          break;
        case 'months12':
          end.setFullYear(end.getFullYear() + 1);
          break;
      }
      
      // Set to end of previous day
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      
      setEndDate(end);
    };
    
    calculateEndDate();
  }, [startDate, selectedPeriod]);

  useEffect(() => {
    let isMounted = true;

    if (!user || !isCompanyCustomer) {
      setUserCompanies([]);
      setSelectedCompanyId(null);
      return;
    }

    setIsLoadingCompanies(true);
    listUserCompanies(user.id)
      .then((data) => {
        if (isMounted) {
          setUserCompanies(data);
        }
      })
      .catch((error) => console.error('Failed to load companies', error))
      .finally(() => {
        if (isMounted) {
          setIsLoadingCompanies(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user, isCompanyCustomer]);

  useEffect(() => {
    if (!selectedCompanyId) {
      return;
    }

    const selected = userCompanies.find((company) => company.id === selectedCompanyId);
    if (!selected) {
      return;
    }

    setPersonalInfo((prev) => ({
      ...prev,
      companyName: selected.name || prev.companyName,
      companyRegNumber: selected.registrationNumber || prev.companyRegNumber,
      vatNumber: selected.vatNumber || prev.vatNumber,
      contactPerson: selected.contactPerson || prev.contactPerson,
      phone: selected.phone || prev.phone,
      email: selected.email || prev.email,
      address: selected.address || prev.address,
    }));
  }, [selectedCompanyId, userCompanies]);
  
  // Log the received parameters for debugging
  console.log('Quote page params:', {
    companyId,
    customerType,
    carNumber,
    carYear,
    period,
    selectedPeriod
  });
  
  console.log('Customer type from params:', customerType);
  console.log('Is company customer:', isCompanyCustomer);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    personalCode: '',
    phone: '',
    email: '',
    address: '',
    companyName: '',
    companyRegNumber: '',
    vatNumber: '',
    contactPerson: '',
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'bank',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState<boolean>(false);

  // Get calculated companies with proper pricing
  const calculatedCompanies = calculateInsurancePrices(
    parseInt(carYear || '2020'),
    carNumber || '',
    selectedPeriod,
    (customerType as 'personal' | 'company') || 'personal'
  );

  const company = calculatedCompanies.find(c => c.id === companyId) ||
                  insuranceCompanies.find(c => c.id === companyId);

  // Update calculated companies when period changes
  const updateCalculatedCompanies = (newPeriod: keyof InsuranceCompany['prices']) => {
    const updatedCompanies = calculateInsurancePrices(
      parseInt(carYear || '2020'),
      carNumber || '',
      newPeriod,
      (customerType as 'personal' | 'company') || 'personal'
    );
    return updatedCompanies;
  };

  // Handle period change with price recalculation
  const handlePeriodChange = (newPeriod: keyof InsuranceCompany['prices']) => {
    setSelectedPeriod(newPeriod);
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleWebDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value) return;

    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return;

    const limitedTime = Math.min(
      Math.max(parsed.getTime(), minStartDate.getTime()),
      maxStartDate.getTime()
    );

    const sanitized = new Date(limitedTime);
    sanitized.setHours(0, 0, 0, 0);
    setStartDate(sanitized);
    webDateInputRef.current?.blur();
  };

  const handleDateFieldPress = () => {
    if (Platform.OS === 'web') {
      const input = webDateInputRef.current;
      if (input) {
        input.focus();
        // showPicker is currently available in Chromium-based browsers
        (input as any).showPicker?.();
      }
      return;
    }

    setShowDatePicker((prev) => !prev);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      if (Platform.OS !== 'ios') {
        setShowDatePicker(false);
      }
      return;
    }

    if (selectedDate) {
      const normalizedDate = new Date(selectedDate);
      normalizedDate.setHours(0, 0, 0, 0);
      const limitedTime = Math.min(
        Math.max(normalizedDate.getTime(), minStartDate.getTime()),
        maxStartDate.getTime()
      );
      const sanitized = new Date(limitedTime);
      sanitized.setHours(0, 0, 0, 0);
      setStartDate(sanitized);
    }

    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
  };

  if (!company) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color="#DC2626" />
        <Text style={styles.errorText}>Insurance company not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentPrice = company.prices[selectedPeriod];

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentInfoChange = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleBankSelect = (bank: Bank) => {
    setPaymentInfo(prev => ({ ...prev, selectedBank: bank }));
  };

  const handleCompanyProfileSelect = (companyId: string) => {
    setSelectedCompanyId(prev => (prev === companyId ? null : companyId));
  };

  const clearCompanySelection = () => {
    setSelectedCompanyId(null);
  };

  const validatePersonalInfo = (): boolean => {
    if (isCompanyCustomer) {
      const { companyName, companyRegNumber, contactPerson, phone, email } = personalInfo;
      return !!(companyName && companyRegNumber && contactPerson && phone && email);
    } else {
      const { firstName, lastName, personalCode, phone, email } = personalInfo;
      return !!(firstName && lastName && personalCode && phone && email);
    }
  };

  const validatePaymentInfo = (): boolean => {
    return !!paymentInfo.selectedBank;
  };

  const handleNextStep = () => {
    switch (currentStep) {
      case 'quote':
        setCurrentStep('personal');
        break;
      case 'personal':
        if (validatePersonalInfo()) {
          setCurrentStep('payment');
        } else {
          console.log('Please fill in all required fields');
        }
        break;
      case 'payment':
        if (validatePaymentInfo()) {
          handlePurchase();
        } else {
          console.log('Please complete payment information');
        }
        break;
    }
  };

  const handlePurchase = async () => {
    if (!company) {
      alert('Insurance company not found. Please go back and retry.');
      return;
    }

    if (paymentInfo.method !== 'bank') {
      alert('Only bank payments are supported at the moment.');
      return;
    }

    if (!paymentInfo.selectedBank) {
      alert('Please select a bank to continue.');
      return;
    }

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      alert('Supabase URL is not configured. Please contact support.');
      return;
    }

    setOrderId(null);
    setIsProcessing(true);

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(currentPrice * 100),
          currency: 'EUR',
          description: `${company.name} Insurance (${selectedPeriod.replace('months', '')} ${selectedPeriod === 'months1' ? 'month' : 'months'})`,
          bankId: paymentInfo.selectedBank.id,
          customer: isCompanyCustomer
            ? {
                companyName: personalInfo.companyName,
                email: personalInfo.email,
                phone: personalInfo.phone,
              }
            : {
                firstName: personalInfo.firstName,
                lastName: personalInfo.lastName,
                email: personalInfo.email,
                phone: personalInfo.phone,
              },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.paymentUrl) {
        throw new Error(result.error || 'Failed to create Montonio order');
      }

      const resolvedOrderId =
        typeof result.orderId === 'string'
          ? result.orderId
          : typeof result.order?.merchantReference === 'string'
            ? result.order.merchantReference
            : null;

      setOrderId(resolvedOrderId);

      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.location.href = result.paymentUrl as string;
        }
        return;
      }

      const browserResult = await WebBrowser.openBrowserAsync(result.paymentUrl);

      if (browserResult.type === WebBrowser.WebBrowserResultType.CANCEL) {
        console.log('User closed payment window before completion.');
        setOrderId(null);
        return;
      }

      setCurrentStep('confirmation');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      console.error('Payment error:', error);
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderQuoteStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.companyHeader}>
        <Image source={{ uri: company.logo }} style={styles.companyLogo} />
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.companySubtitle}>
            {isCompanyCustomer ? t('businessInsuranceQuote') : t('motorInsuranceQuote')}
          </Text>
          {carNumber && carYear && (
            <Text style={styles.carDetails}>
              {carNumber} • {carYear}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>Your Quote</Text>
        <Text style={styles.priceAmount}>€{currentPrice}</Text>
        <Text style={styles.pricePeriod}>
          {selectedPeriod === 'months1' && '1 month'}
          {selectedPeriod === 'months3' && '3 months'}
          {selectedPeriod === 'months6' && '6 months'}
          {selectedPeriod === 'months9' && '9 months'}
          {selectedPeriod === 'months12' && '12 months'}
        </Text>
      </View>

      <View style={styles.periodSelector}>
        <Text style={styles.sectionTitle}>{t('selectCoveragePeriod')}</Text>
        <View style={styles.periodOptions}>
          {(['months1', 'months3', 'months6', 'months9', 'months12'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodOption,
                selectedPeriod === period && styles.periodOptionActive
              ]}
              onPress={() => handlePeriodChange(period)}
            >
              <Text style={[
                styles.periodOptionText,
                selectedPeriod === period && styles.periodOptionTextActive
              ]}>
                {period === 'months1' && '1m'}
                {period === 'months3' && '3m'}
                {period === 'months6' && '6m'}
                {period === 'months9' && '9m'}
                {period === 'months12' && '12m'}
              </Text>
              <Text style={[
                styles.periodOptionPrice,
                selectedPeriod === period && styles.periodOptionPriceActive
              ]}>
                €{company.prices[period]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.dateSelector}>
        <Text style={styles.sectionTitle}>{t('insurancePeriodDates')}</Text>
        
        <View style={styles.dateInputsRow}>
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>{t('validFrom')}</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={handleDateFieldPress}
            >
              <Calendar size={20} color="#059669" />
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
            {Platform.OS === 'web' && (
              <input
                ref={webDateInputRef}
                type="date"
                value={formatDateForInput(startDate)}
                min={formatDateForInput(minStartDate)}
                max={formatDateForInput(maxStartDate)}
                onChange={handleWebDateChange}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: 0,
                  height: 0,
                }}
                tabIndex={-1}
                aria-hidden="true"
              />
            )}
          </View>

          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>{t('validUntil')}</Text>
            <View style={styles.dateInput}>
              <Calendar size={20} color="#6B7280" />
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            </View>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={minStartDate}
            maximumDate={maxStartDate}
          />
        )}

        <Text style={styles.dateHint}>
          {t('dateSelectionHint')}
        </Text>
      </View>

      <View style={styles.featuresCard}>
        <Text style={styles.sectionTitle}>What&apos;s Included</Text>
        {company.features.map((feature) => (
          <View key={feature} style={styles.featureItem}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
        <Text style={styles.nextButtonText}>Continue to Personal Details</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPersonalStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>
        {isCompanyCustomer ? t('companyInformation') : t('personalInformation')}
      </Text>
      <Text style={styles.stepSubtitle}>
        {isCompanyCustomer 
          ? t('provideCompanyDetails')
          : t('providePersonalDetails')
        }
      </Text>

      {isCompanyCustomer && user && (
        <View style={styles.companySelectorCard}>
          <View style={styles.companySelectorHeader}>
            <Text style={styles.selectorTitle}>{t('selectCompanyProfile')}</Text>
            <TouchableOpacity onPress={() => router.push('/companies')}>
              <Text style={styles.manageLink}>{t('manageCompanies')}</Text>
            </TouchableOpacity>
          </View>
          {isLoadingCompanies ? (
            <View style={styles.selectorLoader}>
              <ActivityIndicator color="#1E40AF" />
            </View>
          ) : userCompanies.length === 0 ? (
            <View style={styles.selectorEmpty}>
              <Text style={styles.selectorEmptyText}>{t('noCompaniesYet')}</Text>
              <TouchableOpacity style={styles.selectorManageButton} onPress={() => router.push('/companies')}>
                <Text style={styles.selectorManageButtonText}>{t('addCompany')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.companyChips}
            >
              {userCompanies.map((company) => {
                const isSelected = company.id === selectedCompanyId;
                return (
                  <TouchableOpacity
                    key={company.id}
                    style={[styles.companyChip, isSelected && styles.companyChipSelected]}
                    onPress={() => handleCompanyProfileSelect(company.id)}
                  >
                    <Text style={[styles.companyChipText, isSelected && styles.companyChipTextSelected]}>
                      {company.name}
                    </Text>
                    {company.registrationNumber ? (
                      <Text style={[styles.companyChipMeta, isSelected && styles.companyChipMetaSelected]}>
                        {company.registrationNumber}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
          {selectedCompanyId ? (
            <TouchableOpacity style={styles.clearSelectionButton} onPress={clearCompanySelection}>
              <Text style={styles.clearSelectionText}>{t('clearCompanySelection')}</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.selectorHint}>{t('companySelectionHint')}</Text>
        </View>
      )}

      <View style={styles.formSection}>
        {isCompanyCustomer ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('companyNameLabel')} *</Text>
              <TextInput
                style={styles.textInput}
                value={personalInfo.companyName}
                onChangeText={(value) => handlePersonalInfoChange('companyName', value)}
                placeholder={t('companyNameLabel')}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>{t('registrationNumberLabel')} *</Text>
                <TextInput
                  style={styles.textInput}
                  value={personalInfo.companyRegNumber}
                  onChangeText={(value) => handlePersonalInfoChange('companyRegNumber', value)}
                  placeholder={t('registrationNumberLabel')}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>{t('vatNumberLabel')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={personalInfo.vatNumber}
                  onChangeText={(value) => handlePersonalInfoChange('vatNumber', value)}
                  placeholder={t('vatNumberLabel')}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('contactPersonLabel')} *</Text>
              <TextInput
                style={styles.textInput}
                value={personalInfo.contactPerson}
                onChangeText={(value) => handlePersonalInfoChange('contactPerson', value)}
                placeholder={t('contactPersonLabel')}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>First Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={personalInfo.firstName}
                  onChangeText={(value) => handlePersonalInfoChange('firstName', value)}
                  placeholder="Enter first name"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Last Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={personalInfo.lastName}
                  onChangeText={(value) => handlePersonalInfoChange('lastName', value)}
                  placeholder="Enter last name"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Personal Code *</Text>
              <TextInput
                style={styles.textInput}
                value={personalInfo.personalCode}
                onChangeText={(value) => handlePersonalInfoChange('personalCode', value)}
                placeholder="Enter personal code"
                keyboardType="numeric"
              />
            </View>
          </>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {isCompanyCustomer ? t('companyPhoneLabel') : t('phone')} *
          </Text>
          <TextInput
            style={styles.textInput}
            value={personalInfo.phone}
            onChangeText={(value) => handlePersonalInfoChange('phone', value)}
            placeholder={isCompanyCustomer ? t('companyPhoneLabel') : t('phone')}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {isCompanyCustomer ? t('companyEmailLabel') : t('email')} *
          </Text>
          <TextInput
            style={styles.textInput}
            value={personalInfo.email}
            onChangeText={(value) => handlePersonalInfoChange('email', value)}
            placeholder={isCompanyCustomer ? t('companyEmailLabel') : t('email')}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {isCompanyCustomer ? t('companyAddressLabel') : t('addressLabel')}
          </Text>
          <TextInput
            style={styles.textInput}
            value={personalInfo.address}
            onChangeText={(value) => handlePersonalInfoChange('address', value)}
            placeholder={isCompanyCustomer ? t('companyAddressLabel') : t('addressLabel')}
            multiline
          />
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
        <Text style={styles.nextButtonText}>Continue to Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPaymentStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Bank Transfer</Text>
      <Text style={styles.stepSubtitle}>Choose your bank to complete the payment</Text>

      <BankSelector
        onBankSelect={handleBankSelect}
        selectedBank={paymentInfo.selectedBank}
      />

      <View style={styles.orderSummary}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{company.name} Insurance</Text>
          <Text style={styles.summaryValue}>€{currentPrice}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Processing Fee</Text>
          <Text style={styles.summaryValue}>€0.00</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>€{currentPrice}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.nextButton, isProcessing && styles.nextButtonDisabled]}
        onPress={handleNextStep}
        disabled={isProcessing}
      >
        <Text style={styles.nextButtonText}>
          {isProcessing ? 'Processing...' : `Pay €${currentPrice}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderConfirmationStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.confirmationHeader}>
        <CheckCircle size={64} color="#10B981" />
        <Text style={styles.confirmationTitle}>Payment Successful!</Text>
        <Text style={styles.confirmationSubtitle}>
          Your insurance policy has been activated
        </Text>
      </View>

      <View style={styles.policyCard}>
        <Text style={styles.policyTitle}>Policy Details</Text>
        <View style={styles.policyRow}>
          <Text style={styles.policyLabel}>Policy Number:</Text>
          <Text style={styles.policyValue}>{orderId ?? 'Pending confirmation'}</Text>
        </View>
        <View style={styles.policyRow}>
          <Text style={styles.policyLabel}>Insurance Company:</Text>
          <Text style={styles.policyValue}>{company.name}</Text>
        </View>
        <View style={styles.policyRow}>
          <Text style={styles.policyLabel}>Coverage Period:</Text>
          <Text style={styles.policyValue}>
            {selectedPeriod === 'months1' && '1 month'}
            {selectedPeriod === 'months3' && '3 months'}
            {selectedPeriod === 'months6' && '6 months'}
            {selectedPeriod === 'months9' && '9 months'}
            {selectedPeriod === 'months12' && '12 months'}
          </Text>
        </View>
        <View style={styles.policyRow}>
          <Text style={styles.policyLabel}>Premium Paid:</Text>
          <Text style={styles.policyValue}>€{currentPrice}</Text>
        </View>
        <View style={styles.policyRow}>
          <Text style={styles.policyLabel}>Policy Holder:</Text>
          <Text style={styles.policyValue}>
            {isCompanyCustomer 
              ? personalInfo.companyName 
              : `${personalInfo.firstName} ${personalInfo.lastName}`
            }
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.downloadButton}>
          <Download size={20} color="#059669" />
          <Text style={styles.downloadButtonText}>Download Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.emailButton}>
          <Mail size={20} color="#6B7280" />
          <Text style={styles.emailButtonText}>Email Policy</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.doneButton} 
        onPress={() => router.push('/')}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'quote':
        return renderQuoteStep();
      case 'personal':
        return renderPersonalStep();
      case 'payment':
        return renderPaymentStep();
      case 'confirmation':
        return renderConfirmationStep();
      default:
        return renderQuoteStep();
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: currentStep === 'confirmation' ? 'Confirmation' : `${company.name} Quote`,
          headerLeft: currentStep !== 'confirmation' ? () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
          ) : undefined,
        }} 
      />
      
      <View style={styles.container}>
        {currentStep !== 'confirmation' && (
          <View style={styles.progressBar}>
            <View style={styles.progressTrack}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: currentStep === 'quote' ? '33%' : 
                           currentStep === 'personal' ? '66%' : '100%' 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              Step {currentStep === 'quote' ? '1' : currentStep === 'personal' ? '2' : '3'} of 3
            </Text>
          </View>
        )}
        
        {renderStepContent()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Progress Bar
  progressBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Step Container
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  
  // Company Header
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  companySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  carDetails: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  
  // Price Card
  priceCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  priceLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  pricePeriod: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
  },
  
  // Period Selector
  periodSelector: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  periodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  periodOption: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  periodOptionActive: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  periodOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  periodOptionTextActive: {
    color: '#059669',
  },
  periodOptionPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  periodOptionPriceActive: {
    color: '#059669',
  },
  
  // Date Selector
  dateSelector: {
    marginBottom: 24,
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
    position: 'relative',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dateHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 12,
    lineHeight: 18,
  },
  
  // Features Card
  featuresCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  companySelectorCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  companySelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  manageLink: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  selectorLoader: {
    paddingVertical: 16,
  },
  selectorEmpty: {
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 8,
  },
  selectorEmptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectorManageButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  selectorManageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  companyChips: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  companyChip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 140,
    backgroundColor: '#F9FAFB',
  },
  companyChipSelected: {
    borderColor: '#1E40AF',
    backgroundColor: '#EEF2FF',
  },
  companyChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  companyChipTextSelected: {
    color: '#1E40AF',
  },
  companyChipMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  companyChipMetaSelected: {
    color: '#1E40AF',
  },
  clearSelectionButton: {
    marginTop: 8,
  },
  clearSelectionText: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  selectorHint: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
  },
  
  // Form Section
  formSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  
  // Payment Methods
  paymentMethods: {
    marginBottom: 24,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  paymentMethodActive: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 12,
  },
  paymentMethodTextActive: {
    color: '#059669',
  },
  
  // Card Form
  cardForm: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // Bank Info
  bankInfo: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  bankInfoText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
  
  // Installment Info
  installmentInfo: {
    backgroundColor: '#EBF8FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  installmentInfoText: {
    fontSize: 16,
    color: '#1E40AF',
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Order Summary
  orderSummary: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  
  // Confirmation
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  confirmationTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  confirmationSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Policy Card
  policyCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  policyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  policyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  policyLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  policyValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  downloadButtonText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emailButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Buttons
  nextButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  doneButton: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

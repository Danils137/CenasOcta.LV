import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,

  Image,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertCircle,
  Download,
  Mail,
} from 'lucide-react-native';

import { useLanguage } from '@/contexts/LanguageContext';
import { insuranceCompanies, calculateInsurancePrices, InsuranceCompany } from '@/data/insurance-companies';
import { BankSelector } from '@/components/BankSelector';

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
  const [currentStep, setCurrentStep] = useState<Step>('quote');
  const [selectedPeriod, setSelectedPeriod] = useState<keyof InsuranceCompany['prices']>(
    (period && ['months1', 'months3', 'months6', 'months9', 'months12'].includes(period)
      ? period as keyof InsuranceCompany['prices']
      : 'months12')
  );
  const [isCompanyCustomer] = useState<boolean>(customerType === 'business');

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
    setIsProcessing(true);

    try {
      if (paymentInfo.method === 'bank' && paymentInfo.selectedBank) {
        // Create order through Montonio API
        const supabaseUrl = 'https://mpkjdqwlsgsuddqswsxn.supabase.co';
        const response = await fetch(`${supabaseUrl}/functions/v1/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: currentPrice * 100, // Convert to cents
            currency: 'EUR',
            description: `${company.name} Insurance (${selectedPeriod.replace('months', '')} ${selectedPeriod === 'months1' ? 'month' : 'months'})`,
            bankId: paymentInfo.selectedBank.id,
            customer: isCompanyCustomer ? {
              companyName: personalInfo.companyName,
              email: personalInfo.email,
              phone: personalInfo.phone,
            } : {
              firstName: personalInfo.firstName,
              lastName: personalInfo.lastName,
              email: personalInfo.email,
              phone: personalInfo.phone,
            }
          })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to create order');
        }

        if (result.paymentUrl) {
          // In a real implementation, you would redirect or open the payment URL
          // For React Native/Expo, you can use Linking.openURL or WebBrowser
          console.log('Payment URL:', result.paymentUrl);
          console.log('Order ID:', result.orderId);

          // For demo purposes, show success immediately
          // In production: Linking.openURL(result.paymentUrl);
        }
      }

      // Simulate successful payment or redirect
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCurrentStep('confirmation');

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
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

      <View style={styles.formSection}>
        {isCompanyCustomer ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Company Name *</Text>
              <TextInput
                style={styles.textInput}
                value={personalInfo.companyName}
                onChangeText={(value) => handlePersonalInfoChange('companyName', value)}
                placeholder="Enter company name"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Registration Number *</Text>
                <TextInput
                  style={styles.textInput}
                  value={personalInfo.companyRegNumber}
                  onChangeText={(value) => handlePersonalInfoChange('companyRegNumber', value)}
                  placeholder="12345678901"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>VAT Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={personalInfo.vatNumber}
                  onChangeText={(value) => handlePersonalInfoChange('vatNumber', value)}
                  placeholder="LV12345678901"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Person *</Text>
              <TextInput
                style={styles.textInput}
                value={personalInfo.contactPerson}
                onChangeText={(value) => handlePersonalInfoChange('contactPerson', value)}
                placeholder="Enter contact person name"
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
          <Text style={styles.inputLabel}>Phone Number *</Text>
          <TextInput
            style={styles.textInput}
            value={personalInfo.phone}
            onChangeText={(value) => handlePersonalInfoChange('phone', value)}
            placeholder="+371 XXXXXXXX"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address *</Text>
          <TextInput
            style={styles.textInput}
            value={personalInfo.email}
            onChangeText={(value) => handlePersonalInfoChange('email', value)}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            style={styles.textInput}
            value={personalInfo.address}
            onChangeText={(value) => handlePersonalInfoChange('address', value)}
            placeholder={isCompanyCustomer ? "Enter company address" : "Enter your address"}
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
          <Text style={styles.policyValue}>POL-{Date.now().toString().slice(-8)}</Text>
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

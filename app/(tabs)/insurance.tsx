import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Car, Shield, CheckCircle, ArrowRight, Star, User, Building2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { insuranceCompanies, calculateInsurancePrices, type InsuranceCompany } from '@/data/insurance-companies';



export default function InsuranceScreen() {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState<string>('octas');
  const [customerType, setCustomerType] = useState<'private' | 'business'>('private');
  const [carNumber, setCarNumber] = useState<string>('');
  const [carYear, setCarYear] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<keyof InsuranceCompany['prices']>('months12');
  const [showCompanies, setShowCompanies] = useState<boolean>(false);
  const [calculatedCompanies, setCalculatedCompanies] = useState<InsuranceCompany[]>([]);

  const insuranceTypes = [
    {
      id: 'octas',
      title: 'OCTAS',
      subtitle: t('octasDescription'),
      price: t('fromYear'),
      features: [
        t('octasFeature1'),
        t('octasFeature2'),
        t('octasFeature3'),
        t('octasFeature4'),
      ],
      color: '#1E40AF',
      bgColor: '#EFF6FF',
    },
    {
      id: 'kasko',
      title: 'KASKO',
      subtitle: t('kaskoDescription'),
      price: t('fromYearKasko'),
      features: [
        t('kaskoFeature1'),
        t('kaskoFeature2'),
        t('kaskoFeature3'),
        t('kaskoFeature4'),
      ],
      color: '#059669',
      bgColor: '#ECFDF5',
    },
  ];

  const selectedInsurance = insuranceTypes.find(type => type.id === selectedType);

  // Auto-recalculate when period, car data, or customer type changes
  useEffect(() => {
    if (carNumber && carYear && showCompanies) {
      const companies = calculateInsurancePrices(
        parseInt(carYear),
        carNumber,
        selectedPeriod,
        customerType as 'personal' | 'company'
      );
      setCalculatedCompanies(companies);
    }
  }, [selectedPeriod, carNumber, carYear, customerType, showCompanies]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[selectedInsurance?.color || '#1E40AF', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerSection}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Car size={40} color="#fff" />
            <Text style={styles.headerTitle}>{t('autoInsurance')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('chooseInsuranceType')}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.typeSelector}>
        {insuranceTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeCard,
              { backgroundColor: type.bgColor },
              selectedType === type.id && styles.selectedTypeCard,
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <View style={styles.typeHeader}>
              <Shield size={24} color={type.color} />
              <View style={styles.typeInfo}>
                <Text style={[styles.typeTitle, { color: type.color }]}>
                  {type.title}
                </Text>
                <Text style={styles.typePrice}>{type.price}</Text>
              </View>
              {selectedType === type.id && (
                <CheckCircle size={24} color={type.color} />
              )}
            </View>
            <Text style={styles.typeSubtitle}>{type.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedInsurance && (
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>{t('whatsIncluded')}</Text>
          <View style={styles.featuresList}>
            {selectedInsurance.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <CheckCircle size={20} color={selectedInsurance.color} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.customerTypeSection}>
        <Text style={styles.sectionTitle}>{t('customerType')}</Text>
        <View style={styles.customerTypeSelector}>
          <TouchableOpacity
            style={[
              styles.customerTypeCard,
              customerType === 'private' && styles.selectedCustomerTypeCard,
            ]}
            onPress={() => setCustomerType('private')}
          >
            <User size={24} color={customerType === 'private' ? '#1E40AF' : '#6B7280'} />
            <Text style={[
              styles.customerTypeTitle,
              customerType === 'private' && styles.selectedCustomerTypeTitle,
            ]}>
              {t('privateCustomer')}
            </Text>
            <Text style={styles.customerTypeSubtitle}>
              {t('privateCustomerDescription')}
            </Text>
            {customerType === 'private' && (
              <CheckCircle size={20} color="#1E40AF" style={styles.customerTypeCheck} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.customerTypeCard,
              customerType === 'business' && styles.selectedCustomerTypeCard,
            ]}
            onPress={() => setCustomerType('business')}
          >
            <Building2 size={24} color={customerType === 'business' ? '#1E40AF' : '#6B7280'} />
            <Text style={[
              styles.customerTypeTitle,
              customerType === 'business' && styles.selectedCustomerTypeTitle,
            ]}>
              {t('businessCustomer')}
            </Text>
            <Text style={styles.customerTypeSubtitle}>
              {t('businessCustomerDescription')}
            </Text>
            {customerType === 'business' && (
              <CheckCircle size={20} color="#1E40AF" style={styles.customerTypeCheck} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>{t('quickCalculation')}</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('carNumber')}</Text>
          <TextInput
            style={styles.input}
            value={carNumber}
            onChangeText={setCarNumber}
            placeholder={t('carNumberPlaceholder')}
            autoCapitalize="characters"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('carPassport')}</Text>
          <TextInput
            style={styles.input}
            value={carYear}
            onChangeText={setCarYear}
            placeholder={t('carPassportPlaceholder')}
            autoCapitalize="characters"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('insurancePeriod')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodSelector}>
            {[
              { key: 'months1', label: '1 month' },
              { key: 'months3', label: '3 months' },
              { key: 'months6', label: '6 months' },
              { key: 'months9', label: '9 months' },
              { key: 'months12', label: '12 months' },
            ].map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.selectedPeriodButton,
                ]}
                onPress={() => setSelectedPeriod(period.key as keyof InsuranceCompany['prices'])}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.key && styles.selectedPeriodButtonText,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <TouchableOpacity 
          style={styles.calculateButton}
          onPress={() => {
            if (carNumber && carYear) {
              const companies = calculateInsurancePrices(parseInt(carYear), carNumber, selectedPeriod);
              setCalculatedCompanies(companies);
              setShowCompanies(true);
            }
          }}
        >
          <Text style={styles.calculateButtonText}>{t('calculatePrice')}</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {showCompanies && calculatedCompanies.length > 0 && (
        <View style={styles.companiesSection}>
          <Text style={styles.sectionTitle}>{t('insuranceOffers')}</Text>
          <Text style={styles.companiesSubtitle}>
            {t('sortedByPrice')} • {selectedPeriod.replace('months', '')} {selectedPeriod === 'months1' ? 'month' : 'months'}
          </Text>
          {calculatedCompanies.map((company, index) => (
            <View key={company.id} style={styles.companyCard}>
              {company.isBestOffer && (
                <View style={styles.bestOfferBadge}>
                  <Star size={16} color="#fff" fill="#fff" />
                  <Text style={styles.bestOfferText}>{t('bestOffer')}</Text>
                </View>
              )}
              <View style={styles.companyHeader}>
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>{company.name}</Text>
                  <View style={styles.companyFeatures}>
                    {company.features.slice(0, 2).map((feature, idx) => (
                      <Text key={idx} style={styles.featureTag}>{feature}</Text>
                    ))}
                  </View>
                </View>
                <Image 
                  source={{ uri: company.logo }} 
                  style={styles.companyLogo}
                  resizeMode="contain"
                />
                <View style={styles.priceSection}>
                  <Text style={styles.price}>€{company.prices[selectedPeriod]}</Text>
                  <Text style={styles.priceLabel}>
                    {selectedPeriod === 'months1' ? 'per month' : `for ${selectedPeriod.replace('months', '')} months`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.selectButton, { backgroundColor: company.color }]}
                onPress={() => router.push(`/quote/${company.id}?customerType=${customerType}&carNumber=${carNumber}&carYear=${carYear}&period=${selectedPeriod}`)}
              >
                <Text style={styles.selectButtonText}>{t('selectOffer')}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerSection: {
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  typeSelector: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  typeCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTypeCard: {
    borderColor: '#1E40AF',
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  typeTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  typePrice: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  typeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  featuresList: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
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
    flex: 1,
  },
  formSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  calculateButton: {
    backgroundColor: '#1E40AF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  bottomSpacing: {
    height: 30,
  },
  customerTypeSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  customerTypeSelector: {
    flexDirection: 'row',
    gap: 15,
  },
  customerTypeCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedCustomerTypeCard: {
    borderColor: '#1E40AF',
    backgroundColor: '#EFF6FF',
  },
  customerTypeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  selectedCustomerTypeTitle: {
    color: '#1E40AF',
  },
  customerTypeSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  customerTypeCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  periodSelector: {
    marginBottom: 10,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedPeriodButton: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedPeriodButtonText: {
    color: '#fff',
  },
  companiesSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  companiesSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  companyCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  bestOfferBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  bestOfferText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 15,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  companyFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureTag: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  selectButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

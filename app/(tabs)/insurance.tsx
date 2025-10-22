import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Car, Shield, CheckCircle, ArrowRight, Star, User, Building2, ChevronDown, X } from 'lucide-react-native';
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
  const [showCompanies, setShowCompanies] = useState<boolean>(false);
  const [showCompaniesDropdown, setShowCompaniesDropdown] = useState<boolean>(false);
  const [calculatedCompanies, setCalculatedCompanies] = useState<InsuranceCompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<InsuranceCompany | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<keyof InsuranceCompany['prices']>('months12');

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

        <TouchableOpacity
          style={styles.calculateButton}
          onPress={() => {
            if (carNumber && carYear) {
              const companies = calculateInsurancePrices(parseInt(carYear), carNumber, selectedPeriod);
              setCalculatedCompanies(companies);
              setShowCompaniesDropdown(true);
            }
          }}
        >
          <Text style={styles.calculateButtonText}>{t('calculatePrice')}</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>



      {/* Companies Dropdown Modal */}
      <Modal
        visible={showCompaniesDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCompaniesDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('insuranceOffers')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCompaniesDropdown(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {t('sortedByPrice')} • {selectedPeriod.replace('months', '')} {selectedPeriod === 'months1' ? 'month' : 'months'}
            </Text>

            <ScrollView style={styles.companiesTable} showsVerticalScrollIndicator={false}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={styles.companyHeaderColumn}>
                  <Text style={styles.companyHeaderText}>Компании</Text>
                </View>
                <View style={styles.periodsContainer}>
                  <Text style={styles.periodHeaderText}>1 mēn.</Text>
                  <Text style={styles.periodHeaderText}>3 mēn.</Text>
                  <Text style={styles.periodHeaderText}>6 mēn.</Text>
                  <Text style={styles.periodHeaderText}>9 mēn.</Text>
                  <Text style={styles.periodHeaderText}>12 mēn.</Text>
                </View>
                <View style={styles.actionHeaderColumn}>
                  <Text style={styles.actionHeaderText}>Действия</Text>
                </View>
              </View>

              {/* Company Rows */}
              {calculatedCompanies.map((company, index) => (
                <View
                  key={company.id}
                  style={[
                    styles.companyRow,
                    company.isBestOffer && styles.bestOfferRow
                  ]}
                >
                  <View style={styles.companyInfoSection}>
                    <Image
                      source={{ uri: company.logo }}
                      style={styles.companyLogo}
                      resizeMode="contain"
                    />
                    <View style={styles.companyInfo}>
                      <Text style={styles.companyName}>{company.name}</Text>
                      {company.isBestOffer && (
                        <View style={styles.bestOfferBadge}>
                          <Star size={10} color="#fff" fill="#fff" />
                          <Text style={styles.bestOfferText}>{t('bestOffer')}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.pricesSection}>
                    <TouchableOpacity
                      style={[
                        styles.priceOption,
                        (selectedCompany?.id === company.id && selectedPeriod === 'months1') && styles.selectedPriceOption,
                        company.prices.months1 === Math.min(...calculatedCompanies.map(c => c.prices.months1)) && styles.bestPriceOption
                      ]}
                      onPress={() => {
                        setSelectedCompany(company);
                        setSelectedPeriod('months1');
                      }}
                    >
                      <Text style={[
                        styles.priceText,
                        (selectedCompany?.id === company.id && selectedPeriod === 'months1') && styles.selectedPriceText,
                        company.prices.months1 === Math.min(...calculatedCompanies.map(c => c.prices.months1)) && styles.bestPriceText
                      ]}>
                        €{company.prices.months1}
                      </Text>
                      {(selectedCompany?.id === company.id && selectedPeriod === 'months1') && <CheckCircle size={14} color="#1E40AF" />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.priceOption,
                        (selectedCompany?.id === company.id && selectedPeriod === 'months3') && styles.selectedPriceOption,
                        company.prices.months3 === Math.min(...calculatedCompanies.map(c => c.prices.months3)) && styles.bestPriceOption
                      ]}
                      onPress={() => {
                        setSelectedCompany(company);
                        setSelectedPeriod('months3');
                      }}
                    >
                      <Text style={[
                        styles.priceText,
                        (selectedCompany?.id === company.id && selectedPeriod === 'months3') && styles.selectedPriceText,
                        company.prices.months3 === Math.min(...calculatedCompanies.map(c => c.prices.months3)) && styles.bestPriceText
                      ]}>
                        €{company.prices.months3}
                      </Text>
                      {(selectedCompany?.id === company.id && selectedPeriod === 'months3') && <CheckCircle size={14} color="#1E40AF" />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.priceOption,
                        (selectedCompany?.id === company.id && selectedPeriod === 'months6') && styles.selectedPriceOption,
                        company.prices.months6 === Math.min(...calculatedCompanies.map(c => c.prices.months6)) && styles.bestPriceOption
                      ]}
                      onPress={() => {
                        setSelectedCompany(company);
                        setSelectedPeriod('months6');
                      }}
                    >
                      <Text style={[
                        styles.priceText,
                        (selectedCompany?.id === company.id && selectedPeriod === 'months6') && styles.selectedPriceText,
                        company.prices.months6 === Math.min(...calculatedCompanies.map(c => c.prices.months6)) && styles.bestPriceText
                      ]}>
                        €{company.prices.months6}
                      </Text>
                      {(selectedCompany?.id === company.id && selectedPeriod === 'months6') && <CheckCircle size={14} color="#1E40AF" />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.priceOption,
                        (selectedCompany?.id === company.id && selectedPeriod === 'months9') && styles.selectedPriceOption,
                        company.prices.months9 === Math.min(...calculatedCompanies.map(c => c.prices.months9)) && styles.bestPriceOption
                      ]}
                      onPress={() => {
                        setSelectedCompany(company);
                        setSelectedPeriod('months9');
                      }}
                    >
                      <Text style={[
                        styles.priceText,
                        (selectedCompany?.id === company.id && selectedPeriod === 'months9') && styles.selectedPriceText,
                        company.prices.months9 === Math.min(...calculatedCompanies.map(c => c.prices.months9)) && styles.bestPriceText
                      ]}>
                        €{company.prices.months9}
                      </Text>
                      {(selectedCompany?.id === company.id && selectedPeriod === 'months9') && <CheckCircle size={14} color="#1E40AF" />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.priceOption,
                        (selectedCompany?.id === company.id && selectedPeriod === 'months12') && styles.selectedPriceOption,
                        company.prices.months12 === Math.min(...calculatedCompanies.map(c => c.prices.months12)) && styles.bestPriceOption
                      ]}
                      onPress={() => {
                        setSelectedCompany(company);
                        setSelectedPeriod('months12');
                      }}
                    >
                      <Text style={[
                        styles.priceText,
                        (selectedCompany?.id === company.id && selectedPeriod === 'months12') && styles.selectedPriceText,
                        company.prices.months12 === Math.min(...calculatedCompanies.map(c => c.prices.months12)) && styles.bestPriceText
                      ]}>
                        €{company.prices.months12}
                      </Text>
                      {(selectedCompany?.id === company.id && selectedPeriod === 'months12') && <CheckCircle size={14} color="#1E40AF" />}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Customer Type Selector in Modal */}
            {selectedCompany && (
              <View style={styles.purchaseSection}>
                <Text style={styles.purchaseSectionTitle}>Izvēlieties klienta tipu:</Text>
                <View style={styles.customerTypeSelectorModal}>
                  <TouchableOpacity
                    style={[
                      styles.customerTypeOption,
                      customerType === 'private' && styles.selectedCustomerTypeOption,
                    ]}
                    onPress={() => setCustomerType('private')}
                  >
                    <User size={20} color={customerType === 'private' ? '#1E40AF' : '#6B7280'} />
                    <Text style={[
                      styles.customerTypeOptionText,
                      customerType === 'private' && styles.selectedCustomerTypeOptionText,
                    ]}>
                      {t('privateCustomer')}
                    </Text>
                    {customerType === 'private' && (
                      <CheckCircle size={16} color="#1E40AF" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.customerTypeOption,
                      customerType === 'business' && styles.selectedCustomerTypeOption,
                    ]}
                    onPress={() => setCustomerType('business')}
                  >
                    <Building2 size={20} color={customerType === 'business' ? '#1E40AF' : '#6B7280'} />
                    <Text style={[
                      styles.customerTypeOptionText,
                      customerType === 'business' && styles.selectedCustomerTypeOptionText,
                    ]}>
                      {t('businessCustomer')}
                    </Text>
                    {customerType === 'business' && (
                      <CheckCircle size={16} color="#1E40AF" />
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.purchaseButton, { backgroundColor: selectedCompany.color }]}
                  onPress={() => {
                    setShowCompaniesDropdown(false);
                    router.push(`/quote/${selectedCompany.id}?customerType=${customerType}&carNumber=${carNumber}&carYear=${carYear}&period=${selectedPeriod}`);
                  }}
                >
                  <Text style={styles.purchaseButtonText}>
                    Pirkt OCTA - €{selectedCompany.prices[selectedPeriod]}
                  </Text>
                  <ArrowRight size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

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
  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    fontWeight: '500',
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  companiesTable: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Table Styles
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  companyHeaderColumn: {
    width: 100,
    paddingRight: 10,
  },
  companyHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  periodsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  periodHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    width: 50,
  },
  actionHeaderColumn: {
    width: 80,
    alignItems: 'center',
  },
  actionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bestOfferRow: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  selectedCompanyRow: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1E40AF',
  },
  companyInfoSection: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  companyLogo: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  bestOfferBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  bestOfferText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  pricesSection: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    width: 50,
  },
  bestPriceText: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  priceOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'transparent',
    minHeight: 40,
    position: 'relative',
  },
  selectedPriceOption: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#1E40AF',
  },
  bestPriceOption: {
    backgroundColor: '#FEF3C7',
  },
  selectedPriceText: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  selectedCheckmark: {
    padding: 4,
  },
  purchaseSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  purchaseSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  customerTypeSelectorModal: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  customerTypeOption: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  selectedCustomerTypeOption: {
    borderColor: '#1E40AF',
    backgroundColor: '#EFF6FF',
  },
  customerTypeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedCustomerTypeOptionText: {
    color: '#1E40AF',
  },
});

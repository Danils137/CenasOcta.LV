import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Shield, 
  AlertTriangle, 
  Car, 
  Clock, 
  Phone, 
  Gauge, 
  Eye, 
  Snowflake,
  CloudRain,
  Moon,
  Wrench,
  BookOpen,
  CheckCircle,
  User,
  Building2,
  Calculator
} from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { useLanguage } from '@/contexts/LanguageContext';
import { calculateInsurancePrices } from '@/data/insurance-companies';

type SafetyCategory = 'rules' | 'tips' | 'emergency' | 'quiz';
type CustomerType = 'personal' | 'company';
type CalculatorMode = 'safety' | 'insurance';

export default function SafetyDrivingScreen() {
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ customerType?: string }>();
  
  const [mode, setMode] = useState<CalculatorMode>('safety');
  const [selectedCategory, setSelectedCategory] = useState<SafetyCategory>('rules');
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  
  // Insurance calculator state
  const [customerType, setCustomerType] = useState<CustomerType>('personal');
  const [carNumber, setCarNumber] = useState<string>('');
  const [carYear, setCarYear] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<'months1' | 'months3' | 'months6' | 'months9' | 'months12'>('months12');
  const [insuranceOffers, setInsuranceOffers] = useState<any[]>([]);
  
  useEffect(() => {
    if (params.customerType) {
      setCustomerType(params.customerType as CustomerType);
      setMode('insurance');
    }
  }, [params.customerType]);

  const toggleRule = (ruleId: string) => {
    setExpandedRule(expandedRule === ruleId ? null : ruleId);
  };
  
  const calculatePrices = () => {
    if (!carNumber.trim() || !carYear.trim()) {
      return;
    }
    
    const year = parseInt(carYear);
    if (isNaN(year) || year < 1990 || year > new Date().getFullYear() + 1) {
      return;
    }
    
    const offers = calculateInsurancePrices(year, carNumber, selectedPeriod, customerType);
    setInsuranceOffers(offers);
  };
  
  const handleChooseOffer = (companyId: string) => {
    router.push(`/quote/${companyId}?customerType=${customerType}&carNumber=${carNumber}&carYear=${carYear}&period=${selectedPeriod}`);
  };

  const renderDrivingRules = () => (
    <View style={styles.contentSection}>
      <TouchableOpacity 
        style={styles.ruleCard} 
        onPress={() => toggleRule('speed')}
      >
        <View style={styles.ruleHeader}>
          <Gauge size={24} color="#059669" />
          <Text style={styles.ruleTitle}>{t('speedLimits')}</Text>
        </View>
        {expandedRule === 'speed' && (
          <View style={styles.ruleContent}>
            <View style={styles.ruleItem}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.ruleText}>{t('citySpeed')}</Text>
            </View>
            <View style={styles.ruleItem}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.ruleText}>{t('countrySpeed')}</Text>
            </View>
            <View style={styles.ruleItem}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.ruleText}>{t('highwaySpeed')}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.ruleCard} 
        onPress={() => toggleRule('distance')}
      >
        <View style={styles.ruleHeader}>
          <Car size={24} color="#059669" />
          <Text style={styles.ruleTitle}>{t('safeDistance')}</Text>
        </View>
        {expandedRule === 'distance' && (
          <View style={styles.ruleContent}>
            <View style={styles.ruleItem}>
              <Clock size={16} color="#10B981" />
              <Text style={styles.ruleText}>{t('safeDistanceRule')}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.ruleCard} 
        onPress={() => toggleRule('seatbelt')}
      >
        <View style={styles.ruleHeader}>
          <Shield size={24} color="#059669" />
          <Text style={styles.ruleTitle}>{t('seatBelt')}</Text>
        </View>
        {expandedRule === 'seatbelt' && (
          <View style={styles.ruleContent}>
            <View style={styles.ruleItem}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.ruleText}>{t('seatBeltRule')}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.ruleCard} 
        onPress={() => toggleRule('phone')}
      >
        <View style={styles.ruleHeader}>
          <Phone size={24} color="#DC2626" />
          <Text style={styles.ruleTitle}>{t('phoneUsage')}</Text>
        </View>
        {expandedRule === 'phone' && (
          <View style={styles.ruleContent}>
            <View style={styles.ruleItem}>
              <AlertTriangle size={16} color="#DC2626" />
              <Text style={styles.ruleText}>{t('phoneRule')}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.ruleCard} 
        onPress={() => toggleRule('alcohol')}
      >
        <View style={styles.ruleHeader}>
          <AlertTriangle size={24} color="#DC2626" />
          <Text style={styles.ruleTitle}>{t('alcoholLimit')}</Text>
        </View>
        {expandedRule === 'alcohol' && (
          <View style={styles.ruleContent}>
            <View style={styles.ruleItem}>
              <AlertTriangle size={16} color="#DC2626" />
              <Text style={styles.ruleText}>{t('alcoholRule')}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSafetyTips = () => (
    <View style={styles.contentSection}>
      <View style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <CloudRain size={24} color="#3B82F6" />
          <Text style={styles.tipTitle}>{t('weatherTips')}</Text>
        </View>
        <View style={styles.tipContent}>
          <View style={styles.tipItem}>
            <CloudRain size={16} color="#3B82F6" />
            <Text style={styles.tipText}>{t('rainTip')}</Text>
          </View>
          <View style={styles.tipItem}>
            <Snowflake size={16} color="#3B82F6" />
            <Text style={styles.tipText}>{t('snowTip')}</Text>
          </View>
          <View style={styles.tipItem}>
            <Eye size={16} color="#3B82F6" />
            <Text style={styles.tipText}>{t('fogTip')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Moon size={24} color="#6366F1" />
          <Text style={styles.tipTitle}>{t('nightDriving')}</Text>
        </View>
        <View style={styles.tipContent}>
          <View style={styles.tipItem}>
            <Moon size={16} color="#6366F1" />
            <Text style={styles.tipText}>{t('nightTip')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Wrench size={24} color="#F59E0B" />
          <Text style={styles.tipTitle}>{t('tireMaintenance')}</Text>
        </View>
        <View style={styles.tipContent}>
          <View style={styles.tipItem}>
            <Wrench size={16} color="#F59E0B" />
            <Text style={styles.tipText}>{t('tireTip')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmergencyActions = () => (
    <View style={styles.contentSection}>
      <View style={styles.emergencyCard}>
        <View style={styles.emergencyHeader}>
          <AlertTriangle size={24} color="#DC2626" />
          <Text style={styles.emergencyTitle}>{t('accidentSteps')}</Text>
        </View>
        <View style={styles.emergencyContent}>
          <View style={styles.emergencyStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>{t('step1')}</Text>
          </View>
          <View style={styles.emergencyStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>{t('step2')}</Text>
          </View>
          <View style={styles.emergencyStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>{t('step3')}</Text>
          </View>
          <View style={styles.emergencyStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>{t('step4')}</Text>
          </View>
          <View style={styles.emergencyStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <Text style={styles.stepText}>{t('step5')}</Text>
          </View>
          <View style={styles.emergencyStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>6</Text>
            </View>
            <Text style={styles.stepText}>{t('step6')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderQuiz = () => (
    <View style={styles.contentSection}>
      <View style={styles.quizCard}>
        <View style={styles.quizHeader}>
          <BookOpen size={32} color="#059669" />
          <Text style={styles.quizTitle}>{t('testYourKnowledge')}</Text>
          <Text style={styles.quizSubtitle}>Проверьте свои знания правил дорожного движения</Text>
        </View>
        <TouchableOpacity style={styles.quizButton}>
          <Text style={styles.quizButtonText}>{t('startQuiz')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (selectedCategory) {
      case 'rules':
        return renderDrivingRules();
      case 'tips':
        return renderSafetyTips();
      case 'emergency':
        return renderEmergencyActions();
      case 'quiz':
        return renderQuiz();
      default:
        return renderDrivingRules();
    }
  };

  const renderInsuranceCalculator = () => (
    <View style={styles.contentSection}>
      {/* Customer Type Selection */}
      <View style={styles.customerTypeSection}>
        <Text style={styles.sectionTitle}>{t('customerType')}</Text>
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
      
      {/* Car Details */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>{t('enterCarDetails')}</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <Text style={styles.inputLabel}>{t('carNumber')}</Text>
            <TextInput
              style={styles.textInput}
              value={carNumber}
              onChangeText={setCarNumber}
              placeholder={t('carNumberPlaceholder')}
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.inputHalf}>
            <Text style={styles.inputLabel}>{t('carYear')}</Text>
            <TextInput
              style={styles.textInput}
              value={carYear}
              onChangeText={setCarYear}
              placeholder="2020"
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <Text style={styles.inputLabel}>{t('insurancePeriod')}</Text>
        <View style={styles.periodOptions}>
          {(['months1', 'months3', 'months6', 'months9', 'months12'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodOption,
                selectedPeriod === period && styles.periodOptionActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodOptionText,
                selectedPeriod === period && styles.periodOptionTextActive
              ]}>
                {t(period)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.calculateButton,
            (!carNumber.trim() || !carYear.trim()) && styles.calculateButtonDisabled
          ]}
          onPress={calculatePrices}
          disabled={!carNumber.trim() || !carYear.trim()}
        >
          <Calculator size={20} color="#fff" />
          <Text style={styles.calculateButtonText}>{t('calculatePrice')}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Insurance Offers */}
      {insuranceOffers.length > 0 && (
        <View style={styles.offersSection}>
          <Text style={styles.sectionTitle}>{t('insuranceOffers')}</Text>
          <Text style={styles.sortedByText}>{t('sortedByPrice')}</Text>
          
          {insuranceOffers.map((company, index) => (
            <View key={company.id} style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <View style={styles.offerInfo}>
                  <Text style={styles.companyName}>{company.name}</Text>
                  {company.isBestOffer && (
                    <View style={styles.bestOfferBadge}>
                      <Text style={styles.bestOfferText}>{t('bestOffer')}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.priceSection}>
                  <Text style={styles.price}>€{company.prices[selectedPeriod]}</Text>
                  <Text style={styles.period}>{t(selectedPeriod)}</Text>
                </View>
              </View>
              
              <View style={styles.features}>
                {company.features.slice(0, 2).map((feature: string, idx: number) => (
                  <View key={idx} style={styles.featureItem}>
                    <CheckCircle size={14} color="#10B981" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity 
                style={styles.chooseButton}
                onPress={() => handleChooseOffer(company.id)}
              >
                <Text style={styles.chooseButtonText}>{t('chooseOffer')}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={mode === 'insurance' ? ['#F59E0B', '#F97316'] : ['#059669', '#10B981']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerSection}
      >
        <View style={styles.headerContent}>
          {mode === 'insurance' ? (
            <Calculator size={40} color="#fff" />
          ) : (
            <Shield size={40} color="#fff" />
          )}
          <Text style={styles.headerTitle}>
            {mode === 'insurance' ? t('octasCalculator') : t('safetyDriving')}
          </Text>
          <Text style={styles.headerSubtitle}>
            {mode === 'insurance' ? t('calculateInsuranceCost') : t('safetyDrivingSubtitle')}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'safety' && styles.modeButtonActive
          ]}
          onPress={() => setMode('safety')}
        >
          <Shield size={18} color={mode === 'safety' ? '#fff' : '#6B7280'} />
          <Text style={[
            styles.modeButtonText,
            mode === 'safety' && styles.modeButtonTextActive
          ]}>
            {t('safetyDriving')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'insurance' && styles.modeButtonActive
          ]}
          onPress={() => setMode('insurance')}
        >
          <Calculator size={18} color={mode === 'insurance' ? '#fff' : '#6B7280'} />
          <Text style={[
            styles.modeButtonText,
            mode === 'insurance' && styles.modeButtonTextActive
          ]}>
            {t('octasCalculator')}
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'insurance' ? (
        renderInsuranceCalculator()
      ) : (
        <>
          <View style={styles.categorySelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === 'rules' && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory('rules')}
              >
                <Shield size={18} color={selectedCategory === 'rules' ? '#fff' : '#6B7280'} />
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === 'rules' && styles.categoryChipTextActive
                ]}>
                  {t('drivingRules')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === 'tips' && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory('tips')}
              >
                <Eye size={18} color={selectedCategory === 'tips' ? '#fff' : '#6B7280'} />
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === 'tips' && styles.categoryChipTextActive
                ]}>
                  {t('safetyTips')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === 'emergency' && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory('emergency')}
              >
                <AlertTriangle size={18} color={selectedCategory === 'emergency' ? '#fff' : '#6B7280'} />
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === 'emergency' && styles.categoryChipTextActive
                ]}>
                  {t('emergencyActions')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === 'quiz' && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory('quiz')}
              >
                <BookOpen size={18} color={selectedCategory === 'quiz' ? '#fff' : '#6B7280'} />
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === 'quiz' && styles.categoryChipTextActive
                ]}>
                  Тест
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {renderContent()}
        </>
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
  
  // Category Selector
  categorySelector: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryScroll: {
    maxHeight: 60,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  
  // Content Section
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  
  // Rule Cards
  ruleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ruleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  ruleContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 12,
    flex: 1,
  },
  
  // Tip Cards
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  tipContent: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 12,
    flex: 1,
    lineHeight: 24,
  },
  
  // Emergency Cards
  emergencyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DC2626',
    marginLeft: 12,
  },
  emergencyContent: {
    gap: 16,
  },
  emergencyStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
    lineHeight: 24,
  },
  
  // Quiz Cards
  quizCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  quizHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  quizSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  quizButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  quizButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  
  bottomSpacing: {
    height: 50,
  },
  
  // Mode Selector
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modeButtonActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  
  // Customer Type Section
  customerTypeSection: {
    marginBottom: 24,
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
  
  // Form Card
  formCard: {
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
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
  periodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  periodOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  periodOptionActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  periodOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodOptionTextActive: {
    color: '#fff',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  calculateButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Offers Section
  offersSection: {
    marginBottom: 24,
  },
  sortedByText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  offerInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  bestOfferBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  bestOfferText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  period: {
    fontSize: 14,
    color: '#6B7280',
  },
  features: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  chooseButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  chooseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
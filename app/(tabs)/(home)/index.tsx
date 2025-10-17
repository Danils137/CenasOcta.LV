import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Car, Clock, Shield, Users, CheckCircle, ArrowRight, Coins } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/contexts/LanguageContext';
import { router } from 'expo-router';
import { insuranceCompanies } from '@/data/insurance-companies';

// Import local assets
const ergoLogo = require('@/assets/ERGO-LOGO.png');
const banLogo = require('@/assets/BAN-LOGO.png');
const ifLogo = require('@/assets/IF-logo_20.png');
const balciaLogo = require('@/assets/BALCIA-LOGO.png');
const baltaLogo = require('@/assets/Balta-Logo.png');
const compensaLogo = require('@/assets/Compensa -logo.png');
const gjensidigeLogo = require('@/assets/Gjensidige-logo.png');
const btaLogo = require('@/assets/BTA-logo.png');

export default function HomeScreen() {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerSection}>
        <LinearGradient
          colors={['#059669', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <Car size={48} color="#fff" />
                <Text style={styles.logoText}>{t('companyTitle')}</Text>
              </View>
              <Text style={styles.headerTitle}>
                {t('companySubtitle')}
              </Text>
              <Text style={styles.headerSubtitle}>
                {t('heroSubtitle')}
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentSection}
      >
        {/* Statistics */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Users size={32} color="#059669" />
            <Text style={styles.statNumber}>100</Text>
            <Text style={styles.statLabel}>{t('clients50k')}</Text>
          </View>
          <View style={styles.statCard}>
            <Shield size={32} color="#059669" />
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>{t('yearsExperience')}</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={32} color="#059669" />
            <Text style={styles.statNumber}>99%</Text>
            <Text style={styles.statLabel}>{t('satisfaction99')}</Text>
          </View>
        </View>

        {/* Why Choose Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('whyChooseUs')}</Text>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Clock size={24} color="#059669" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('fastService')}</Text>
              <Text style={styles.featureDescription}>{t('fastServiceDesc')}</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Text style={{fontSize: 24, color: "#059669", fontWeight: 'bold'}}>€</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('bestPrices')}</Text>
              <Text style={styles.featureDescription}>{t('bestPricesDesc')}</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Users size={24} color="#059669" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('expertSupport')}</Text>
              <Text style={styles.featureDescription}>{t('expertSupportDesc')}</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Shield size={24} color="#059669" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('securePayment')}</Text>
              <Text style={styles.featureDescription}>{t('securePaymentDesc')}</Text>
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('howItWorks')}</Text>
          
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{t('step1Title')}</Text>
              <Text style={styles.stepDescription}>{t('step1Desc')}</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{t('step2Title')}</Text>
              <Text style={styles.stepDescription}>{t('step2Desc')}</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{t('step3Title')}</Text>
              <Text style={styles.stepDescription}>{t('step3Desc')}</Text>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/insurance')}
          >
            <Text style={styles.ctaButtonText}>{t('getStarted')}</Text>
            <ArrowRight size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Partner Companies */}
        <View style={styles.partnersSection}>
          <Text style={styles.partnersTitle}>{t('ourPartners')}</Text>
          <View style={styles.partnersGrid}>
            {/* ERGO */}
            <TouchableOpacity
              style={styles.partnerCard}
              onPress={() => Linking.openURL('https://ergo.lv')}
            >
              <Image
                source={ergoLogo}
                style={styles.partnerLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {/* BAN */}
            <TouchableOpacity
              style={styles.partnerCard}
              onPress={() => Linking.openURL('https://ban.lv')}
            >
              <Image
                source={banLogo}
                style={styles.partnerLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {/* IF */}
            <TouchableOpacity
              style={styles.partnerCard}
              onPress={() => Linking.openURL('https://if.lv')}
            >
              <Image
                source={ifLogo}
                style={styles.partnerLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {/* BALCIA */}
            <TouchableOpacity
              style={styles.partnerCard}
              onPress={() => Linking.openURL('https://balcia.lv')}
            >
              <Image
                source={balciaLogo}
                style={styles.partnerLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {/* BALTA */}
            <TouchableOpacity
              style={styles.partnerCard}
              onPress={() => Linking.openURL('https://balta.lv')}
            >
              <Image
                source={baltaLogo}
                style={styles.partnerLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {/* COMPENSA */}
            <TouchableOpacity
              style={styles.partnerCard}
              onPress={() => Linking.openURL('https://compensa.lv')}
            >
              <Image
                source={compensaLogo}
                style={styles.partnerLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {/* Gjensidige */}
            <TouchableOpacity
              style={styles.partnerCard}
              onPress={() => Linking.openURL('https://gjensidige.lv')}
            >
              <Image
                source={gjensidigeLogo}
                style={styles.partnerLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {/* BTA */}
            <TouchableOpacity
              style={styles.partnerCard}
              onPress={() => Linking.openURL('https://bta.lv')}
            >
              <Image
                source={btaLogo}
                style={styles.partnerLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {/* Other companies with external URLs */}
            {insuranceCompanies.filter(company => !['ergo', 'ban', 'if', 'balcia', 'balta', 'compensa', 'gjensidige', 'bta'].includes(company.id)).slice(0, 1).map((company, index) => (
              <View key={company.id} style={styles.partnerCard}>
                <Image
                  source={{ uri: company.logo }}
                  style={styles.partnerLogo}
                  resizeMode="contain"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Legal Information Footer */}
        <View style={styles.legalFooter}>
          <Text style={styles.legalTitle}>{t('legalInformation')}</Text>
          <Text style={styles.legalText}>
            {t('legalInformationDesc')}
          </Text>
        </View>

      </ScrollView>

      <View style={styles.bottomSpacing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerGradient: {
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    marginTop: 200, // Adjust this to match header height
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginLeft: 12,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  ctaSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  bottomSpacing: {
    height: 50,
  },
  partnersSection: {
    marginBottom: 40,
  },
  partnersTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  partnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  partnerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '23%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  partnerLogo: {
    width: '100%',
    height: '100%',
    maxWidth: 200,
    maxHeight: 150,
  },
  legalFooter: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  legalText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
});

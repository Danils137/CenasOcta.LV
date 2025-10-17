import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Users, Award, TrendingUp, CheckCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/contexts/LanguageContext';



export default function AboutScreen() {
  const { t } = useLanguage();

  const stats = [
    { icon: Users, number: '100+', label: t('satisfiedClients') },
    { icon: Shield, number: '4', label: t('yearsExperience') },
    { icon: Award, number: '99%', label: t('clientSatisfaction') },
    { icon: TrendingUp, number: '7/24', label: t('clientSupport') },
  ];

  const values = [
    {
      title: t('legalStatus'),
      description: t('legalStatusDesc'),
    },
    {
      title: t('ourResponsibilities'),
      description: t('ourResponsibilitiesDesc'),
    },
    {
      title: t('clientRightsAndObligations'),
      description: t('clientFocusDesc'),
    },
    {
      title: t('dataProtection'),
      description: t('dataProtectionDesc'),
    },
    {
      title: t('commissionsAndCompensation'),
      description: t('commissionsAndCompensationDesc'),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#7C3AED', '#A855F7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerSection}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Shield size={40} color="#fff" />
            <Text style={styles.headerTitle}>{t('aboutTitle')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('aboutSubtitle')}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.statsSection}>
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <View key={index} style={styles.statCard}>
              <IconComponent size={32} color="#7C3AED" />
              <Text style={styles.statNumber}>{stat.number}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>{t('ourStory')}</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>
            {t('aboutDescription1')}
          </Text>
          <Text style={styles.aboutText}>
            {t('aboutDescription2')}
          </Text>
        </View>
      </View>

      <View style={styles.valuesSection}>
        <Text style={styles.sectionTitle}>{t('ourValues')}</Text>
        {values.map((value, index) => (
          <View key={index} style={styles.valueCard}>
            <View style={styles.valueHeader}>
              <CheckCircle size={24} color="#7C3AED" />
              <Text style={styles.valueTitle}>{value.title}</Text>
            </View>
            <Text style={styles.valueDescription}>{value.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.missionSection}>
        <View style={styles.missionCard}>
          <Text style={styles.missionTitle}>{t('complaintsAndSupervision')}</Text>
          <Text style={styles.missionText}>
            {t('complaintsAndSupervisionDesc')}
          </Text>
        </View>
      </View>

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
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7C3AED',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  aboutSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  aboutText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 16,
  },
  valuesSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  valueCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  valueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  valueDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  missionSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  missionCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 15,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  missionText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 30,
  },
});

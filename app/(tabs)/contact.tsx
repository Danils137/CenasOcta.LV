import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/contexts/LanguageContext';



export default function ContactScreen() {
  const { t } = useLanguage();

  const contactMethods = [
    {
      id: 'phone',
      title: t('phone'),
      value: '+371 29 53 53 92',
      description: t('phoneDesc'),
      icon: Phone,
      color: '#1E40AF',
      action: () => Linking.openURL('tel:+37129535392'),
    },
    {
      id: 'email',
      title: t('email'),
      value: 'info@CenasOcta.LV',
      description: t('emailDesc'),
      icon: Mail,
      color: '#059669',
      action: () => Linking.openURL('mailto:info@CenasOcta.LV'),
    },
    {
      id: 'chat',
      title: t('onlineChat'),
      value: t('startChat'),
      description: t('chatDesc'),
      icon: MessageCircle,
      color: '#DC2626',
      action: () => console.log('Start chat'),
    },
  ];

  const offices = [
    {
      id: 'jaunolaine',
      city: 'Jaunolaine',
      address: 'Miķeļbaudas, Olaines novads, LV-2127',
      phone: '+371 29 53 53 92',
      hours: t('hoursRiga'),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#DC2626', '#EF4444']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerSection}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Phone size={40} color="#fff" />
            <Text style={styles.headerTitle}>{t('contactUsTitle')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('contactSubtitle')}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.contactMethodsSection}>
        <Text style={styles.sectionTitle}>{t('howToContact')}</Text>
        {contactMethods.map((method) => {
          const IconComponent = method.icon;
          return (
            <TouchableOpacity
              key={method.id}
              style={styles.contactMethodCard}
              onPress={method.action}
            >
              <View style={[styles.contactMethodIcon, { backgroundColor: method.color }]}>
                <IconComponent size={24} color="#fff" />
              </View>
              <View style={styles.contactMethodContent}>
                <Text style={styles.contactMethodTitle}>{method.title}</Text>
                <Text style={styles.contactMethodValue}>{method.value}</Text>
                <Text style={styles.contactMethodDescription}>{method.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.officesSection}>
        <Text style={styles.sectionTitle}>{t('ourOffices')}</Text>
        {offices.map((office) => (
          <View key={office.id} style={styles.officeCard}>
            <View style={styles.officeHeader}>
              <MapPin size={20} color="#1E40AF" />
              <Text style={styles.officeCity}>{office.city}</Text>
            </View>
            <Text style={styles.officeAddress}>{office.address}</Text>
            <View style={styles.officeDetails}>
              <View style={styles.officeDetailItem}>
                <Phone size={16} color="#6B7280" />
                <Text style={styles.officeDetailText}>{office.phone}</Text>
              </View>
              <View style={styles.officeDetailItem}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.officeDetailText}>{office.hours}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.emergencySection}>
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>{t('emergencyCase')}</Text>
          <Text style={styles.emergencyDescription}>
            {t('emergencyDesc')}
          </Text>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:+112')}
          >
            <Phone size={20} color="#fff" />
            <Text style={styles.emergencyButtonText}>+112</Text>
          </TouchableOpacity>
          <Text style={styles.emergencyNote}>
            {t('available24_7')}
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
  contactMethodsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  contactMethodCard: {
    flexDirection: 'row',
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
  contactMethodIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactMethodContent: {
    flex: 1,
  },
  contactMethodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  contactMethodValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E40AF',
    marginBottom: 4,
  },
  contactMethodDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  officesSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  officeCard: {
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
  officeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  officeCity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  officeAddress: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  officeDetails: {
    gap: 8,
  },
  officeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officeDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  emergencySection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 15,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
  },
  emergencyDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 22,
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  emergencyNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 30,
  },
});

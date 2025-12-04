import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Building2, Edit3, Plus, Trash2 } from 'lucide-react-native';

import { useAuth } from '@/src/contexts/AuthContext';
import { LoginScreen } from '@/src/screens/LoginScreen';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  CompanyInput,
  UserCompany,
  createUserCompany,
  deleteUserCompany,
  listUserCompanies,
  updateUserCompany,
} from '@/src/lib/companyService';

const initialForm: CompanyInput = {
  name: '',
  registrationNumber: '',
  vatNumber: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
};

export default function CompaniesScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<UserCompany[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<CompanyInput>(initialForm);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingCompany, setEditingCompany] = useState<UserCompany | null>(null);

  const resetForm = () => {
    setFormValues(initialForm);
    setEditingCompany(null);
  };

  const loadCompanies = useCallback(async () => {
    if (!user) {
      setCompanies([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await listUserCompanies(user.id);
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies', error);
      Alert.alert(t('error'), t('somethingWentWrong') || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [t, user]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useFocusEffect(
    useCallback(() => {
      loadCompanies();
    }, [loadCompanies])
  );

  const openModal = (company?: UserCompany) => {
    if (company) {
      setEditingCompany(company);
      setFormValues({
        name: company.name ?? '',
        registrationNumber: company.registrationNumber ?? '',
        vatNumber: company.vatNumber ?? '',
        contactPerson: company.contactPerson ?? '',
        phone: company.phone ?? '',
        email: company.email ?? '',
        address: company.address ?? '',
      });
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const handleChange = (field: keyof CompanyInput, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!formValues.name?.trim()) {
      Alert.alert(t('companyNameLabel'), t('companyNameRequired'));
      return;
    }

    try {
      setSubmitting(true);
      if (editingCompany) {
        await updateUserCompany(editingCompany.id, user.id, formValues);
      } else {
        await createUserCompany(user.id, formValues);
      }
      await loadCompanies();
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save company', error);
      Alert.alert(t('error'), t('somethingWentWrong') || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (company: UserCompany) => {
    Alert.alert(
      t('deleteCompanyConfirmTitle'),
      t('deleteCompanyConfirmMessage'),
      [
        { text: t('deleteCompanyConfirmNo'), style: 'cancel' },
        {
          text: t('deleteCompanyConfirmYes'),
          style: 'destructive',
          onPress: () => handleDelete(company.id),
        },
      ],
      { cancelable: true }
    );
  };

  const handleDelete = async (companyId: string) => {
    if (!user) return;
    try {
      setSubmitting(true);
      await deleteUserCompany(companyId, user.id);
      await loadCompanies();
    } catch (error) {
      console.error('Failed to delete company', error);
      Alert.alert(t('error'), t('somethingWentWrong') || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = useMemo(() => Boolean(formValues.name && formValues.name.trim().length > 1), [formValues.name]);

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('myCompanies')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>{t('addCompany')}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#1E40AF" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={companies.length ? styles.list : styles.emptyStateContainer}>
          {companies.length === 0 ? (
            <View style={styles.emptyState}>
              <Building2 size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>{t('noCompaniesYet')}</Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={() => openModal()}>
                <Text style={styles.emptyStateButtonText}>{t('addCompany')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            companies.map((company) => (
              <View key={company.id} style={styles.companyCard}>
                <View style={styles.companyHeader}>
                  <View style={styles.companyIcon}>
                    <Building2 size={24} color="#1E40AF" />
                  </View>
                  <View style={styles.companyInfo}>
                    <Text style={styles.companyName}>{company.name}</Text>
                    {company.registrationNumber ? (
                      <Text style={styles.companyMeta}>
                        {t('registrationNumberLabel')}: {company.registrationNumber}
                      </Text>
                    ) : null}
                    {company.vatNumber ? (
                      <Text style={styles.companyMeta}>
                        {t('vatNumberLabel')}: {company.vatNumber}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.companyDetails}>
                  {company.contactPerson ? (
                    <Text style={styles.detailText}>
                      {t('contactPersonLabel')}: {company.contactPerson}
                    </Text>
                  ) : null}
                  {company.phone ? (
                    <Text style={styles.detailText}>
                      {t('companyPhoneLabel')}: {company.phone}
                    </Text>
                  ) : null}
                  {company.email ? (
                    <Text style={styles.detailText}>
                      {t('companyEmailLabel')}: {company.email}
                    </Text>
                  ) : null}
                  {company.address ? (
                    <Text style={styles.detailText}>
                      {t('companyAddressLabel')}: {company.address}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.editButton} onPress={() => openModal(company)}>
                    <Edit3 size={18} color="#1E40AF" />
                    <Text style={styles.actionText}>{t('editCompany')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(company)}>
                    <Trash2 size={18} color="#DC2626" />
                    <Text style={[styles.actionText, { color: '#DC2626' }]}>{t('deleteCompany')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCompany ? t('editCompany') : t('addCompany')}
            </Text>

            <ScrollView style={styles.form}>
              <FormInput
                label={t('companyNameLabel')}
                value={formValues.name}
                onChangeText={(value) => handleChange('name', value)}
                required
              />
              <FormInput
                label={t('registrationNumberLabel')}
                value={formValues.registrationNumber ?? ''}
                onChangeText={(value) => handleChange('registrationNumber', value)}
              />
              <FormInput
                label={t('vatNumberLabel')}
                value={formValues.vatNumber ?? ''}
                onChangeText={(value) => handleChange('vatNumber', value)}
              />
              <FormInput
                label={t('contactPersonLabel')}
                value={formValues.contactPerson ?? ''}
                onChangeText={(value) => handleChange('contactPerson', value)}
              />
              <FormInput
                label={t('companyPhoneLabel')}
                value={formValues.phone ?? ''}
                onChangeText={(value) => handleChange('phone', value)}
                keyboardType="phone-pad"
              />
              <FormInput
                label={t('companyEmailLabel')}
                value={formValues.email ?? ''}
                onChangeText={(value) => handleChange('email', value)}
                keyboardType="email-address"
              />
              <FormInput
                label={t('companyAddressLabel')}
                value={formValues.address ?? ''}
                onChangeText={(value) => handleChange('address', value)}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  (!isFormValid || submitting) && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={!isFormValid || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('saveCompany')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

type FormInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  required?: boolean;
};

const FormInput: React.FC<FormInputProps> = ({ label, value, onChangeText, keyboardType = 'default', required }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>
      {label}
      {required ? <Text style={styles.requiredMark}>*</Text> : null}
    </Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={label}
      keyboardType={keyboardType}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
    gap: 16,
  },
  emptyStateContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    gap: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyStateButton: {
    marginTop: 8,
    backgroundColor: '#1E40AF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  companyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  companyHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  companyMeta: {
    fontSize: 14,
    color: '#4B5563',
  },
  companyDetails: {
    gap: 4,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  form: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '600',
  },
  requiredMark: {
    color: '#DC2626',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#1E40AF',
  },
  cancelButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

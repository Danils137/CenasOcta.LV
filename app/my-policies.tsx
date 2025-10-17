import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import {
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Filter
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/src/lib/supabaseClient';

interface Policy {
  _id: string;
  policyNumber: string;
  insurer: string;
  vehicle: {
    plateNumber: string;
    make: string;
    model: string;
    year: number;
  };
  coverageStart: string;
  coverageEnd: string;
  premiumAmount: number;
  currency: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'cancelled';
  createdAt: string;
  notes?: string;
  duration?: number;
  isCurrentlyActive?: boolean;
}

interface PolicyStats {
  totalPolicies: number;
  activePolicies: number;
  totalPremium: number;
  averagePremium: number;
}

export default function MyPolicies() {
  const { user, getToken } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [stats, setStats] = useState<PolicyStats>({
    totalPolicies: 0,
    activePolicies: 0,
    totalPremium: 0,
    averagePremium: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fetchPolicies = async () => {
    try {
      // Check if user is authenticated with Supabase
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      // For now, we'll use mock data since we don't have policies table in Supabase yet
      // In a real app, you would fetch from Supabase:
      // const { data, error } = await supabase.from('policies').select('*').eq('user_id', session.user.id);

      const mockPolicies: Policy[] = [
        {
          _id: '1',
          policyNumber: 'OCTA-2024-001',
          insurer: 'ERGO',
          vehicle: {
            plateNumber: 'AB1234',
            make: 'Toyota',
            model: 'Camry',
            year: 2020
          },
          coverageStart: '2024-01-01',
          coverageEnd: '2024-12-31',
          premiumAmount: 45.50,
          currency: 'EUR',
          status: 'active',
          paymentStatus: 'paid',
          createdAt: '2024-01-01',
          duration: 12,
          isCurrentlyActive: true
        }
      ];

      setPolicies(mockPolicies);
      setStats({
        totalPolicies: mockPolicies.length,
        activePolicies: mockPolicies.filter(p => p.status === 'active').length,
        totalPremium: mockPolicies.reduce((sum, p) => sum + p.premiumAmount, 0),
        averagePremium: mockPolicies.length > 0 ? mockPolicies.reduce((sum, p) => sum + p.premiumAmount, 0) / mockPolicies.length : 0
      });

    } catch (error) {
      console.error('Fetch policies error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPolicies();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'expired':
        return '#EF4444';
      case 'cancelled':
        return '#6B7280';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} color="#10B981" />;
      case 'expired':
        return <XCircle size={16} color="#EF4444" />;
      case 'cancelled':
        return <XCircle size={16} color="#6B7280" />;
      case 'pending':
        return <Clock size={16} color="#F59E0B" />;
      default:
        return <Clock size={16} color="#6B7280" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('lv-LV', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  const filteredPolicies = policies.filter(policy => {
    if (filter === 'all') return true;
    return policy.status === filter;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Loading policies...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sveicināts, {user?.name}</Text>
          <Text style={styles.headerSubtitle}>Manas apdrošināšanas polises</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalPolicies}</Text>
            <Text style={styles.statLabel}>Kopā polises</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>
              {stats.activePolicies}
            </Text>
            <Text style={styles.statLabel}>Aktīvās</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{formatCurrency(stats.totalPremium, 'EUR')}</Text>
            <Text style={styles.statLabel}>Kopējā prēmija</Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
                Visas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
              onPress={() => setFilter('active')}
            >
              <Text style={[styles.filterButtonText, filter === 'active' && styles.filterButtonTextActive]}>
                Aktīvās
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'expired' && styles.filterButtonActive]}
              onPress={() => setFilter('expired')}
            >
              <Text style={[styles.filterButtonText, filter === 'expired' && styles.filterButtonTextActive]}>
                Beigušās
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
              onPress={() => setFilter('pending')}
            >
              <Text style={[styles.filterButtonText, filter === 'pending' && styles.filterButtonTextActive]}>
                Gaida
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Policies List */}
        {filteredPolicies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Nav atrastu polisu</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all'
                ? 'Pievienojiet jaunu polisi vai iegādājieties OCTA apdrošināšanu.'
                : `Nav polisu ar statusu "${filter === 'active' ? 'aktīvs' : filter === 'expired' ? 'beidzies' : 'gaida'}".`
              }
            </Text>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color="#fff" />
              <Text style={styles.addButtonText}>Pievienot polisi</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.policiesContainer}>
            {filteredPolicies.map((policy) => (
              <TouchableOpacity key={policy._id} style={styles.policyCard}>
                <View style={styles.policyHeader}>
                  <View style={styles.policyMain}>
                    <Text style={styles.policyNumber}>{policy.policyNumber}</Text>
                    <Text style={styles.insurer}>{policy.insurer}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(policy.status) + '20' }]}>
                    {getStatusIcon(policy.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(policy.status) }]}>
                      {policy.status === 'active' ? 'Aktīvs' :
                       policy.status === 'expired' ? 'Beidzies' :
                       policy.status === 'cancelled' ? 'Atcelts' : 'Gaida'}
                    </Text>
                  </View>
                </View>

                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleTitle}>Transportlīdzeklis</Text>
                  <Text style={styles.vehicleDetails}>
                    {policy.vehicle.make} {policy.vehicle.model} ({policy.vehicle.year})
                  </Text>
                  <Text style={styles.plateNumber}>Numurs: {policy.vehicle.plateNumber}</Text>
                </View>

                <View style={styles.policyDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.detailText}>
                      {formatDate(policy.coverageStart)} - {formatDate(policy.coverageEnd)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <DollarSign size={16} color="#6B7280" />
                    <Text style={styles.detailText}>
                      {formatCurrency(policy.premiumAmount, policy.currency)}
                    </Text>
                  </View>
                </View>

                {policy.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesText}>{policy.notes}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#1E40AF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#1E40AF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  policiesContainer: {
    padding: 20,
  },
  policyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  policyMain: {
    flex: 1,
  },
  policyNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  insurer: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  vehicleInfo: {
    marginBottom: 12,
  },
  vehicleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  plateNumber: {
    fontSize: 12,
    color: '#6B7280',
  },
  policyDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  notesContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  notesText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

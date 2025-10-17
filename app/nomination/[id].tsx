import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Award, FileText, Users, Target } from "lucide-react-native";
import { nominationsData } from "@/data/nominations";

export default function NominationDetailScreen() {
  const { id } = useLocalSearchParams();
  const nomination = nominationsData.find(item => item.id === id);

  if (!nomination) {
    return (
      <View style={styles.container}>
        <Text>Nominācija nav atrasta</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: nomination.color }]}>
          <Text style={styles.icon}>{nomination.icon}</Text>
        </View>
        <Text style={styles.title}>{nomination.title}</Text>
        <Text style={styles.category}>{nomination.category}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apraksts</Text>
          <Text style={styles.paragraph}>{nomination.fullDescription}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vērtēšanas kritēriji</Text>
          {nomination.criteria.map((criterion, index) => (
            <View key={index} style={styles.criterionItem}>
              <Target size={16} color="#0B4F6C" />
              <Text style={styles.criterionText}>{criterion}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prasības</Text>
          {nomination.requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <FileText size={16} color="#20BF55" />
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{nomination.count}</Text>
            <Text style={styles.statLabel}>Pieteikumi</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Finālisti</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Uzvarētājs</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Pieteikt projektu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  category: {
    fontSize: 16,
    color: '#0B4F6C',
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  criterionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  criterionText: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
    marginLeft: 12,
    lineHeight: 22,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
    marginLeft: 12,
    lineHeight: 22,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 20,
    marginTop: 30,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0B4F6C',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  applyButton: {
    backgroundColor: '#0B4F6C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});
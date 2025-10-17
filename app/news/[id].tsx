import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Calendar, Clock, User } from "lucide-react-native";
import { newsData } from "@/data/news";

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const article = newsData.find(item => item.id === id);

  if (!article) {
    return (
      <View style={styles.container}>
        <Text>Raksts nav atrasts</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{article.title}</Text>
        <View style={styles.metadata}>
          <View style={styles.metaItem}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.metaText}>{article.date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.metaText}>{article.readTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <User size={16} color="#6B7280" />
            <Text style={styles.metaText}>{article.author}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.paragraph}>{article.content}</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 15,
    lineHeight: 32,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 5,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  paragraph: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 26,
    marginBottom: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
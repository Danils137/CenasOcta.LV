import { Tabs } from "expo-router";
import { Home, Car, Shield, Phone, Info, Globe } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import LoginModal from "@/components/LoginModal";
import UserProfile from "@/components/UserProfile";

export default function MainTabsLayout() {
  const { t } = useLanguage();
  const [showLanguageSelector, setShowLanguageSelector] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#1E40AF',
          tabBarInactiveTintColor: '#8B9DC3',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E40AF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerRight: () => (
            <View style={styles.headerRight}>
              <UserProfile onShowLoginModal={() => setShowLoginModal(true)} />
              <TouchableOpacity
                onPress={() => setShowLanguageSelector(true)}
                style={styles.languageButton}
              >
                <Globe size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ),
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: t('home'),
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="insurance"
          options={{
            title: t('insurance'),
            tabBarIcon: ({ color }) => <Car size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="calculator"
          options={{
            title: t('safetyDriving'),
            tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="contact"
          options={{
            title: t('contact'),
            tabBarIcon: ({ color }) => <Phone size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="about"
          options={{
            title: t('about'),
            tabBarIcon: ({ color }) => <Info size={24} color={color} />,
          }}
        />
      </Tabs>
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
      <LoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButton: {
    marginLeft: 8,
  },
});

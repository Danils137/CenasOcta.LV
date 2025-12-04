import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/src/contexts/AuthContext";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function RootLayoutNav() {
  const { t } = useLanguage();

  return (
    <Stack screenOptions={{ headerBackTitle: "Atpakaļ" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{
          title: t('signIn'),
          headerStyle: { backgroundColor: '#1E40AF' },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen
        name="quote/[companyId]"
        options={{
          title: t('quote'),
          headerStyle: { backgroundColor: '#1E40AF' },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Profile",
          headerStyle: { backgroundColor: '#1E40AF' },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: t('settings'),
          headerStyle: { backgroundColor: '#1E40AF' },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen
        name="companies"
        options={{
          title: t('myCompanies'),
          headerStyle: { backgroundColor: '#1E40AF' },
          headerTintColor: '#fff'
        }}
      />
    </Stack>
  );
}

export default function AppLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <GestureHandlerRootView style={styles.container}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

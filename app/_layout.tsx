import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const inAuthGroup = segments[0] === 'auth';
      
      if (!user && !inAuthGroup) {
        router.replace('/auth/login');
      } else if (user && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="auth/login"
        options={{
          title: 'Iniciar Sesión',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth/register"
        options={{
          title: 'Registro',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <RootLayoutNav />
      </AppProvider>
    </AuthProvider>
  );
}

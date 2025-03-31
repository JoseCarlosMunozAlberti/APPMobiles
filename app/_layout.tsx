import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
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
      </AppProvider>
    </AuthProvider>
  );
}

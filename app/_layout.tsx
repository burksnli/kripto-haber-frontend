import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { PriceAlertsProvider } from '@/context/PriceAlertsContext';
import { PortfolioProvider } from '@/context/PortfolioContext';

// Custom theme definitions
const LightTheme = {
  dark: false,
  colors: {
    primary: '#627EEA',
    background: '#FFFFFF',
    card: '#F9F9F9',
    text: '#1A1A1A',
    border: '#E0E0E0',
    notification: '#FF4444',
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '200' as const,
    },
  },
};

const DarkTheme = {
  dark: true,
  colors: {
    primary: '#7B93FF',
    background: '#0D0D0D',
    card: '#1A1A1A',
    text: '#FFFFFF',
    border: '#2A2A2A',
    notification: '#FF6B6B',
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '200' as const,
    },
  },
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Set up notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [disclaimerShown, setDisclaimerShown] = useState(false);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // Show disclaimer alert on app launch
      if (!disclaimerShown) {
        Alert.alert(
          '⚠️ Uyarı',
          'Bu uygulama yalnızca bilgilendirme amaçlı kullanılabilir.\n\nHiçbir şekilde yatırım tavsiyesi değildir. Kripto paraların yüksek volatilitesi nedeniyle tüm yatırımlarınız risk altındadır.\n\nTarihsel veriler gelecekteki performansı garanti etmez.',
          [{ text: 'Anladım', onPress: () => setDisclaimerShown(true) }],
          { cancelable: false }
        );
      }
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PriceAlertsProvider>
      <PortfolioProvider>
        <RootLayoutNav />
      </PortfolioProvider>
    </PriceAlertsProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <ThemeProvider value={theme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen 
          name="admin" 
          options={{ 
            title: 'Admin Paneli',
            headerShown: true,
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: 'Ayarlar',
            headerShown: true,
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="analytics" 
          options={{ 
            title: 'İstatistikler',
            headerShown: true,
            presentation: 'modal'
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}

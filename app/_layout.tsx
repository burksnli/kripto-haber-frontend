import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/components/useColorScheme';
import { PriceAlertsProvider } from '@/context/PriceAlertsContext';
import { PortfolioProvider } from '@/context/PortfolioContext';
import { registerForPushNotificationsAsync } from '@/services/notificationService';

// Initialize Google Mobile Ads on native platforms
if (Platform.OS !== 'web') {
  try {
    const mobileAds = require('react-native-google-mobile-ads').default;
    mobileAds()
      .initialize()
      .then(() => {
        console.log('AdMob initialized');
      })
      .catch((error: any) => {
        console.log('AdMob initialization error:', error);
      });
  } catch (error) {
    console.log('AdMob not available:', error);
  }
}

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
    bold: {
      fontFamily: 'System',
      fontWeight: '700' as const,
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '900' as const,
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
    bold: {
      fontFamily: 'System',
      fontWeight: '700' as const,
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '900' as const,
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

// Set up notification handler (only on native platforms)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// Request notification permission
async function requestNotificationPermission() {
  // Skip on web platform
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const settings = await Notifications.getPermissionsAsync();
    
    // Already granted
    if (settings.granted) {
      return true;
    }

    // iOS specific check
    if (settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      return true;
    }

    // Can ask again
    if (settings.canAskAgain) {
      try {
        const permission = await Notifications.requestPermissionsAsync();
        return permission.granted;
      } catch (requestError) {
        console.log('Request permission error:', requestError);
      }
    }
  } catch (error) {
    console.log('Notification permission error:', error);
  }
  return false;
}

// Show disclaimer with platform-specific method
async function showDisclaimer() {
  try {
    // Check if disclaimer was already shown
    const disclaimerShown = await AsyncStorage.getItem('disclaimerShown');
    if (disclaimerShown === 'true') {
      return;
    }

    // Show disclaimer based on platform
    if (Platform.OS === 'web') {
      // For web, use confirm dialog
      const accepted = window.confirm(
        '⚠️ Uyarı\n\n' +
        'Bu uygulama yalnızca bilgilendirme amaçlı kullanılabilir.\n\n' +
        'Hiçbir şekilde yatırım tavsiyesi değildir. Kripto paraların yüksek volatilitesi nedeniyle tüm yatırımlarınız risk altındadır.\n\n' +
        'Tarihsel veriler gelecekteki performansı garanti etmez.'
      );
      
      if (accepted) {
        await AsyncStorage.setItem('disclaimerShown', 'true');
      }
    } else {
      // For native, use Alert
      Alert.alert(
        '⚠️ Uyarı',
        'Bu uygulama yalnızca bilgilendirme amaçlı kullanılabilir.\n\nHiçbir şekilde yatırım tavsiyesi değildir. Kripto paraların yüksek volatilitesi nedeniyle tüm yatırımlarınız risk altındadır.\n\nTarihsel veriler gelecekteki performansı garanti etmez.',
        [
          {
            text: 'Anladım',
            onPress: async () => {
              await AsyncStorage.setItem('disclaimerShown', 'true');
            }
          }
        ],
        { cancelable: false }
      );
    }
  } catch (error) {
    console.log('Error showing disclaimer:', error);
  }
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // Request notification permission
      requestNotificationPermission();
      // Register for push notifications (get Expo Push Token)
      registerForPushNotificationsAsync();
      // Show disclaimer alert on app launch
      showDisclaimer();
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

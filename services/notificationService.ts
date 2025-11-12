import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Get Expo Push Token for this device
 * This token is used to send push notifications from backend
 */
export const registerForPushNotificationsAsync = async () => {
  // Push notifications only work on physical devices
  if (Platform.OS === 'web') {
    console.log('Push notifications are not supported on web');
    return null;
  }

  try {
    // Check/request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    // Get the push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log('✅ Expo Push Token:', token.data);
    
    // Save token locally
    await AsyncStorage.setItem('expoPushToken', token.data);
    
    // Send token to backend
    await registerPushTokenToBackend(token.data);
    
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

/**
 * Register push token to backend
 */
async function registerPushTokenToBackend(pushToken: string) {
  try {
    const settings = await AsyncStorage.getItem('appSettings');
    const backendUrl = settings 
      ? JSON.parse(settings).backendUrl 
      : 'https://kripto-haber-backend.onrender.com';
    
    const response = await fetch(`${backendUrl}/api/register-push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ pushToken }),
    });
    
    if (response.ok) {
      console.log('✅ Push token registered to backend');
    } else {
      console.log('⚠️ Failed to register push token to backend');
    }
  } catch (error) {
    console.error('Error registering push token:', error);
  }
}

/**
 * Schedule a local notification
 */
export const scheduleNotification = async (payload: NotificationPayload) => {
  try {
    // Check if notifications are enabled
    const settings = await AsyncStorage.getItem('appSettings');
    const notificationsEnabled = settings ? JSON.parse(settings).notificationsEnabled : true;

    if (!notificationsEnabled) {
      console.log('Notifications are disabled');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        sound: 'default',
        badge: 1,
        data: payload.data || {},
      },
      trigger: {
        seconds: 1,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
};

/**
 * Send immediate notification
 */
export const sendNotification = async (payload: NotificationPayload) => {
  return scheduleNotification(payload);
};

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

/**
 * Telegram webhook handler for receiving news from Telegram bot
 * This should be set up on your backend server
 * Example: POST /api/telegram-webhook
 *
 * The webhook payload should look like:
 * {
 *   title: "Bitcoin Haber",
 *   body: "Bitcoin yeni rekor kırdı",
 *   coinSymbol?: "BTC"
 * }
 */
export const handleTelegramWebhook = async (payload: NotificationPayload) => {
  try {
    console.log('Received telegram webhook:', payload);

    // Save to AsyncStorage if you want to persist news
    const savedNews = await AsyncStorage.getItem('telegramNews');
    const newsArray = savedNews ? JSON.parse(savedNews) : [];

    newsArray.push({
      id: Date.now().toString(),
      ...payload,
      timestamp: new Date().toISOString(),
      source: 'Telegram',
    });

    // Keep only last 50 news items
    if (newsArray.length > 50) {
      newsArray.shift();
    }

    await AsyncStorage.setItem('telegramNews', JSON.stringify(newsArray));

    // Send notification to user
    await sendNotification(payload);

    return { success: true };
  } catch (error) {
    console.error('Error handling telegram webhook:', error);
    return { success: false, error };
  }
};

/**
 * Get saved Telegram news from AsyncStorage
 */
export const getTelegramNews = async () => {
  try {
    const savedNews = await AsyncStorage.getItem('telegramNews');
    return savedNews ? JSON.parse(savedNews) : [];
  } catch (error) {
    console.error('Error getting telegram news:', error);
    return [];
  }
};

/**
 * Clear saved Telegram news
 */
export const clearTelegramNews = async () => {
  try {
    await AsyncStorage.removeItem('telegramNews');
  } catch (error) {
    console.error('Error clearing telegram news:', error);
  }
};

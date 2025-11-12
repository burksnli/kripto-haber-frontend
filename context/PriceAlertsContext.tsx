import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface PriceAlert {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  targetPrice: number;
  alertType: 'above' | 'below';
  isActive: boolean;
  createdAt: string;
  lastNotified?: string;
}

interface PriceAlertsContextType {
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => Promise<void>;
  removeAlert: (alertId: string) => Promise<void>;
  toggleAlert: (alertId: string) => Promise<void>;
  updateAlert: (alertId: string, updates: Partial<PriceAlert>) => Promise<void>;
  checkPrices: (prices: { [key: string]: number }) => Promise<void>;
}

const PriceAlertsContext = createContext<PriceAlertsContextType | undefined>(undefined);

export const PriceAlertsProvider = ({ children }: { children: React.ReactNode }) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load alerts from storage on mount
  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const stored = await AsyncStorage.getItem('priceAlerts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setAlerts(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      // Initialize with empty array on error
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAlerts = async (newAlerts: PriceAlert[]) => {
    try {
      await AsyncStorage.setItem('priceAlerts', JSON.stringify(newAlerts));
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  };

  const addAlert = async (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: `alert_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...alerts, newAlert];
    await saveAlerts(updated);
  };

  const removeAlert = async (alertId: string) => {
    const updated = alerts.filter(a => a.id !== alertId);
    await saveAlerts(updated);
  };

  const toggleAlert = async (alertId: string) => {
    const updated = alerts.map(a =>
      a.id === alertId ? { ...a, isActive: !a.isActive } : a
    );
    await saveAlerts(updated);
  };

  const updateAlert = async (alertId: string, updates: Partial<PriceAlert>) => {
    const updated = alerts.map(a =>
      a.id === alertId ? { ...a, ...updates } : a
    );
    await saveAlerts(updated);
  };

  const checkPrices = async (prices: { [key: string]: number }) => {
    // Skip notifications on web platform
    if (Platform.OS === 'web') {
      return;
    }

    for (const alert of alerts) {
      if (!alert.isActive) continue;

      const currentPrice = prices[alert.coinId];
      if (!currentPrice) continue;

      let shouldNotify = false;
      if (alert.alertType === 'above' && currentPrice >= alert.targetPrice) {
        shouldNotify = true;
      } else if (alert.alertType === 'below' && currentPrice <= alert.targetPrice) {
        shouldNotify = true;
      }

      if (shouldNotify) {
        try {
          // Send notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `🚨 ${alert.coinName} Uyarısı!`,
              body: `${alert.coinName} ${alert.alertType === 'above' ? '✅' : '❌'} $${currentPrice.toFixed(2)} oldu. (Hedef: $${alert.targetPrice.toFixed(2)})`,
              data: { coinId: alert.coinId },
            },
            trigger: null,
          });

          // Update last notified time
          await updateAlert(alert.id, {
            lastNotified: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      }
    }
  };

  return (
    <PriceAlertsContext.Provider value={{ alerts, addAlert, removeAlert, toggleAlert, updateAlert, checkPrices }}>
      {children}
    </PriceAlertsContext.Provider>
  );
};

export const usePriceAlerts = () => {
  const context = useContext(PriceAlertsContext);
  if (!context) {
    throw new Error('usePriceAlerts must be used within PriceAlertsProvider');
  }
  return context;
};

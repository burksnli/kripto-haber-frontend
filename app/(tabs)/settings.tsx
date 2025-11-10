import { StyleSheet, ScrollView, Switch, Alert, View as RNView } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('appSettings');
      if (saved) {
        const { notificationsEnabled } = JSON.parse(saved);
        setNotificationsEnabled(notificationsEnabled ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem(
        'appSettings',
        JSON.stringify({
          notificationsEnabled: value,
        })
      );

      if (value) {
        // Request notification permission
        await Notifications.requestPermissionsAsync();
        Alert.alert('✅ Bildirimler Açıldı', 'Kripto haberleri ve güncellemeleri için bildirim alacaksınız.');
      } else {
        Alert.alert('❌ Bildirimler Kapatıldı', 'Artık bildirim almayacaksınız.');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Ayarlar</Text>
        <Text style={styles.headerSubtitle}>Uygulama tercihlerini yönetin</Text>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>⚠️ Bu bilgiler yatırım tavsiyesi değildir.</Text>
      </View>

      {/* Display Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌓 Görünüm</Text>

        <RNView style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Text style={styles.settingLabel}>Gece Modu</Text>
            <Text style={styles.settingDescription}>Sistem teması kullanılıyor</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={(value) => {
              setDarkMode(value);
              Alert.alert(
                'ℹ️ Bilgi',
                'Gece modu ayarı cihazınızın sistem temasına bağlıdır. Sistem ayarlarından değiştirebilirsiniz.'
              );
            }}
            disabled={true}
          />
        </RNView>
      </View>

      {/* Notifications Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Bildirimler</Text>

        <RNView style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Text style={styles.settingLabel}>Bildirim Desteği</Text>
            <Text style={styles.settingDescription}>Haberleri ve güncellemeleri al</Text>
          </View>
          <Switch value={notificationsEnabled} onValueChange={handleNotificationToggle} />
        </RNView>

        <Text style={styles.settingExplanation}>
          Bildirimler etkinleştirildiğinde, Telegram botunuzdan gelen haberleri anlık olarak öğreneceksiniz.
        </Text>
      </View>

      {/* About App */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Uygulama Hakkında</Text>

        <RNView style={styles.infoItem}>
          <Text style={styles.infoLabel}>📱 Uygulama Adı</Text>
          <Text style={styles.infoValue}>Kripto Haber Mobil</Text>
        </RNView>

        <RNView style={styles.infoItem}>
          <Text style={styles.infoLabel}>🏷️ Versiyon</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </RNView>

        <RNView style={styles.infoItem}>
          <Text style={styles.infoLabel}>👨‍💻 Geliştirici</Text>
          <Text style={styles.infoValue}>Kripto Haber Mobil</Text>
        </RNView>

        <RNView style={styles.infoItem}>
          <Text style={styles.infoLabel}>⚡ Framework</Text>
          <Text style={styles.infoValue}>React Native + Expo</Text>
        </RNView>
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚖️ Yasal Uyarı</Text>
        <Text style={styles.legalText}>
          Bu uygulama yalnızca bilgilendirme amaçlı kullanılabilir. Hiçbir şekilde yatırım tavsiyesi değildir. Kripto paraların yüksek volatilitesi nedeniyle tüm yatırımlarınız risk altındadır.
        </Text>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(33, 150, 243, 0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    opacity: 0.6,
  },
  disclaimer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  disclaimerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#856404',
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.15)',
    marginBottom: 10,
  },
  settingLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.6,
  },
  settingExplanation: {
    fontSize: 13,
    opacity: 0.7,
    marginHorizontal: 14,
    marginTop: 4,
    lineHeight: 18,
  },
  infoItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(33, 150, 243, 0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.1)',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  legalText: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.7,
    fontStyle: 'italic',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.03)',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ff6b6b',
  },
  spacer: {
    height: 20,
  },
});

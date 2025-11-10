import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, TextInput, Pressable, Alert, Switch } from 'react-native';
import { Text, View } from '@/components/Themed';

interface Settings {
  appTitle: string;
  backendUrl: string;
  telegramBotName: string;
  notificationsEnabled: boolean;
  darkMode: boolean;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({
    appTitle: 'Kripto Haber Mobil',
    backendUrl: 'https://kripto-haber-backend.onrender.com',
    telegramBotName: '@Kripto_Haber_Mobil_Bot',
    notificationsEnabled: true,
    darkMode: false,
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // LocalStorage'dan ayarları yükle
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setIsSaved(true);
    Alert.alert('Başarılı', 'Ayarlar kaydedildi');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    Alert.alert('Sıfırla', 'Tüm ayarları varsayılana döndürmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sıfırla',
        style: 'destructive',
        onPress: () => {
          setSettings({
            appTitle: 'Kripto Haber Mobil',
            backendUrl: 'https://kripto-haber-backend.onrender.com',
            telegramBotName: '@Kripto_Haber_Mobil_Bot',
            notificationsEnabled: true,
            darkMode: false,
          });
          localStorage.removeItem('appSettings');
          Alert.alert('Tamamlandı', 'Ayarlar sıfırlandı');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Ayarlar</Text>
        <Text style={styles.headerSubtitle}>Uygulama ayarlarını düzenleyin</Text>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Uygulama Ayarları</Text>

        <View style={styles.settingItem}>
          <Text style={styles.label}>Uygulama Adı</Text>
          <TextInput
            style={styles.input}
            value={settings.appTitle}
            onChangeText={(text) => setSettings({ ...settings, appTitle: text })}
            placeholder="Uygulama adını girin"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.label}>Backend URL</Text>
          <TextInput
            style={styles.input}
            value={settings.backendUrl}
            onChangeText={(text) => setSettings({ ...settings, backendUrl: text })}
            placeholder="Backend URL'sini girin"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.label}>Telegram Bot Adı</Text>
          <TextInput
            style={styles.input}
            value={settings.telegramBotName}
            onChangeText={(text) => setSettings({ ...settings, telegramBotName: text })}
            placeholder="Bot adını girin (@..."
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Özellikler</Text>

        <View style={styles.toggleItem}>
          <View>
            <Text style={styles.label}>Bildirimler</Text>
            <Text style={styles.description}>Yeni haberler için bildirim al</Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) =>
              setSettings({ ...settings, notificationsEnabled: value })
            }
            trackColor={{ false: '#ddd', true: '#627EEA' }}
          />
        </View>

        <View style={styles.toggleItem}>
          <View>
            <Text style={styles.label}>Koyu Mod</Text>
            <Text style={styles.description}>Sistem ayarlarına göre otomatik</Text>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => setSettings({ ...settings, darkMode: value })}
            trackColor={{ false: '#ddd', true: '#627EEA' }}
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ İşlemler</Text>

        <Pressable
          style={[styles.button, styles.saveButton, isSaved && styles.savedButton]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>
            {isSaved ? '✓ Kaydedildi' : 'Kaydet'}
          </Text>
        </Pressable>

        <Pressable style={[styles.button, styles.resetButton]} onPress={handleReset}>
          <Text style={styles.buttonText}>Sıfırla</Text>
        </Pressable>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ Bilgi</Text>
        <Text style={styles.infoText}>
          Buradaki ayarlar yerel olarak saklanır ve cihazınız dışında paylaşılmaz.
        </Text>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(98, 126, 234, 0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#627EEA',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    opacity: 0.6,
    color: '#666',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#000',
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  description: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#627EEA',
  },
  savedButton: {
    backgroundColor: '#28a745',
  },
  resetButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  infoBox: {
    marginHorizontal: 16,
    marginVertical: 20,
    backgroundColor: 'rgba(98, 126, 234, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#627EEA',
  },
  infoTitle: {
    fontWeight: '600',
    color: '#627EEA',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  spacer: {
    height: 20,
  },
});


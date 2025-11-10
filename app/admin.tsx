import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, TextInput, Pressable, Alert, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';

interface NewsItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  source?: string;
  emoji?: string;
}

export default function AdminPanel() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState({
    totalNews: 0,
    lastUpdate: '',
  });
  const [backendUrl] = useState('https://kripto-haber-backend.onrender.com');

  useEffect(() => {
    // LocalStorage'dan token'ı al
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setAdminToken(savedToken);
      fetchNews(savedToken);
    }
  }, []);

  const handleLogin = async () => {
    if (!password.trim()) {
      Alert.alert('Hata', 'Şifre girin');
      return;
    }

    setLoginLoading(true);
    try {
      const response = await fetch(`${backendUrl}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (data.ok) {
        setAdminToken(data.token);
        localStorage.setItem('adminToken', data.token);
        setPassword('');
        Alert.alert('Başarılı', 'Admin paneline hoş geldiniz!');
        fetchNews(data.token);
      } else {
        Alert.alert('Hata', data.error || 'Giriş başarısız');
      }
    } catch (error) {
      Alert.alert('Hata', 'Giriş yapılamadı: ' + (error as any).message);
    } finally {
      setLoginLoading(false);
    }
  };

  const fetchNews = async (token: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/news`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      const data = await response.json();
      if (data.ok) {
        setNews(data.news || []);
        setStats({
          totalNews: data.count || 0,
          lastUpdate: new Date().toLocaleString('tr-TR'),
        });
      }
    } catch (error) {
      console.error('Haberler yüklenemedi:', error);
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    Alert.alert('Sil', 'Bu haberi silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${backendUrl}/api/news/${newsId}`, {
              method: 'DELETE',
              headers: {
                'x-admin-token': adminToken || '',
                'x-admin-verified': 'true',
              },
            });

            if (response.ok) {
              setNews(news.filter(n => n.id !== newsId));
              Alert.alert('Başarılı', 'Haber silindi');
            } else {
              Alert.alert('Hata', 'Haber silinemedi');
            }
          } catch (error) {
            Alert.alert('Hata', 'Silme işlemi başarısız');
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('adminToken');
    setPassword('');
    Alert.alert('Çıkış', 'Admin panelinden çıktınız');
  };

  if (!adminToken) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.loginContainer}>
          <Text style={styles.title}>🔐 Admin Paneli</Text>
          <Text style={styles.subtitle}>Yönetim sistemi</Text>

          <RNView style={styles.form}>
            <Text style={styles.label}>Admin Şifresi</Text>
            <TextInput
              style={styles.input}
              placeholder="Şifre girin"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#999"
            />

            <Pressable
              style={[styles.button, styles.loginButton]}
              onPress={handleLogin}
              disabled={loginLoading}
            >
              <Text style={styles.buttonText}>
                {loginLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Text>
            </Pressable>
          </RNView>

          <View style={styles.info}>
            <Text style={styles.infoTitle}>ℹ️ Bilgi</Text>
            <Text style={styles.infoText}>
              Admin paneline erişmek için şifre girin. Bu panelde haberler yönetebilir ve silebilirsiniz.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>👨‍💼 Admin Dashboard</Text>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Toplam Haberler</Text>
          <Text style={styles.statValue}>{stats.totalNews}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Son Güncelleme</Text>
          <Text style={styles.statValue}>{stats.lastUpdate}</Text>
        </View>
      </View>

      {/* News List */}
      <View style={styles.newsSection}>
        <Text style={styles.sectionTitle}>📰 Haberler Yönetimi</Text>

        {news.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Henüz haber yok</Text>
          </View>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={news}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RNView style={styles.newsItem}>
                <View style={styles.newsItemContent}>
                  <Text style={styles.newsTitle} numberOfLines={2}>
                    {item.emoji} {item.title}
                  </Text>
                  <Text style={styles.newsBody} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text style={styles.newsTime}>
                    {new Date(item.timestamp).toLocaleString('tr-TR')}
                  </Text>
                </View>
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteNews(item.id)}
                >
                  <Text style={styles.deleteBtnText}>Sil</Text>
                </Pressable>
              </RNView>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#627EEA',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(98, 126, 234, 0.1)',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#dc3545',
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
    color: '#000',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: '#627EEA',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  info: {
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#627EEA',
  },
  newsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  newsItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsItemContent: {
    flex: 1,
    marginRight: 12,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  newsBody: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  newsTime: {
    fontSize: 11,
    color: '#999',
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
});


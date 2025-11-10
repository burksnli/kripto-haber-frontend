import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, TextInput, Pressable, Alert, FlatList, Modal } from 'react-native';
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
  
  // Edit modal state
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
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

  const handleOpenEdit = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setEditTitle(newsItem.title);
    setEditBody(newsItem.body);
    setEditEmoji(newsItem.emoji || '📰');
  };

  const handleSaveEdit = async () => {
    if (!editingNews) return;

    if (!editTitle.trim() || !editBody.trim()) {
      Alert.alert('Hata', 'Başlık ve içerik boş olamaz');
      return;
    }

    setEditLoading(true);
    try {
      console.log('Updating news:', {
        id: editingNews.id,
        title: editTitle,
        body: editBody,
        emoji: editEmoji,
        token: adminToken ? 'exists' : 'missing'
      });

      const response = await fetch(`${backendUrl}/api/news/${editingNews.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || '',
          'x-admin-verified': 'true',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          title: editTitle,
          body: editBody,
          emoji: editEmoji,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        const updatedNews = news.map(n =>
          n.id === editingNews.id
            ? { ...n, title: editTitle, body: editBody, emoji: editEmoji }
            : n
        );
        setNews(updatedNews);
        setEditingNews(null);
        Alert.alert('Başarılı', 'Haber güncellendi');
      } else {
        Alert.alert('Hata', data.error || 'Haber güncellenemedi - ' + response.status);
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Hata', 'Güncelleme işlemi başarısız: ' + (error as any).message);
    } finally {
      setEditLoading(false);
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
              Admin paneline erişmek için şifre girin. Bu panelde haberler yönetebilir, düzenleyebilir ve silebilirsiniz.
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
                <View style={styles.actionButtons}>
                  <Pressable
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => handleOpenEdit(item)}
                  >
                    <Text style={styles.actionBtnText}>✏️</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDeleteNews(item.id)}
                  >
                    <Text style={styles.actionBtnText}>🗑️</Text>
                  </Pressable>
                </View>
              </RNView>
            )}
          />
        )}
      </View>

      {/* Edit Modal */}
      <Modal
        visible={editingNews !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingNews(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ Haberi Düzenle</Text>
              <Pressable onPress={() => setEditingNews(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.fieldLabel}>Emoji</Text>
              <TextInput
                style={styles.input}
                value={editEmoji}
                onChangeText={setEditEmoji}
                placeholder="Emoji girin"
                maxLength={2}
              />

              <Text style={styles.fieldLabel}>Başlık</Text>
              <TextInput
                style={[styles.input, styles.titleInput]}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Başlık girin"
                multiline
              />

              <Text style={styles.fieldLabel}>İçerik</Text>
              <TextInput
                style={[styles.input, styles.bodyInput]}
                value={editBody}
                onChangeText={setEditBody}
                placeholder="İçerik girin"
                multiline
                numberOfLines={6}
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveEdit}
                  disabled={editLoading}
                >
                  <Text style={styles.buttonText}>
                    {editLoading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setEditingNews(null)}
                >
                  <Text style={styles.buttonText}>İptal</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  titleInput: {
    minHeight: 50,
  },
  bodyInput: {
    minHeight: 100,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  saveButton: {
    backgroundColor: '#28a745',
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    flex: 1,
    marginLeft: 8,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editBtn: {
    backgroundColor: '#007AFF',
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
  },
  actionBtnText: {
    fontSize: 14,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
});

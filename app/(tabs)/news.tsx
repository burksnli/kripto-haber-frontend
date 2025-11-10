import { StyleSheet, ScrollView, FlatList, RefreshControl, View as RNView, TextInput, Pressable, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Text, View } from '@/components/Themed';

interface NewsItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  source?: string;
  data?: Record<string, any>;
  emoji?: string;
}

export default function NewsScreen() {
  const [allNews, setAllNews] = useState<NewsItem[]>([
    {
      id: '1',
      title: 'Bitcoin Tarihî Rekor Kırdı',
      body: 'Bitcoin son günlerde önemli artış göstererek yeni tarihi seviyelere ulaştı. Analistler bu yükselişin devam edebileceğini düşünüyor.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: 'Crypto News',
      emoji: '📈',
    },
    {
      id: '2',
      title: 'Ethereum Güncellemesi Başarılı',
      body: 'Ethereum ağı yeni şapka güncellemesini tamamladı. Gas fees önemli ölçüde düştü ve hız 2 katına çıktı.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      source: 'ETH Network',
      emoji: '⚡',
    },
    {
      id: '3',
      title: 'Solana Ağı Stabilleşti',
      body: 'Son aylar içinde yaşadığı sorunlardan sonra Solana ağı artık istikrarlı bir şekilde çalışıyor. İşlem hızı ve güvenilirliği iyileşti.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      source: 'Solana Updates',
      emoji: '🚀',
    },
    {
      id: '4',
      title: 'Yeni Kripto Para Projesi',
      body: 'Yeni bir blockchain projesi piyasaya girdi ve ilk hafta içinde 100 milyon dolar topladı. Proje DeFi alanına odaklanıyor.',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      source: 'ICO Hub',
      emoji: '💡',
    },
    {
      id: '5',
      title: 'Merkez Bankası Kriptoları Kısıtlayabilir',
      body: 'Birçok ülkenin merkez bankası kripto paraları sınırlamayı düşünüyor. Fakat blokzincir teknolojisinin kullanılması destekleniyor.',
      timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      source: 'Finans Haberleri',
      emoji: '📰',
    },
  ]);
  const [news, setNews] = useState<NewsItem[]>(allNews);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      
      // Try to load from backend API first (for web)
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://kripto-haber-backend.onrender.com';
      try {
        const response = await fetch(`${backendUrl}/api/news`, {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Backend news:', data);
          if (data.news && data.news.length > 0) {
            setAllNews(data.news);
            setNews(data.news);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.log('Backend not available:', err);
      }
      
      // Fallback to AsyncStorage (for mobile)
      const savedNews = await AsyncStorage.getItem('telegramNews');
      if (savedNews) {
        const newsItems = JSON.parse(savedNews);
        setAllNews([...newsItems.reverse()]);
        setNews([...newsItems.reverse()]);
      }
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setNews(allNews);
    } else {
      const filtered = allNews.filter(item =>
        item.title.toLowerCase().includes(text.toLowerCase()) ||
        item.body.toLowerCase().includes(text.toLowerCase())
      );
      setNews(filtered);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const deleteNews = async (newsId: string) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://kripto-haber-backend.onrender.com';
      
      const response = await fetch(`${backendUrl}/api/news/${newsId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.ok) {
        // Haberi listeden kaldır
        setAllNews(prev => prev.filter(item => item.id !== newsId));
        setNews(prev => prev.filter(item => item.id !== newsId));
        Alert.alert('Başarılı', 'Haber silindi');
      } else {
        Alert.alert('Hata', 'Haber silinemedi');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      Alert.alert('Hata', 'Silme işlemi başarısız oldu');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📰 Kripto Haberler</Text>
        <Text style={styles.headerSubtitle}>En son güncellemeler ve analiz</Text>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>⚠️ Bu bilgiler yatırım tavsiyesi değildir.</Text>
      </View>

      {/* Search Bar */}
      <RNView style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Haber başlığı veya içeriğinde arayın..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery !== '' && (
          <Text
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              setNews(allNews);
            }}
          >
            ✕
          </Text>
        )}
      </RNView>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🔔 Telegram Entegrasyonu Aktif</Text>
        <Text style={styles.infoText}>
          Telegram botunuzdan yeni haberler otomatik olarak burada görünecek ve bildirim alacaksınız.
        </Text>
      </View>

      {loading && !news.length ? (
        <Text style={styles.centerText}>Haberler yükleniyor...</Text>
      ) : news.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Sonuç bulunamadı' : 'Henüz haber yok'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? `"${searchQuery}" ile eşleşen haber bulunamadı`
              : 'Telegram botunuzdan haber gönderdiğinizde burada görünecektir.'}
          </Text>
        </View>
      ) : (
        <FlatList
          scrollEnabled={false}
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <RNView style={[styles.newsCard, index === 0 && styles.newsCardFirst]}>
              <View style={styles.newsCardContent}>
                <View style={styles.newsHeader}>
                  <Text style={styles.emoji}>{item.emoji || '📌'}</Text>
                  <View style={styles.newsHeaderText}>
                    <Text style={styles.newsTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.newsMetaRow}>
                      {item.source && <Text style={styles.source}>{item.source}</Text>}
                      <Text style={styles.timestamp}>
                        {formatTime(item.timestamp)}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.newsDescription} numberOfLines={3}>
                  {item.body}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.cardFooterContent}>
                    <Text style={styles.readMore}>Devamını Oku →</Text>
                    <Pressable onPress={() => deleteNews(item.id)}>
                      <Text style={styles.deleteButton}>🗑️ Sil</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </RNView>
          )}
        />
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}dk önce`;
  if (diffHours < 24) return `${diffHours}sa önce`;
  if (diffDays < 7) return `${diffDays}gün önce`;
  
  return date.toLocaleDateString('tr-TR');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#627EEA',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
  },
  clearButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#627EEA',
    padding: 8,
  },
  infoBox: {
    backgroundColor: 'rgba(98, 126, 234, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#627EEA',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#627EEA',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#627EEA',
    lineHeight: 20,
    opacity: 0.8,
  },
  newsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(98, 126, 234, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.15)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  newsCardFirst: {
    marginTop: 0,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderColor: 'rgba(98, 126, 234, 0.3)',
  },
  newsCardContent: {
    padding: 16,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  newsHeaderText: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1976D2',
  },
  newsMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    fontSize: 11,
    fontWeight: '600',
    color: '#627EEA',
    backgroundColor: 'rgba(98, 126, 234, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.6,
  },
  newsDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.8,
  },
  cardFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(98, 126, 234, 0.1)',
  },
  cardFooterContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readMore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#627EEA',
  },
  deleteButton: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  centerText: {
    textAlign: 'center',
    marginVertical: 32,
    fontSize: 14,
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 64,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
    maxWidth: 200,
    lineHeight: 18,
  },
  spacer: {
    height: 20,
  },
});

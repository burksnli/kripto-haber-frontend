import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';

interface Analytics {
  totalNews: number;
  newsFromTelegram: number;
  newsFromOther: number;
  averageNewsPerDay: number;
  oldestNews: string;
  newestNews: string;
  updateFrequency: string;
}

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalNews: 0,
    newsFromTelegram: 0,
    newsFromOther: 0,
    averageNewsPerDay: 0,
    oldestNews: '-',
    newestNews: '-',
    updateFrequency: 'Her gün',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const backendUrl =
        (typeof window !== 'undefined' &&
          localStorage.getItem('appSettings') &&
          JSON.parse(localStorage.getItem('appSettings')!).backendUrl) ||
        'https://kripto-haber-backend.onrender.com';

      const response = await fetch(`${backendUrl}/api/news`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });

      if (response.ok) {
        const data = await response.json();
        const newsList = data.news || [];

        const telegramNews = newsList.filter(
          (n: any) => n.source === 'Telegram Bot'
        ).length;
        const otherNews = newsList.length - telegramNews;

        let oldestDate = '-';
        let newestDate = '-';

        if (newsList.length > 0) {
          const dates = newsList
            .map((n: any) => new Date(n.timestamp).getTime())
            .sort((a, b) => a - b);
          oldestDate = new Date(dates[0]).toLocaleDateString('tr-TR');
          newestDate = new Date(dates[dates.length - 1]).toLocaleDateString(
            'tr-TR'
          );
        }

        setAnalytics({
          totalNews: newsList.length,
          newsFromTelegram: telegramNews,
          newsFromOther: otherNews,
          averageNewsPerDay: newsList.length > 0 ? Math.round(newsList.length / 7) : 0,
          oldestNews: oldestDate,
          newestNews: newestDate,
          updateFrequency: 'Telegram Bot',
        });
      }
    } catch (error) {
      console.error('Analytics yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 İstatistikler</Text>
        <Text style={styles.headerSubtitle}>Haber analizi ve istatistikler</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
        </View>
      ) : (
        <>
          {/* Main Stats */}
          <View style={styles.statsGrid}>
            <RNView style={styles.statCard}>
              <Text style={styles.statIcon}>📰</Text>
              <Text style={styles.statLabel}>Toplam Haberler</Text>
              <Text style={styles.statValue}>{analytics.totalNews}</Text>
            </RNView>

            <RNView style={styles.statCard}>
              <Text style={styles.statIcon}>📱</Text>
              <Text style={styles.statLabel}>Telegram Haberleri</Text>
              <Text style={styles.statValue}>{analytics.newsFromTelegram}</Text>
            </RNView>

            <RNView style={styles.statCard}>
              <Text style={styles.statIcon}>📌</Text>
              <Text style={styles.statLabel}>Diğer Haberler</Text>
              <Text style={styles.statValue}>{analytics.newsFromOther}</Text>
            </RNView>

            <RNView style={styles.statCard}>
              <Text style={styles.statIcon}>📈</Text>
              <Text style={styles.statLabel}>Günlük Ortalama</Text>
              <Text style={styles.statValue}>{analytics.averageNewsPerDay}</Text>
            </RNView>
          </View>

          {/* Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>📋 Detaylar</Text>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>En Eski Haber</Text>
              <Text style={styles.detailValue}>{analytics.oldestNews}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>En Yeni Haber</Text>
              <Text style={styles.detailValue}>{analytics.newestNews}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Güncelleme Kaynağı</Text>
              <Text style={styles.detailValue}>{analytics.updateFrequency}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Telemetri</Text>
              <Text style={styles.detailValue}>Gerçek Zamanlı</Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>ℹ️ Bilgi</Text>
            <Text style={styles.infoText}>
              Bu istatistikler backend'den gerçek zamanlı olarak çekilir. Her 24
              saatte bir sıfırlanır.
            </Text>
          </View>

          {/* Charts Placeholder */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>📊 Grafikler</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>
                📈 Yakında gelecek: Haftalık istatistik grafiği
              </Text>
            </View>
          </View>

          <View style={styles.spacer} />
        </>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#627EEA',
  },
  detailsSection: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#627EEA',
    fontWeight: '600',
  },
  infoBox: {
    marginHorizontal: 16,
    marginVertical: 12,
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
  chartSection: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  chartPlaceholder: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  chartPlaceholderText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  spacer: {
    height: 20,
  },
});


import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d: number | null;
  price_change_percentage_30d: number | null;
  price_change_percentage_1y: number | null;
  market_cap_rank: number | null;
}

type TimeframeType = '24h' | '7d' | '30d' | '1y';

export default function MarketAnalysisScreen() {
  const router = useRouter();
  const [coins, setCoins] = useState<CryptoData[]>([]);
  const [timeframe, setTimeframe] = useState<TimeframeType>('24h');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCoins = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false&locale=tr&price_change_percentage=24h,7d,30d,1y'
      );
      const data = await response.json();
      setCoins(data);
    } catch (error) {
      console.error('Error fetching coins:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCoins();
  };

  const getChangePercentage = (coin: CryptoData): number => {
    switch (timeframe) {
      case '24h':
        return coin.price_change_percentage_24h || 0;
      case '7d':
        return coin.price_change_percentage_7d || 0;
      case '30d':
        return coin.price_change_percentage_30d || 0;
      case '1y':
        return coin.price_change_percentage_1y || 0;
      default:
        return 0;
    }
  };

  const getTimeframeLabel = (tf: TimeframeType): string => {
    switch (tf) {
      case '24h':
        return '24 Saat';
      case '7d':
        return '7 Gün';
      case '30d':
        return '30 Gün';
      case '1y':
        return '1 Yıl';
      default:
        return '';
    }
  };

  const sortedCoins = [...coins].sort((a, b) => {
    const changeA = getChangePercentage(a);
    const changeB = getChangePercentage(b);
    return changeB - changeA;
  });

  const gainers = sortedCoins.slice(0, 10);
  const losers = sortedCoins.slice(-10).reverse();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📊 Pazar Analizi</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#627EEA" />
          <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Pazar Analizi</Text>
        <Text style={styles.headerSubtitle}>Top 100 Coin Analizi</Text>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>⚠️ Bu bilgiler yatırım tavsiyesi değildir.</Text>
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeSection}>
        <Text style={styles.sectionTitle}>⏱️ Zaman Aralığı</Text>
        <View style={styles.timeframeButtons}>
          {(['24h', '7d', '30d', '1y'] as const).map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[styles.timeframeButton, timeframe === tf && styles.timeframeButtonActive]}
              onPress={() => setTimeframe(tf)}
            >
              <Text style={[styles.timeframeButtonText, timeframe === tf && styles.timeframeButtonTextActive]}>
                {getTimeframeLabel(tf)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Market Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Toplam Coinler</Text>
          <Text style={styles.statValue}>{coins.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Kazananlar</Text>
          <Text style={[styles.statValue, styles.positive]}>
            {gainers.filter(c => getChangePercentage(c) > 0).length}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Kaybedenler</Text>
          <Text style={[styles.statValue, styles.negative]}>
            {losers.filter(c => getChangePercentage(c) < 0).length}
          </Text>
        </View>
      </View>

      {/* Top Gainers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 En Çok Kazananlar</Text>
        {gainers.map((coin, index) => {
          const change = getChangePercentage(coin);
          return (
            <TouchableOpacity
              key={coin.id}
              onPress={() => router.push(`/coin/${coin.id}`)}
              activeOpacity={0.7}
            >
              <RNView style={[styles.coinCard, styles.gainCard]}>
                <View style={styles.coinCardLeft}>
                  <View style={styles.rankCircle}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.coinInfo}>
                    <Text style={styles.coinName}>{coin.name}</Text>
                    <Text style={styles.coinMeta}>
                      #{coin.market_cap_rank || '-'} • {coin.symbol?.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.coinCardRight}>
                  <Text style={styles.coinPrice}>
                    ${coin.current_price?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || 'N/A'}
                  </Text>
                  <Text style={[styles.changePercent, styles.positive]}>
                    ▲ {change.toFixed(2)}%
                  </Text>
                </View>
              </RNView>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Top Losers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📉 En Çok Kaybedenler</Text>
        {losers.map((coin, index) => {
          const change = getChangePercentage(coin);
          return (
            <TouchableOpacity
              key={coin.id}
              onPress={() => router.push(`/coin/${coin.id}`)}
              activeOpacity={0.7}
            >
              <RNView style={[styles.coinCard, styles.loseCard]}>
                <View style={styles.coinCardLeft}>
                  <View style={styles.rankCircle}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.coinInfo}>
                    <Text style={styles.coinName}>{coin.name}</Text>
                    <Text style={styles.coinMeta}>
                      #{coin.market_cap_rank || '-'} • {coin.symbol?.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.coinCardRight}>
                  <Text style={styles.coinPrice}>
                    ${coin.current_price?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || 'N/A'}
                  </Text>
                  <Text style={[styles.changePercent, styles.negative]}>
                    ▼ {Math.abs(change).toFixed(2)}%
                  </Text>
                </View>
              </RNView>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    opacity: 0.7,
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
  timeframeSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#627EEA',
    marginBottom: 12,
  },
  timeframeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.2)',
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: '#627EEA',
    borderColor: '#627EEA',
  },
  timeframeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#627EEA',
  },
  timeframeButtonTextActive: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.15)',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    fontWeight: '600',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#627EEA',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  coinCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(98, 126, 234, 0.05)',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.15)',
  },
  gainCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#00D084',
  },
  loseCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  coinCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#627EEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  coinInfo: {
    flex: 1,
  },
  coinName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 2,
  },
  coinMeta: {
    fontSize: 12,
    opacity: 0.6,
  },
  coinCardRight: {
    alignItems: 'flex-end',
  },
  coinPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F7931A',
    marginBottom: 4,
  },
  changePercent: {
    fontSize: 13,
    fontWeight: '700',
  },
  positive: {
    color: '#00D084',
  },
  negative: {
    color: '#FF6B6B',
  },
  spacer: {
    height: 20,
  },
});

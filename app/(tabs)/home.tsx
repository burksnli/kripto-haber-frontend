import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, RefreshControl, TouchableOpacity, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Text, View } from '@/components/Themed';

interface CryptoPrice {
  id: string;
  name: string;
  symbol: string;
  current_price: number | null;
  market_cap_rank: number | null;
  price_change_percentage_24h: number | null;
}

interface GlobalData {
  btc_dominance: number;
}

interface NewsItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  emoji?: string;
}

export default function HomeScreen() {
  const [btc, setBtc] = useState<CryptoPrice | null>(null);
  const [eth, setEth] = useState<CryptoPrice | null>(null);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteCoins, setFavoriteCoins] = useState<CryptoPrice[]>([]);
  const [gainers, setGainers] = useState<CryptoPrice[]>([]);
  const [losers, setLosers] = useState<CryptoPrice[]>([]);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch BTC and ETH
      const pricesRes = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&order=market_cap_desc&sparkline=false&locale=tr&price_change_percentage=24h'
      );
      const pricesData = await pricesRes.json();
      setBtc(pricesData[0]);
      setEth(pricesData[1]);

      // Fetch global data
      const globalRes = await fetch('https://api.coingecko.com/api/v3/global');
      const globalDataRes = await globalRes.json();
      setGlobalData(globalDataRes.data);

      // Fetch all coins for gainers/losers
      const allRes = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false&locale=tr&price_change_percentage=24h'
      );
      const allCoins = await allRes.json();

      // Get gainers and losers
      const sorted = [...allCoins].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
      setGainers(sorted.slice(0, 3));
      setLosers(sorted.slice(-3).reverse());

      // Load favorites and filter
      const saved = await AsyncStorage.getItem('favoriteCoinIds');
      const favIds = saved ? JSON.parse(saved) : [];
      setFavorites(favIds);
      
      const favCoins = allCoins.filter((coin: CryptoPrice) => favIds.includes(coin.id)).slice(0, 4);
      setFavoriteCoins(favCoins);

      // Load recent news
      const newsData = await AsyncStorage.getItem('telegramNews');
      const news = newsData ? JSON.parse(newsData).reverse().slice(0, 5) : [];
      setRecentNews(news);

    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🏠 Ana Sayfa</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#627EEA" />
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
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>🏠 Ana Sayfa</Text>
            <Text style={styles.headerSubtitle}>Kripto piyasasını izle</Text>
          </View>
        </View>
        
        {/* Quick Menu */}
        <View style={styles.quickMenu}>
          <Pressable 
            style={styles.quickMenuBtn}
            onPress={() => router.push('/admin')}
          >
            <Text style={styles.quickMenuBtnText}>👨‍💼 Admin</Text>
          </Pressable>
          <Pressable 
            style={styles.quickMenuBtn}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.quickMenuBtnText}>⚙️ Ayarlar</Text>
          </Pressable>
          <Pressable 
            style={styles.quickMenuBtn}
            onPress={() => router.push('/analytics')}
          >
            <Text style={styles.quickMenuBtnText}>📊 İstatistikler</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>⚠️ Bu bilgiler yatırım tavsiyesi değildir.</Text>
      </View>

      {/* BTC and ETH Prices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Ana Coinler</Text>
        <View style={styles.pricesRow}>
          {btc && (
            <TouchableOpacity onPress={() => router.push(`/coin/${btc.id}`)}>
              <RNView style={styles.priceBox}>
                <Text style={styles.coinLabel}>{btc.symbol?.toUpperCase()}</Text>
                <Text style={styles.priceValue}>
                  ${btc.current_price?.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </Text>
                <Text style={[styles.changeText, (btc.price_change_percentage_24h || 0) >= 0 ? styles.positive : styles.negative]}>
                  {(btc.price_change_percentage_24h || 0) >= 0 ? '▲' : '▼'} {Math.abs(btc.price_change_percentage_24h || 0).toFixed(2)}%
                </Text>
              </RNView>
            </TouchableOpacity>
          )}
          {eth && (
            <TouchableOpacity onPress={() => router.push(`/coin/${eth.id}`)}>
              <RNView style={styles.priceBox}>
                <Text style={styles.coinLabel}>{eth.symbol?.toUpperCase()}</Text>
                <Text style={styles.priceValue}>
                  ${eth.current_price?.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </Text>
                <Text style={[styles.changeText, (eth.price_change_percentage_24h || 0) >= 0 ? styles.positive : styles.negative]}>
                  {(eth.price_change_percentage_24h || 0) >= 0 ? '▲' : '▼'} {Math.abs(eth.price_change_percentage_24h || 0).toFixed(2)}%
                </Text>
              </RNView>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* BTC Dominance */}
      {globalData && (
        <RNView style={styles.dominanceBox}>
          <Text style={styles.dominanceLabel}>Bitcoin Dominansı</Text>
          <View style={styles.dominanceBar}>
            <View style={[styles.dominanceFill, { width: `${globalData.btc_dominance}%` }]} />
          </View>
          <Text style={styles.dominanceValue}>{globalData.btc_dominance?.toFixed(2)}%</Text>
        </RNView>
      )}

      {/* Favorite Coins */}
      {favoriteCoins.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Favori Coinlerim</Text>
          <View style={styles.favoritesGrid}>
            {favoriteCoins.map((coin) => (
              <TouchableOpacity key={coin.id} onPress={() => router.push(`/coin/${coin.id}`)}>
                <RNView style={styles.favoriteCard}>
                  <Text style={styles.favoriteName}>{coin.name}</Text>
                  <Text style={styles.favoritePrice}>
                    ${coin.current_price?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={[styles.favoriteChange, (coin.price_change_percentage_24h || 0) >= 0 ? styles.positive : styles.negative]}>
                    {(coin.price_change_percentage_24h || 0) >= 0 ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h || 0).toFixed(1)}%
                  </Text>
                </RNView>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Top Gainers */}
      {gainers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 En Çok Yükselen (24s)</Text>
          {gainers.map((coin) => (
            <TouchableOpacity key={coin.id} onPress={() => router.push(`/coin/${coin.id}`)}>
              <RNView style={styles.listItem}>
                <View style={styles.listLeft}>
                  <Text style={styles.listName}>{coin.name}</Text>
                  <Text style={styles.listSymbol}>{coin.symbol?.toUpperCase()}</Text>
                </View>
                <Text style={[styles.listChange, styles.positive]}>
                  +{(coin.price_change_percentage_24h || 0).toFixed(2)}%
                </Text>
              </RNView>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Top Losers */}
      {losers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📉 En Çok Düşen (24s)</Text>
          {losers.map((coin) => (
            <TouchableOpacity key={coin.id} onPress={() => router.push(`/coin/${coin.id}`)}>
              <RNView style={styles.listItem}>
                <View style={styles.listLeft}>
                  <Text style={styles.listName}>{coin.name}</Text>
                  <Text style={styles.listSymbol}>{coin.symbol?.toUpperCase()}</Text>
                </View>
                <Text style={[styles.listChange, styles.negative]}>
                  {(coin.price_change_percentage_24h || 0).toFixed(2)}%
                </Text>
              </RNView>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Recent News */}
      {recentNews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📰 Son Haberler</Text>
          {recentNews.map((news) => (
            <TouchableOpacity key={news.id} onPress={() => router.push(`/news/${news.id}`)}>
              <RNView style={styles.newsPreview}>
                <Text style={styles.newsTitle} numberOfLines={2}>{news.emoji} {news.title}</Text>
                <Text style={styles.newsBody} numberOfLines={2}>{news.body}</Text>
              </RNView>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(98, 126, 234, 0.1)',
  },
  headerTop: {
    marginBottom: 12,
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
  quickMenu: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickMenuBtn: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: 'rgba(98, 126, 234, 0.15)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.3)',
    alignItems: 'center',
  },
  quickMenuBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#627EEA',
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#627EEA',
    marginBottom: 12,
  },
  pricesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceBox: {
    flex: 1,
    backgroundColor: 'rgba(247, 147, 26, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F7931A',
  },
  coinLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F7931A',
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dominanceBox: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.15)',
  },
  dominanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#627EEA',
  },
  dominanceBar: {
    height: 8,
    backgroundColor: 'rgba(98, 126, 234, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  dominanceFill: {
    height: '100%',
    backgroundColor: '#F7931A',
  },
  dominanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F7931A',
  },
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  favoriteCard: {
    width: '48%',
    backgroundColor: 'rgba(98, 126, 234, 0.05)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.15)',
  },
  favoriteName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  favoritePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F7931A',
    marginBottom: 4,
  },
  favoriteChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(98, 126, 234, 0.03)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.1)',
  },
  listLeft: {
    flex: 1,
  },
  listName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  listSymbol: {
    fontSize: 12,
    opacity: 0.6,
  },
  listChange: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  newsPreview: {
    backgroundColor: 'rgba(98, 126, 234, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.1)',
  },
  newsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 6,
  },
  newsBody: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 18,
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

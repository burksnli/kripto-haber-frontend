import { StyleSheet, FlatList, ActivityIndicator, RefreshControl, ScrollView, View as RNView, TextInput, TouchableOpacity } from 'react-native';
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
  image: string;
}

export default function PricesScreen() {
  const router = useRouter();
  const [allPrices, setAllPrices] = useState<CryptoPrice[]>([]);
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const fetchPrices = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false&locale=tr&price_change_percentage=24h'
      );
      const data = await response.json();
      setAllPrices(data);
      setPrices(data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem('favoriteCoinIds');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (coinId: string) => {
    try {
      let updated: string[];
      if (favorites.includes(coinId)) {
        updated = favorites.filter(id => id !== coinId);
      } else {
        updated = [...favorites, coinId];
      }
      setFavorites(updated);
      await AsyncStorage.setItem('favoriteCoinIds', JSON.stringify(updated));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterPrices(text, showFavoritesOnly);
  };

  const handleFavoritesFilter = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    filterPrices(searchQuery, !showFavoritesOnly);
  };

  const filterPrices = (query: string, onlyFavorites: boolean) => {
    let filtered = allPrices;

    if (query.trim() !== '') {
      filtered = filtered.filter(coin =>
        coin.name.toLowerCase().includes(query.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (onlyFavorites) {
      filtered = filtered.filter(coin => favorites.includes(coin.id));
    }

    setPrices(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrices();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💰 Kripto Fiyatları</Text>
          <Text style={styles.headerSubtitle}>Top 250 Coinler</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#627EEA" />
          <Text style={styles.loadingText}>Fiyatlar yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Kripto Fiyatları</Text>
        <Text style={styles.headerSubtitle}>Top 250 Coinler • Gerçek Zamanlı</Text>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>⚠️ Bu bilgiler yatırım tavsiyesi değildir.</Text>
      </View>

      {/* Search Bar */}
      <RNView style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Coin adı veya sembolü arayın..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery !== '' && (
          <Text
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              filterPrices('', showFavoritesOnly);
            }}
          >
            ✕
          </Text>
        )}
      </RNView>

      {/* Favorites Filter Button */}
      <TouchableOpacity 
        style={[styles.favoritesButton, showFavoritesOnly && styles.favoritesButtonActive]}
        onPress={handleFavoritesFilter}
      >
        <Text style={styles.favoritesButtonText}>
          ⭐ Favorilerim {favorites.length > 0 && `(${favorites.length})`}
        </Text>
      </TouchableOpacity>

      <View style={styles.statsBar}>
        <RNView style={styles.statItem}>
          <Text style={styles.statLabel}>Gösterilen</Text>
          <Text style={styles.statValue}>{prices.length}</Text>
        </RNView>
        <RNView style={styles.statDivider} />
        <RNView style={styles.statItem}>
          <Text style={styles.statLabel}>Favoriler</Text>
          <Text style={styles.statValue}>{favorites.length}</Text>
        </RNView>
      </View>

      {prices.length > 0 ? (
        <FlatList
          scrollEnabled={false}
          data={prices}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              onPress={() => router.push(`/coin/${item.id}`)}
              activeOpacity={0.7}
            >
              <RNView style={[styles.priceCard, index === 0 && styles.priceCardFirst]}>
              <View style={styles.priceCardContent}>
                <View style={styles.priceLeft}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{item.market_cap_rank || '-'}</Text>
                  </View>
                  <View style={styles.coinInfo}>
                    <Text style={styles.coinName}>{item.name}</Text>
                    <Text style={styles.coinSymbol}>{item.symbol?.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.priceRight}>
                  <View style={styles.priceActions}>
                    <View style={styles.priceCol}>
                      <Text style={styles.price}>
                        ${item.current_price ? item.current_price.toLocaleString('en-US', { maximumFractionDigits: 2 }) : 'N/A'}
                      </Text>
                      {item.price_change_percentage_24h !== null && (
                        <Text
                          style={[
                            styles.priceChange,
                            item.price_change_percentage_24h >= 0 ? styles.priceChangePositive : styles.priceChangeNegative,
                          ]}
                        >
                          {item.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(item.price_change_percentage_24h).toFixed(2)}%
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity 
                      style={styles.favoriteBtn}
                      onPress={() => toggleFavorite(item.id)}
                    >
                      <Text style={styles.favoriteStar}>
                        {favorites.includes(item.id) ? '⭐' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </RNView>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
          <Text style={styles.emptySubtext}>
            {showFavoritesOnly 
              ? 'Henüz favori coin eklemedınız'
              : `"${searchQuery}" ile eşleşen kripto para bulunamadı`}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>CoinGecko API tarafından güncelleniyor</Text>
        <Text style={styles.footerHint}>Yenilemek için yukarıya çekin ↑</Text>
      </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
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
  favoritesButton: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(247, 147, 26, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F7931A',
    alignItems: 'center',
  },
  favoritesButtonActive: {
    backgroundColor: 'rgba(247, 147, 26, 0.2)',
    borderColor: '#F7931A',
  },
  favoritesButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F7931A',
  },
  statsBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    backgroundColor: 'rgba(98, 126, 234, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.15)',
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(98, 126, 234, 0.15)',
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#627EEA',
  },
  priceCard: {
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
  priceCardFirst: {
    marginTop: 0,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderColor: 'rgba(98, 126, 234, 0.3)',
  },
  priceCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#627EEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  coinInfo: {
    flex: 1,
  },
  coinName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 2,
  },
  coinSymbol: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '600',
  },
  priceRight: {
    alignItems: 'flex-end',
  },
  priceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F7931A',
    marginBottom: 4,
  },
  priceChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceChangePositive: {
    color: '#00D084',
  },
  priceChangeNegative: {
    color: '#FF6B6B',
  },
  favoriteBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteStar: {
    fontSize: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(98, 126, 234, 0.1)',
    marginHorizontal: 16,
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  footerHint: {
    fontSize: 11,
    opacity: 0.5,
    fontStyle: 'italic',
  },
});

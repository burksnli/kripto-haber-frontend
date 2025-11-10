import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from '@/components/Themed';

interface CoinDetail {
  id: string;
  name: string;
  symbol: string;
  image: { large: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    market_cap_rank: number;
    total_volume: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    price_change_percentage_200d: number;
    price_change_percentage_1y: number;
    high_24h: { usd: number };
    low_24h: { usd: number };
    ath: { usd: number };
    atl: { usd: number };
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
  };
  description: { en: string };
}

interface PriceData {
  prices: [number, number][];
  market_caps: [number, number][];
  volumes: [number, number][];
}

export default function CoinDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);

  const fetchCoinData = async () => {
    try {
      setLoading(true);

      // Fetch coin details
      const coinRes = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false&sparkline=false`
      );
      const coinData = await coinRes.json();
      setCoin(coinData);

      // Fetch price history
      let days = '7';
      if (timeframe === '30d') days = '30';
      if (timeframe === '90d') days = '90';

      const priceRes = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`
      );
      const priceHistoryData = await priceRes.json();
      setPriceData(priceHistoryData);
    } catch (error) {
      console.error('Error fetching coin details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCoinData();
    }
  }, [id, timeframe]);

  if (loading || !coin) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#627EEA" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  const currentPrice = coin.market_data?.current_price?.usd || 0;
  const change24h = coin.market_data?.price_change_percentage_24h || 0;
  const change7d = coin.market_data?.price_change_percentage_7d || 0;
  const change30d = coin.market_data?.price_change_percentage_30d || 0;
  const high24h = coin.market_data?.high_24h?.usd || 0;
  const low24h = coin.market_data?.low_24h?.usd || 0;
  const ath = coin.market_data?.ath?.usd || 0;
  const atl = coin.market_data?.atl?.usd || 0;
  const marketCap = coin.market_data?.market_cap?.usd || 0;
  const volume = coin.market_data?.total_volume?.usd || 0;
  const marketCapRank = coin.market_data?.market_cap_rank || 0;

  const highestPrice = priceData?.prices?.reduce((max, [_, price]) => Math.max(max, price), 0) || 0;
  const lowestPrice = priceData?.prices?.reduce((min, [_, price]) => Math.min(min, price), Infinity) || 0;
  const avgPrice = priceData?.prices?.length
    ? priceData.prices.reduce((sum, [_, price]) => sum + price, 0) / priceData.prices.length
    : 0;

  const openWebsite = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Geri</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.coinHeader}>
            <Text style={styles.coinName}>{coin.name}</Text>
            <Text style={styles.coinSymbol}>{coin.symbol?.toUpperCase()}</Text>
          </View>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{marketCapRank}</Text>
          </View>
        </View>

        {/* Price */}
        <Text style={styles.price}>
          ${currentPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
        </Text>

        {/* Changes */}
        <View style={styles.changesRow}>
          <View style={styles.changeCard}>
            <Text style={styles.changeLabel}>24h</Text>
            <Text style={[styles.changeValue, change24h >= 0 ? styles.positive : styles.negative]}>
              {change24h >= 0 ? '▲' : '▼'} {Math.abs(change24h).toFixed(2)}%
            </Text>
          </View>
          <View style={styles.changeCard}>
            <Text style={styles.changeLabel}>7d</Text>
            <Text style={[styles.changeValue, change7d >= 0 ? styles.positive : styles.negative]}>
              {change7d >= 0 ? '▲' : '▼'} {Math.abs(change7d).toFixed(2)}%
            </Text>
          </View>
          <View style={styles.changeCard}>
            <Text style={styles.changeLabel}>30d</Text>
            <Text style={[styles.changeValue, change30d >= 0 ? styles.positive : styles.negative]}>
              {change30d >= 0 ? '▲' : '▼'} {Math.abs(change30d).toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>⚠️ Bu bilgiler yatırım tavsiyesi değildir.</Text>
      </View>

      {/* Price Chart Timeframe */}
      <View style={styles.timeframeSection}>
        <Text style={styles.sectionTitle}>📊 Fiyat Grafiği</Text>
        <View style={styles.timeframeButtons}>
          {(['7d', '30d', '90d'] as const).map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[styles.timeframeButton, timeframe === tf && styles.timeframeButtonActive]}
              onPress={() => setTimeframe(tf)}
            >
              <Text style={[styles.timeframeButtonText, timeframe === tf && styles.timeframeButtonTextActive]}>
                {tf === '7d' ? '7 Gün' : tf === '30d' ? '1 Ay' : '3 Ay'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Price Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>📈 Fiyat İstatistikleri</Text>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Ortalama Fiyat ({timeframe})</Text>
          <Text style={styles.statValue}>${avgPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>En Yüksek ({timeframe})</Text>
          <Text style={styles.statValue}>${highestPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>En Düşük ({timeframe})</Text>
          <Text style={styles.statValue}>${lowestPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}</Text>
        </View>

        <View style={[styles.statRow, styles.borderTop]}>
          <Text style={styles.statLabel}>24s En Yüksek</Text>
          <Text style={styles.statValue}>${high24h.toLocaleString('en-US', { maximumFractionDigits: 2 })}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>24s En Düşük</Text>
          <Text style={styles.statValue}>${low24h.toLocaleString('en-US', { maximumFractionDigits: 2 })}</Text>
        </View>

        <View style={[styles.statRow, styles.borderTop]}>
          <Text style={styles.statLabel}>All-Time High</Text>
          <Text style={styles.statValue}>${ath.toLocaleString('en-US', { maximumFractionDigits: 2 })}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>All-Time Low</Text>
          <Text style={styles.statValue}>${atl.toLocaleString('en-US', { maximumFractionDigits: 2 })}</Text>
        </View>
      </View>

      {/* Market Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>💰 Pazar Verileri</Text>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Market Cap</Text>
          <Text style={styles.statValue}>
            ${(marketCap / 1e9).toFixed(2)}B
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>24h Hacim</Text>
          <Text style={styles.statValue}>
            ${(volume / 1e6).toFixed(2)}M
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Market Cap / Volume</Text>
          <Text style={styles.statValue}>
            {(marketCap / volume).toFixed(2)}x
          </Text>
        </View>
      </View>

      {/* Links Section */}
      {(coin.links?.homepage?.length || coin.links?.blockchain_site?.length) ? (
        <View style={styles.linksCard}>
          <Text style={styles.statsTitle}>🔗 Bağlantılar</Text>

          {coin.links?.homepage?.filter(url => url)?.map((url, idx) => (
            <TouchableOpacity
              key={`home-${idx}`}
              style={styles.linkButton}
              onPress={() => openWebsite(url)}
            >
              <Text style={styles.linkIcon}>🌐</Text>
              <Text style={styles.linkText}>Resmi Website</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          ))}

          {coin.links?.blockchain_site?.filter(url => url)?.slice(0, 3)?.map((url, idx) => (
            <TouchableOpacity
              key={`explorer-${idx}`}
              style={styles.linkButton}
              onPress={() => openWebsite(url)}
            >
              <Text style={styles.linkIcon}>🔗</Text>
              <Text style={styles.linkText}>
                {url.includes('etherscan') ? 'Etherscan' : url.includes('bscscan') ? 'BscScan' : 'Block Explorer'}
              </Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {/* Description */}
      {coin.description?.en && (
        <View style={styles.descriptionCard}>
          <Text style={styles.statsTitle}>📝 Açıklama</Text>
          <Text style={styles.description} numberOfLines={6}>
            {coin.description.en.replace(/<[^>]*>/g, '').substring(0, 300)}...
          </Text>
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
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#627EEA',
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  coinHeader: {
    flex: 1,
  },
  coinName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#627EEA',
    marginBottom: 4,
  },
  coinSymbol: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
  },
  rankBadge: {
    backgroundColor: '#627EEA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F7931A',
    marginBottom: 12,
  },
  changesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  changeCard: {
    flex: 1,
    backgroundColor: 'rgba(98, 126, 234, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeLabel: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 4,
  },
  changeValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  positive: {
    color: '#00D084',
  },
  negative: {
    color: '#FF6B6B',
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
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(98, 126, 234, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.15)',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#627EEA',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(98, 126, 234, 0.08)',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(98, 126, 234, 0.08)',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F7931A',
  },
  linksCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(98, 126, 234, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.15)',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderRadius: 8,
    marginBottom: 8,
  },
  linkIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  linkArrow: {
    fontSize: 16,
    color: '#627EEA',
  },
  descriptionCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(98, 126, 234, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.15)',
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.8,
  },
  spacer: {
    height: 20,
  },
});

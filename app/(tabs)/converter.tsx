import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import { Text, View } from '@/components/Themed';

interface CryptoPrice {
  id: string;
  name: string;
  symbol: string;
  current_price: number | null;
}

interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
}

export default function ConverterScreen() {
  const [allCoins, setAllCoins] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // From side
  const [fromType, setFromType] = useState<'crypto' | 'fiat'>('crypto');
  const [fromCoin, setFromCoin] = useState<CryptoPrice | null>(null);
  const [fromAmount, setFromAmount] = useState('1');
  
  // To side
  const [toType, setToType] = useState<'fiat' | 'crypto'>('fiat');
  const [toCoin, setToCoin] = useState<CryptoPrice | null>(null);
  const [toAmount, setToAmount] = useState('0');
  
  // UI State
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [searchFromQuery, setSearchFromQuery] = useState('');
  const [searchToQuery, setSearchToQuery] = useState('');

  const fetchCoins = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false'
      );
      const data = await response.json();
      setAllCoins(data);
      
      // Set defaults
      if (data.length > 0) {
        setFromCoin(data[0]); // BTC
        if (data.length > 1) {
          setToCoin(data[1]); // ETH
        }
      }
    } catch (error) {
      console.error('Error fetching coins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  // Calculate conversion
  useEffect(() => {
    if (!fromAmount || isNaN(parseFloat(fromAmount))) {
      setToAmount('0');
      return;
    }

    const amount = parseFloat(fromAmount);
    let result = 0;

    if (fromType === 'crypto' && fromCoin) {
      const fromPrice = fromCoin.current_price || 0;
      
      if (toType === 'fiat') {
        result = amount * fromPrice;
      } else if (toType === 'crypto' && toCoin) {
        const toPrice = toCoin.current_price || 0;
        result = (amount * fromPrice) / toPrice;
      }
    } else if (fromType === 'fiat' && toCoin) {
      const toPrice = toCoin.current_price || 0;
      result = amount / toPrice;
    }

    setToAmount(result.toFixed(8).replace(/\.?0+$/, ''));
  }, [fromAmount, fromType, fromCoin, toType, toCoin]);

  const getFilteredCoins = (query: string) => {
    return allCoins.filter(coin =>
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase())
    );
  };

  const swap = () => {
    const tempType = fromType;
    const tempCoin = fromCoin;
    const tempAmount = toAmount;

    setFromType(toType === 'fiat' ? 'crypto' : 'fiat');
    setFromCoin(toCoin);
    setFromAmount(tempAmount || '1');

    setToType(tempType as 'fiat' | 'crypto');
    setToCoin(tempCoin);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💱 Çevirici</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#627EEA" />
          <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
        </View>
      </View>
    );
  }

  const fromCoinsFiltered = getFilteredCoins(searchFromQuery);
  const toCoinsFiltered = getFilteredCoins(searchToQuery);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💱 Çevirici</Text>
        <Text style={styles.headerSubtitle}>Kripto/USD Dönüştür</Text>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>⚠️ Bu bilgiler yatırım tavsiyesi değildir.</Text>
      </View>

      {/* Main Converter Card */}
      <View style={styles.converterCard}>
        {/* FROM Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Gönder</Text>
          
          {/* Type Selector */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, fromType === 'crypto' && styles.typeButtonActive]}
              onPress={() => setFromType('crypto')}
            >
              <Text style={[styles.typeButtonText, fromType === 'crypto' && styles.typeButtonTextActive]}>
                🪙 Kripto
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, fromType === 'fiat' && styles.typeButtonActive]}
              onPress={() => setFromType('fiat')}
            >
              <Text style={[styles.typeButtonText, fromType === 'fiat' && styles.typeButtonTextActive]}>
                💵 USD
              </Text>
            </TouchableOpacity>
          </View>

          {/* Coin/Currency Selector */}
          {fromType === 'crypto' && (
            <>
              <TouchableOpacity 
                style={styles.coinSelector}
                onPress={() => setShowFromDropdown(!showFromDropdown)}
              >
                {fromCoin ? (
                  <>
                    <Text style={styles.coinSelectorText}>
                      🪙 {fromCoin.name} ({fromCoin.symbol?.toUpperCase()})
                    </Text>
                    <Text style={styles.coinPrice}>
                      ${fromCoin.current_price?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.coinSelectorText}>Coin Seç</Text>
                )}
              </TouchableOpacity>

              {showFromDropdown && (
                <View style={styles.dropdown}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Ara..."
                    placeholderTextColor="#999"
                    value={searchFromQuery}
                    onChangeText={setSearchFromQuery}
                  />
                  <RNView style={styles.dropdownList}>
                    {fromCoinsFiltered.slice(0, 8).map((coin) => (
                      <TouchableOpacity
                        key={coin.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setFromCoin(coin);
                          setShowFromDropdown(false);
                          setSearchFromQuery('');
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          {coin.name} ({coin.symbol?.toUpperCase()})
                        </Text>
                        <Text style={styles.dropdownItemPrice}>
                          ${coin.current_price?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </RNView>
                </View>
              )}
            </>
          )}

          {fromType === 'fiat' && (
            <View style={styles.fiatDisplay}>
              <Text style={styles.fiatLabel}>💵 USD (Amerikan Doları)</Text>
            </View>
          )}

          {/* Amount Input */}
          <TextInput
            style={styles.amountInput}
            placeholder="Miktarı girin"
            placeholderTextColor="#999"
            value={fromAmount}
            onChangeText={setFromAmount}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Swap Button */}
        <TouchableOpacity style={styles.swapButton} onPress={swap}>
          <Text style={styles.swapButtonText}>⇄</Text>
        </TouchableOpacity>

        {/* TO Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Al</Text>
          
          {/* Type Selector */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, toType === 'crypto' && styles.typeButtonActive]}
              onPress={() => setToType('crypto')}
            >
              <Text style={[styles.typeButtonText, toType === 'crypto' && styles.typeButtonTextActive]}>
                🪙 Kripto
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, toType === 'fiat' && styles.typeButtonActive]}
              onPress={() => setToType('fiat')}
            >
              <Text style={[styles.typeButtonText, toType === 'fiat' && styles.typeButtonTextActive]}>
                💵 USD
              </Text>
            </TouchableOpacity>
          </View>

          {/* Coin/Currency Selector */}
          {toType === 'crypto' && (
            <>
              <TouchableOpacity 
                style={styles.coinSelector}
                onPress={() => setShowToDropdown(!showToDropdown)}
              >
                {toCoin ? (
                  <>
                    <Text style={styles.coinSelectorText}>
                      🪙 {toCoin.name} ({toCoin.symbol?.toUpperCase()})
                    </Text>
                    <Text style={styles.coinPrice}>
                      ${toCoin.current_price?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.coinSelectorText}>Coin Seç</Text>
                )}
              </TouchableOpacity>

              {showToDropdown && (
                <View style={styles.dropdown}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Ara..."
                    placeholderTextColor="#999"
                    value={searchToQuery}
                    onChangeText={setSearchToQuery}
                  />
                  <RNView style={styles.dropdownList}>
                    {toCoinsFiltered.slice(0, 8).map((coin) => (
                      <TouchableOpacity
                        key={coin.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setToCoin(coin);
                          setShowToDropdown(false);
                          setSearchToQuery('');
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          {coin.name} ({coin.symbol?.toUpperCase()})
                        </Text>
                        <Text style={styles.dropdownItemPrice}>
                          ${coin.current_price?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </RNView>
                </View>
              )}
            </>
          )}

          {toType === 'fiat' && (
            <View style={styles.fiatDisplay}>
              <Text style={styles.fiatLabel}>💵 USD (Amerikan Doları)</Text>
            </View>
          )}

          {/* Amount Display */}
          <View style={styles.resultBox}>
            <Text style={styles.resultValue}>{toAmount}</Text>
            <Text style={styles.resultLabel}>
              {toType === 'fiat' ? 'USD' : toCoin?.symbol?.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Conversions */}
      {fromCoin && toCoin && (
        <View style={styles.quickSection}>
          <Text style={styles.quickTitle}>📊 Hızlı Referans</Text>
          <View style={styles.quickGrid}>
            {[1, 10, 100, 1000].map((amount) => {
              const fromPrice = fromCoin.current_price || 0;
              const toPrice = toCoin.current_price || 0;
              const result = (amount * fromPrice) / toPrice;
              return (
                <View key={amount} style={styles.quickCard}>
                  <Text style={styles.quickAmount}>1 {fromCoin.symbol?.toUpperCase()}</Text>
                  <Text style={styles.quickEquals}>=</Text>
                  <Text style={styles.quickResult}>
                    {result.toFixed(4)} {toCoin.symbol?.toUpperCase()}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

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
  converterCard: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(98, 126, 234, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.15)',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#627EEA',
    marginBottom: 12,
    opacity: 0.8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.2)',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#627EEA',
    borderColor: '#627EEA',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#627EEA',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  coinSelector: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(247, 147, 26, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F7931A',
    marginBottom: 12,
  },
  coinSelectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F7931A',
    marginBottom: 4,
  },
  coinPrice: {
    fontSize: 12,
    color: '#F7931A',
    opacity: 0.7,
  },
  dropdown: {
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.15)',
    overflow: 'hidden',
    maxHeight: 250,
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(98, 126, 234, 0.1)',
    fontSize: 13,
    color: '#000',
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(98, 126, 234, 0.08)',
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1976D2',
    flex: 1,
  },
  dropdownItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F7931A',
  },
  fiatDisplay: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginBottom: 12,
  },
  fiatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  amountInput: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(98, 126, 234, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#627EEA',
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  swapButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#627EEA',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: -25,
    zIndex: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  swapButtonText: {
    fontSize: 24,
    color: 'white',
  },
  resultBox: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  resultLabel: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  quickSection: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 20,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#627EEA',
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCard: {
    width: '48%',
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.15)',
    alignItems: 'center',
  },
  quickAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#627EEA',
    marginBottom: 4,
  },
  quickEquals: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
  },
  quickResult: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  spacer: {
    height: 20,
  },
});

import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, TouchableOpacity, TextInput, Modal, Alert, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { Text, View } from '@/components/Themed';
import { usePortfolio } from '@/context/PortfolioContext';

interface CoinPrice {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
}

export default function PortfolioScreen() {
  const { holdings, addTransaction, removeHolding, getTotalInvested, getTotalValue, getProfitLoss, getProfitLossPercentage } = usePortfolio();
  const [prices, setPrices] = useState<{ [key: string]: number }>({});
  const [coins, setCoins] = useState<CoinPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinPrice | null>(null);
  const [quantity, setQuantity] = useState('');
  const [transactionPrice, setTransactionPrice] = useState('');
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
  const [showCoinList, setShowCoinList] = useState(false);
  const [searchCoin, setSearchCoin] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false'
      );
      const data = await response.json();
      setCoins(data);
      
      // Create price map
      const priceMap: { [key: string]: number } = {};
      data.forEach((coin: any) => {
        priceMap[coin.id] = coin.current_price;
      });
      setPrices(priceMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!selectedCoin || !quantity || !transactionPrice) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(transactionPrice);

    if (transactionType === 'sell') {
      const holding = holdings.find(h => h.coinId === selectedCoin.id);
      if (!holding || holding.quantity < qty) {
        Alert.alert('Hata', 'Satmak istediğiniz miktar yeterli değil');
        return;
      }
    }

    await addTransaction(
      {
        type: transactionType,
        quantity: qty,
        price: price,
        date: new Date().toISOString(),
        total: qty * price,
      },
      {
        id: selectedCoin.id,
        name: selectedCoin.name,
        symbol: selectedCoin.symbol,
      }
    );

    resetForm();
    setShowModal(false);
    Alert.alert('Başarılı', `${selectedCoin.name} işlemi eklendi!`);
  };

  const resetForm = () => {
    setSelectedCoin(null);
    setQuantity('');
    setTransactionPrice('');
    setTransactionType('buy');
    setSearchCoin('');
    setShowCoinList(false);
  };

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(searchCoin.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchCoin.toLowerCase())
  );

  const totalInvested = getTotalInvested();
  const totalValue = getTotalValue(prices);
  const profitLoss = getProfitLoss(prices);
  const profitLossPercentage = getProfitLossPercentage(prices);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💼 Portföyüm</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#627EEA" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💼 Portföyüm</Text>
        <Text style={styles.headerSubtitle}>Kripto yatırımlarımı izle</Text>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>⚠️ Bu bilgiler yatırım tavsiyesi değildir.</Text>
      </View>

      {/* Portfolio Summary */}
      {holdings.length > 0 ? (
        <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Toplam Yatırım</Text>
              <Text style={styles.summaryValue}>${totalInvested.toLocaleString('en-US', { maximumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Mevcut Değer</Text>
              <Text style={styles.summaryValue}>${totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</Text>
            </View>
          </View>

          <View style={[styles.profitCard, profitLoss >= 0 ? styles.profitCardPositive : styles.profitCardNegative]}>
            <View>
              <Text style={styles.profitLabel}>
                {profitLoss >= 0 ? '📈 Kar' : '📉 Zarar'}
              </Text>
              <Text style={[styles.profitValue, profitLoss >= 0 ? styles.positive : styles.negative]}>
                ${Math.abs(profitLoss).toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.profitPercent}>
              <Text style={[styles.profitPercentValue, profitLoss >= 0 ? styles.positive : styles.negative]}>
                {profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%
              </Text>
            </View>
          </View>
        </>
      ) : null}

      {/* Add Transaction Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.addButtonText}>+ Al/Sat İşlemi Ekle</Text>
      </TouchableOpacity>

      {/* Holdings List */}
      {holdings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💰</Text>
          <Text style={styles.emptyText}>Henüz holding yok</Text>
          <Text style={styles.emptySubtext}>Al/Sat işlemi yaparak başla!</Text>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Varlıklarım</Text>
          {holdings.map(holding => {
            const currentPrice = prices[holding.coinId] || 0;
            const currentValue = holding.quantity * currentPrice;
            const holdingProfitLoss = currentValue - holding.totalInvested;
            const holdingProfitLossPercentage = (holdingProfitLoss / holding.totalInvested) * 100;

            return (
              <View key={holding.id} style={styles.holdingCard}>
                <View style={styles.holdingTop}>
                  <View style={styles.holdingInfo}>
                    <Text style={styles.holdingName}>{holding.coinName}</Text>
                    <Text style={styles.holdingMeta}>
                      {holding.quantity.toFixed(4)} {holding.coinSymbol}
                    </Text>
                  </View>
                  <View style={styles.holdingValue}>
                    <Text style={styles.holdingPrice}>
                      ${currentValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </Text>
                    <Text style={[styles.holdingChange, holdingProfitLoss >= 0 ? styles.positive : styles.negative]}>
                      {holdingProfitLoss >= 0 ? '📈' : '📉'} {holdingProfitLossPercentage.toFixed(2)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.holdingBottom}>
                  <View style={styles.holdingStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Ort. Fiyat</Text>
                      <Text style={styles.statValue}>${holding.averageBuyPrice.toFixed(2)}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Güncel Fiyat</Text>
                      <Text style={styles.statValue}>${currentPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Yatırım</Text>
                      <Text style={styles.statValue}>${holding.totalInvested.toLocaleString('en-US', { maximumFractionDigits: 2 })}</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={() => {
                    Alert.alert(
                      'Tümünü Sat',
                      `${holding.coinName} varlığını tamamen satmak istediğinizden emin misiniz?`,
                      [
                        { text: 'İptal', style: 'cancel' },
                        { 
                          text: 'Evet Sat', 
                          style: 'destructive',
                          onPress: () => removeHolding(holding.id)
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.deleteBtnText}>🗑️ Tümünü Sat</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.spacer} />

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Al/Sat İşlemi</Text>
              <TouchableOpacity onPress={() => { resetForm(); setShowModal(false); }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Coin Selection */}
            <Text style={styles.label}>Coin Seç</Text>
            <TouchableOpacity 
              style={styles.coinSelectBtn}
              onPress={() => setShowCoinList(!showCoinList)}
            >
              <Text style={styles.coinSelectText}>
                {selectedCoin ? `${selectedCoin.name} (${selectedCoin.symbol})` : 'Coin Seçin...'}
              </Text>
            </TouchableOpacity>

            {showCoinList && (
              <>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Coin ara..."
                  placeholderTextColor="#999"
                  value={searchCoin}
                  onChangeText={setSearchCoin}
                />
                <FlatList
                  scrollEnabled={false}
                  data={filteredCoins.slice(0, 10)}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.coinListItem}
                      onPress={() => {
                        setSelectedCoin(item);
                        setShowCoinList(false);
                        setTransactionPrice(item.current_price.toString());
                      }}
                    >
                      <Text style={styles.coinListItemText}>{item.name} ({item.symbol})</Text>
                      <Text style={styles.coinListItemPrice}>${item.current_price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}

            {/* Transaction Type */}
            <Text style={styles.label}>İşlem Türü</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity 
                style={[styles.typeBtn, transactionType === 'buy' && styles.typeBtnActive]}
                onPress={() => setTransactionType('buy')}
              >
                <Text style={styles.typeBtnText}>🟢 AL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeBtn, transactionType === 'sell' && styles.typeBtnActive]}
                onPress={() => setTransactionType('sell')}
              >
                <Text style={styles.typeBtnText}>🔴 SAT</Text>
              </TouchableOpacity>
            </View>

            {/* Quantity */}
            <Text style={styles.label}>Miktar</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 1.5"
              placeholderTextColor="#999"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
            />

            {/* Price */}
            <Text style={styles.label}>Fiyat ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 45000"
              placeholderTextColor="#999"
              value={transactionPrice}
              onChangeText={setTransactionPrice}
              keyboardType="decimal-pad"
            />

            {quantity && transactionPrice && (
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Toplam:</Text>
                <Text style={styles.totalValue}>
                  ${(parseFloat(quantity) * parseFloat(transactionPrice)).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </Text>
              </View>
            )}

            {/* Create Button */}
            <TouchableOpacity 
              style={styles.createBtn}
              onPress={handleAddTransaction}
            >
              <Text style={styles.createBtnText}>İşlemi Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.15)',
    overflow: 'hidden',
  },
  summaryItem: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(98, 126, 234, 0.1)',
  },
  summaryLabel: {
    fontSize: 11,
    opacity: 0.6,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#627EEA',
  },
  profitCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  profitCardPositive: {
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
    borderColor: '#00D084',
  },
  profitCardNegative: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: '#FF6B6B',
  },
  profitLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 4,
  },
  profitValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profitPercent: {
    alignItems: 'flex-end',
  },
  profitPercentValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#627EEA',
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
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
  holdingCard: {
    backgroundColor: 'rgba(98, 126, 234, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.15)',
  },
  holdingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 2,
  },
  holdingMeta: {
    fontSize: 12,
    opacity: 0.6,
  },
  holdingValue: {
    alignItems: 'flex-end',
  },
  holdingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F7931A',
    marginBottom: 4,
  },
  holdingChange: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  holdingBottom: {
    marginBottom: 10,
  },
  holdingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#627EEA',
  },
  deleteBtn: {
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  },
  spacer: {
    height: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#627EEA',
  },
  closeBtn: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#627EEA',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#627EEA',
    marginBottom: 8,
  },
  coinSelectBtn: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#627EEA',
    marginBottom: 12,
  },
  coinSelectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#627EEA',
  },
  searchInput: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#627EEA',
    marginBottom: 8,
    fontSize: 13,
    color: '#000',
  },
  coinListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(98, 126, 234, 0.1)',
  },
  coinListItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1976D2',
  },
  coinListItemPrice: {
    fontSize: 12,
    color: '#F7931A',
    fontWeight: '600',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.2)',
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#627EEA',
    borderColor: '#627EEA',
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#627EEA',
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#627EEA',
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  createBtn: {
    paddingVertical: 14,
    backgroundColor: '#627EEA',
    borderRadius: 10,
    alignItems: 'center',
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  positive: {
    color: '#00D084',
  },
  negative: {
    color: '#FF6B6B',
  },
});

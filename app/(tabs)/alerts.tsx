import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, TouchableOpacity, TextInput, FlatList, Modal } from 'react-native';
import { useEffect, useState } from 'react';
import { Text, View } from '@/components/Themed';
import { usePriceAlerts, PriceAlert } from '@/context/PriceAlertsContext';
import { showAlert } from '@/utils/platformHelpers';

interface CoinOption {
  id: string;
  name: string;
  symbol: string;
}

export default function AlertsScreen() {
  const { alerts, addAlert, removeAlert, toggleAlert } = usePriceAlerts();
  const [coins, setCoins] = useState<CoinOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinOption | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');
  const [showCoinList, setShowCoinList] = useState(false);
  const [searchCoin, setSearchCoin] = useState('');

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false'
      );
      const data = await response.json();
      setCoins(data.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
      })));
    } catch (error) {
      console.error('Error fetching coins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlert = async () => {
    if (!selectedCoin || !targetPrice) {
      showAlert('Hata', 'Lütfen coin ve hedef fiyat girin');
      return;
    }

    await addAlert({
      coinId: selectedCoin.id,
      coinName: selectedCoin.name,
      coinSymbol: selectedCoin.symbol,
      targetPrice: parseFloat(targetPrice),
      alertType,
      isActive: true,
    });

    resetForm();
    setShowModal(false);
    showAlert('Başarılı', `${selectedCoin.name} için uyarı oluşturuldu!`);
  };

  const resetForm = () => {
    setSelectedCoin(null);
    setTargetPrice('');
    setAlertType('above');
    setSearchCoin('');
    setShowCoinList(false);
  };

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(searchCoin.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchCoin.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔔 Fiyat Uyarıları</Text>
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
        <Text style={styles.headerTitle}>🔔 Fiyat Uyarıları</Text>
        <Text style={styles.headerSubtitle}>Fiyat hedeflerine ulaştığında bildirim al</Text>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>⚠️ Bu bilgiler yatırım tavsiyesi değildir.</Text>
      </View>

      {/* Add Alert Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.addButtonText}>+ Yeni Uyarı Ekle</Text>
      </TouchableOpacity>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Toplam Uyarı</Text>
          <Text style={styles.statValue}>{alerts.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Aktif</Text>
          <Text style={[styles.statValue, styles.positive]}>
            {alerts.filter(a => a.isActive).length}
          </Text>
        </View>
      </View>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Henüz uyarı yok</Text>
          <Text style={styles.emptySubtext}>Fiyat uyarısı ekleyerek başla!</Text>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📢 Aktif Uyarılar</Text>
          {alerts.map(alert => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertCardTop}>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertCoin}>{alert.coinName}</Text>
                  <Text style={styles.alertSymbol}>{alert.coinSymbol}</Text>
                </View>
                <View style={styles.alertTarget}>
                  <Text style={styles.alertTypeLabel}>
                    {alert.alertType === 'above' ? '📈 Yüksek' : '📉 Düşük'}
                  </Text>
                  <Text style={styles.alertPrice}>${alert.targetPrice.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.alertCardBottom}>
                <TouchableOpacity 
                  style={[styles.toggleBtn, !alert.isActive && styles.toggleBtnInactive]}
                  onPress={() => toggleAlert(alert.id)}
                >
                  <Text style={styles.toggleBtnText}>
                    {alert.isActive ? '✓ Aktif' : '✕ Pasif'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={() => {
                    showAlert(
                      'Uyarıyı Sil',
                      `${alert.coinName} uyarısını silmek istediğinizden emin misiniz?`,
                      [
                        { text: 'İptal', style: 'cancel' },
                        { 
                          text: 'Sil', 
                          style: 'destructive',
                          onPress: () => removeAlert(alert.id)
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.deleteBtnText}>🗑️ Sil</Text>
                </TouchableOpacity>
              </View>

              {alert.lastNotified && (
                <Text style={styles.lastNotified}>
                  Son bildirim: {new Date(alert.lastNotified).toLocaleString('tr-TR')}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.spacer} />

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Uyarı Ekle</Text>
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
                      }}
                    >
                      <Text style={styles.coinListItemText}>{item.name} ({item.symbol})</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}

            {/* Alert Type */}
            <Text style={styles.label}>Uyarı Türü</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity 
                style={[styles.typeBtn, alertType === 'above' && styles.typeBtnActive]}
                onPress={() => setAlertType('above')}
              >
                <Text style={styles.typeBtnText}>📈 Yükseltildiğinde</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeBtn, alertType === 'below' && styles.typeBtnActive]}
                onPress={() => setAlertType('below')}
              >
                <Text style={styles.typeBtnText}>📉 Düştüğünde</Text>
              </TouchableOpacity>
            </View>

            {/* Target Price */}
            <Text style={styles.label}>Hedef Fiyat ($)</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Örn: 45000"
              placeholderTextColor="#999"
              value={targetPrice}
              onChangeText={setTargetPrice}
              keyboardType="decimal-pad"
            />

            {/* Create Button */}
            <TouchableOpacity 
              style={styles.createBtn}
              onPress={handleAddAlert}
            >
              <Text style={styles.createBtnText}>Uyarı Oluştur</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    fontWeight: '600',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#627EEA',
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
  alertCard: {
    backgroundColor: 'rgba(98, 126, 234, 0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(98, 126, 234, 0.15)',
  },
  alertCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertInfo: {
    flex: 1,
  },
  alertCoin: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 2,
  },
  alertSymbol: {
    fontSize: 12,
    opacity: 0.6,
  },
  alertTarget: {
    alignItems: 'flex-end',
  },
  alertTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#627EEA',
    marginBottom: 2,
  },
  alertPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F7931A',
  },
  alertCardBottom: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#00D084',
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleBtnInactive: {
    backgroundColor: '#FF6B6B',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  lastNotified: {
    fontSize: 11,
    opacity: 0.5,
    fontStyle: 'italic',
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
    maxHeight: '80%',
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
  priceInput: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(98, 126, 234, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#627EEA',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
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
});

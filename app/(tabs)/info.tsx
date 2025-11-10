import { StyleSheet, ScrollView, View as RNView } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function InfoScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Kripto Bilgi Merkezi</Text>
        <Text style={styles.headerSubtitle}>Blockchain ve kripto para eğitimi</Text>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>⚠️ Bu bilgiler yatırım tavsiyesi değildir.</Text>
      </View>

      <RNView style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>💰</Text>
          <Text style={styles.sectionTitle}>Kripto Para Nedir?</Text>
        </View>
        <Text style={styles.sectionText}>
          Kripto para veya sanal para, internet ortamında kullanılan, kriptografik algoritmalarla şifrelenmiş ve merkezi bir otorite tarafından kontrol edilmeyen dijital para birimidir.
        </Text>
      </RNView>

      <RNView style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🔗</Text>
          <Text style={styles.sectionTitle}>Blockchain Nedir?</Text>
        </View>
        <Text style={styles.sectionText}>
          Blockchain, kripto paraların temel teknolojisidir. Bloklar zinciri şeklinde birbirine bağlı veri yapısı olup, her işlemi kayıt altına alır ve güvenlik sağlar.
        </Text>
      </RNView>

      <RNView style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>📊</Text>
          <Text style={styles.sectionTitle}>Bitcoin Nedir?</Text>
        </View>
        <Text style={styles.sectionText}>
          Bitcoin, 2009 yılında Satoshi Nakamoto tarafından yaratılan ilk ve en ünlü kripto paradır. Merkezi bir kontrol yok, tamamen eşler arası (peer-to-peer) sisteme dayalıdır.
        </Text>
      </RNView>

      <RNView style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🌐</Text>
          <Text style={styles.sectionTitle}>Ethereum Nedir?</Text>
        </View>
        <Text style={styles.sectionText}>
          Ethereum, blockchain teknolojisini daha ileri taşıyan, akıllı kontratlar (smart contracts) yazabilen ve çalıştırabilen bir platformdur. Ether (ETH) para birimidir.
        </Text>
      </RNView>

      <RNView style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>⚠️</Text>
          <Text style={styles.sectionTitle}>Yatırım Riskleri</Text>
        </View>
        <Text style={styles.bulletText}>• Yüksek volatilite: Kripto para fiyatları çok hızlı değişebilir</Text>
        <Text style={styles.bulletText}>• Siber saldırılar: Cüzdanlar hacklenebilir</Text>
        <Text style={styles.bulletText}>• Düzenleme belirsizliği: Yasalar her zaman net değildir</Text>
        <Text style={styles.bulletText}>• Hile ve Dolandırıcılık: Ponzi şemaları ve sahte projeler mevcuttur</Text>
      </RNView>

      <RNView style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>✅</Text>
          <Text style={styles.sectionTitle}>Güvenli Kullanım İpuçları</Text>
        </View>
        <Text style={styles.bulletText}>• Güçlü şifreler kullanın</Text>
        <Text style={styles.bulletText}>• 2FA (Two-Factor Authentication) etkinleştirin</Text>
        <Text style={styles.bulletText}>• Soğuk cüzdan (cold wallet) kullanmayı düşünün</Text>
        <Text style={styles.bulletText}>• Yalnızca ihtiyacınız kadarını yatırım yapın</Text>
        <Text style={styles.bulletText}>• Bilinmeyen bağlantıları tıklamayın</Text>
      </RNView>

      <RNView style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>📚</Text>
          <Text style={styles.sectionTitle}>Öğrenme Kaynakları</Text>
        </View>
        <Text style={styles.bulletText}>• CoinGecko: Kripto para fiyatları ve bilgileri</Text>
        <Text style={styles.bulletText}>• Ethereum.org: Ethereum hakkında kapsamlı bilgi</Text>
        <Text style={styles.bulletText}>• Bitcoin.org: Bitcoin rehberleri</Text>
      </RNView>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(33, 150, 243, 0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
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
  section: {
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(33, 150, 243, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    flex: 1,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.85,
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 6,
  },
  footer: {
    height: 20,
  },
});

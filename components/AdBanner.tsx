import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

// Only import on native platforms
let BannerAd: any = null;
let BannerAdSize: any = null;

if (Platform.OS !== 'web') {
  try {
    const ads = require('react-native-google-mobile-ads');
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
  } catch (e) {
    console.log('AdMob not available');
  }
}

export default function AdBanner() {
  // Don't show ads on web
  if (Platform.OS === 'web') {
    return null;
  }

  // Don't render if ads not available
  if (!BannerAd || !BannerAdSize) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId="ca-app-pub-9613759307120698/4102399714"
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    backgroundColor: 'transparent',
  },
});


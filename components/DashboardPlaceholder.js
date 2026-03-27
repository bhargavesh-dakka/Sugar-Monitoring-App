import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function DashboardPlaceholder({ onReplay }) {
  return (
    <View style={styles.dashboard}>
      <StatusBar style="dark" />
      <Text style={styles.dashboardEyebrow}>Sugar Monitoring App</Text>
      <Text style={styles.dashboardTitle}>Opening scene added</Text>
      <Text style={styles.dashboardText}>
        This placeholder home keeps the app testable on web today while leaving the rest of
        the product ready to be built in React Native screens.
      </Text>
      <Pressable style={styles.secondaryButton} onPress={onReplay}>
        <Text style={styles.secondaryButtonText}>Replay intro</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dashboard: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f8fafc',
  },
  dashboardEyebrow: {
    color: '#15803d',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  dashboardTitle: {
    marginTop: 10,
    color: '#0f172a',
    fontSize: 34,
    fontWeight: '800',
  },
  dashboardText: {
    marginTop: 14,
    color: '#475569',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 560,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    marginTop: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#0f172a',
  },
  secondaryButtonText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
});

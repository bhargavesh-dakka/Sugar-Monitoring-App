import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function WeeklyReminderCard({ onLogNow, onLater }) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="notifications-outline" size={14} color="#ffffff" />
        </View>
        <Text style={styles.title}>Weekly reminder</Text>
      </View>

      <Text style={styles.message}>Time to check and log your glucose level for this week.</Text>

      <View style={styles.actions}>
        <Pressable style={styles.secondaryAction} onPress={onLater}>
          <Text style={styles.secondaryText}>Later</Text>
        </Pressable>
        <Pressable style={styles.primaryAction} onPress={onLogNow}>
          <Text style={styles.primaryText}>Log now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
  },
  title: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  message: {
    color: '#14532d',
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  secondaryAction: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#86efac',
    backgroundColor: '#ffffff',
  },
  secondaryText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '700',
  },
  primaryAction: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#16a34a',
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});

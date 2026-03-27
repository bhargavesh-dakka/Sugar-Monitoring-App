import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

export function NativeIntroFallback() {
  const pulse = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [pulse, spin]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.nativeScene}>
      <Animated.View
        style={[
          styles.orbitRing,
          {
            transform: [{ rotate }],
            opacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.nativeBadge,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Image
          source={require('../assets/Designer.png')}
          style={styles.nativeBadgeLogo}
          resizeMode="contain"
        />
      </Animated.View>
      <Text style={styles.nativeFallbackTitle}>Sugar Monitoring App</Text>
      <Text style={styles.nativeFallbackText}>
        Preparing your local glucose workspace...
      </Text>
      <ActivityIndicator size="small" color="#6ee7b7" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  nativeScene: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#081018',
  },
  orbitRing: {
    position: 'absolute',
    width: 164,
    height: 164,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: 'rgba(110,231,183,0.15)',
    borderTopColor: '#6ee7b7',
    borderRightColor: 'rgba(52,211,153,0.7)',
  },
  nativeBadge: {
    width: 120,
    height: 120,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(4, 16, 12, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(110,231,183,0.35)',
    shadowColor: '#16a34a',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  nativeBadgeLogo: {
    width: 88,
    height: 88,
  },
  nativeFallbackTitle: {
    marginTop: 28,
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  nativeFallbackText: {
    marginTop: 12,
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
  loader: {
    marginTop: 14,
  },
});

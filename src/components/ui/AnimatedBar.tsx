import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';

type AnimatedBarProps = {
  label: string;
  valueText: string;
  percent: number;
  color: string;
};

export default function AnimatedBar({ label, valueText, percent, color }: AnimatedBarProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const visualPercent = Math.max(0, Math.min(100, percent));
  const progressPercent = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  useEffect(() => {
    // width se anima sin native driver; el resto de las animaciones sí puede usar native.
    Animated.timing(progress, {
      toValue: visualPercent,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, visualPercent]);

  return (
    // Este componente presenta propiedades recibidas dentro de una zona; no es prop drilling entre zonas.
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueText}>{valueText}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: color, width: progressPercent },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  label: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  valueText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  track: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: radius.lg,
    height: 8,
  },
});

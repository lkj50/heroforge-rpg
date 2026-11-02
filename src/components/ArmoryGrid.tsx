import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { clearEquipment, toggleEquipItem } from '../store/slices/inventorySlice';
import {
  selectCatalog,
  selectEffectiveSpeed,
  selectEquippedIds,
  selectIsOverencumbered,
  selectMaxWeightCapacity,
  selectTotalStats,
  selectTotalWeight,
  selectWeightStatus,
} from '../store/selectors';
import { colors, radius, spacing } from '../theme';

export default function ArmoryGrid() {
  const dispatch = useAppDispatch();
  const catalog = useAppSelector(selectCatalog);
  const equippedIds = useAppSelector(selectEquippedIds);
  const totalWeight = useAppSelector(selectTotalWeight);
  const maxWeightCapacity = useAppSelector(selectMaxWeightCapacity);
  const weightStatus = useAppSelector(selectWeightStatus);
  const isOverencumbered = useAppSelector(selectIsOverencumbered);
  const totalStats = useAppSelector(selectTotalStats);
  const effectiveSpeed = useAppSelector(selectEffectiveSpeed);
  const pulseOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (isOverencumbered) {
      pulseOpacity.setValue(1);
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.5,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    } else {
      pulseOpacity.stopAnimation();
      pulseOpacity.setValue(1);
    }

    return () => {
      animation?.stop();
    };
  }, [isOverencumbered, pulseOpacity]);

  const weightColor =
    weightStatus.level === 'ok'
      ? colors.success
      : weightStatus.level === 'warning'
        ? colors.warning
        : colors.danger;

  const getBonusChips = (item: (typeof catalog)[number]) => [
    { value: item.bonusStr, label: 'STR' },
    { value: item.bonusAgi, label: 'AGI' },
    { value: item.bonusInt, label: 'INT' },
  ].filter((bonus) => bonus.value !== 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Zona C · Armería & Mochila</Text>
        <Text style={[styles.loadIndicator, { color: weightColor }]}>
          ⚖️ {totalWeight} / {maxWeightCapacity} kg
        </Text>
      </View>

      {isOverencumbered && (
        <Animated.View style={[styles.overloadBanner, { opacity: pulseOpacity }]}>
          <Text style={styles.overloadTitle}>⚠️ ¡SOBRECARGADO! (-50% Velocidad)</Text>
          <Text style={styles.overloadSpeed}>
            Velocidad: {totalStats.agi} → {effectiveSpeed}
          </Text>
        </Animated.View>
      )}

      <View style={styles.grid}>
        {catalog.map((item) => {
          const isEquipped = equippedIds.includes(item.id);
          const bonusChips = getBonusChips(item);

          return (
            <Pressable
              key={item.id}
              onPress={() => dispatch(toggleEquipItem(item.id))}
              style={({ pressed }) => [
                styles.itemCard,
                isEquipped && styles.equippedCard,
                pressed && styles.pressedCard,
              ]}
            >
              {isEquipped && (
                <View style={styles.equippedBadge}>
                  <Text style={styles.equippedBadgeText}>EQUIPADO</Text>
                </View>
              )}
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <Text style={styles.itemName}>{item.name}</Text>

              {bonusChips.length > 0 && (
                <View style={styles.chips}>
                  {bonusChips.map((bonus) => (
                    <View
                      key={bonus.label}
                      style={[
                        styles.bonusChip,
                        {
                          backgroundColor:
                            bonus.value > 0
                              ? 'rgba(34,197,94,0.18)'
                              : 'rgba(239,68,68,0.18)',
                          borderColor: bonus.value > 0 ? colors.success : colors.danger,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.bonusText,
                          { color: bonus.value > 0 ? colors.success : colors.danger },
                        ]}
                      >
                        {bonus.value > 0 ? '+' : ''}
                        {bonus.value} {bonus.label}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.itemWeight}>⚖️ {item.weight} kg</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => dispatch(clearEquipment())}
        style={({ pressed }) => [
          styles.clearButton,
          equippedIds.length === 0 && styles.clearButtonInactive,
          pressed && styles.pressedCard,
        ]}
      >
        <Text style={styles.clearButtonText}>🎒 Desequipar todo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  loadIndicator: {
    fontSize: 12,
    fontWeight: '800',
  },
  overloadBanner: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: colors.danger,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  overloadTitle: {
    color: colors.danger,
    fontWeight: '800',
  },
  overloadSpeed: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
    marginTop: spacing.md,
  },
  itemCard: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 150,
    padding: spacing.md,
    position: 'relative',
    width: '48%',
  },
  equippedCard: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  equippedBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
  },
  equippedBadgeText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '900',
  },
  itemIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  itemName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    minHeight: 34,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  bonusChip: {
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  bonusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  itemWeight: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  pressedCard: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 42,
  },
  clearButtonInactive: {
    opacity: 0.4,
  },
  clearButtonText: {
    color: colors.text,
    fontWeight: '800',
  },
});

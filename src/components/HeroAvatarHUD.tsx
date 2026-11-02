import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../store';
import {
  selectCombatPower,
  selectEquippedWeapon,
  selectHeroVisualClass,
  selectHpInfo,
  selectManaInfo,
  selectTotalWeight,
  selectMaxWeightCapacity,
  selectWeightStatus,
} from '../store/selectors';
import { colors, radius, spacing } from '../theme';
import AnimatedBar from './ui/AnimatedBar';

type HpCondition = 'healthy' | 'wounded' | 'defeated';
type WeightLevel = 'ok' | 'warning' | 'overloaded';

const HP_COLORS: Record<HpCondition, string> = {
  healthy: colors.success,
  wounded: colors.warning,
  defeated: colors.danger,
};

const HP_EXPRESSION: Record<HpCondition, string> = {
  healthy: '😎',
  wounded: '😣',
  defeated: '💀',
};

const WEIGHT_COLORS: Record<WeightLevel, string> = {
  ok: colors.success,
  warning: colors.warning,
  overloaded: colors.danger,
};

export default function HeroAvatarHUD() {
  const heroClass = useAppSelector(selectHeroVisualClass);
  const combatPower = useAppSelector(selectCombatPower);
  const equippedWeapon = useAppSelector(selectEquippedWeapon);
  const hpInfo = useAppSelector(selectHpInfo);
  const manaInfo = useAppSelector(selectManaInfo);
  const totalWeight = useAppSelector(selectTotalWeight);
  const maxWeightCapacity = useAppSelector(selectMaxWeightCapacity);
  const weightStatus = useAppSelector(selectWeightStatus);
  const avatarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    avatarScale.setValue(1);
    Animated.sequence([
      Animated.timing(avatarScale, {
        toValue: 1.15,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(avatarScale, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [avatarScale, heroClass.name]);

  const isDefeated = hpInfo.condition === 'defeated';
  const auraColor = isDefeated ? colors.textMuted : heroClass.auraColor;
  const avatarEmoji = isDefeated ? '💀' : heroClass.emoji;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: avatarScale }] }]}>
          <View
            style={[
              styles.avatar,
              {
                borderColor: auraColor,
                shadowColor: auraColor,
              },
            ]}
          >
            <Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
            <View style={styles.weaponBubble}>
              <Text style={styles.bubbleText}>{equippedWeapon?.icon ?? '✊'}</Text>
            </View>
            <View style={styles.expressionBubble}>
              <Text style={styles.bubbleText}>
                {HP_EXPRESSION[hpInfo.condition as HpCondition]}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.info}>
          <View style={[styles.classBadge, { backgroundColor: auraColor }]}>
            <Text style={styles.classText}>{heroClass.name}</Text>
          </View>

          <View style={styles.powerRow}>
            <Text style={styles.powerText}>⚔️ Poder {combatPower.final}</Text>
            {combatPower.penaltyApplied && (
              <>
                <Text style={styles.rawPower}>{combatPower.raw}</Text>
                <Text style={styles.penalty}>-30%</Text>
              </>
            )}
          </View>

          <AnimatedBar
            label="❤️ HP"
            valueText={`${hpInfo.current}/${hpInfo.max}`}
            percent={hpInfo.percent}
            color={HP_COLORS[hpInfo.condition as HpCondition]}
          />
          <AnimatedBar
            label="🔮 Maná"
            valueText={`${manaInfo.maxMana}`}
            percent={manaInfo.percent}
            color={colors.mana}
          />
          <AnimatedBar
            label="⚖️ Carga"
            valueText={`${totalWeight}/${maxWeightCapacity} kg`}
            percent={weightStatus.percent}
            color={WEIGHT_COLORS[weightStatus.level as WeightLevel]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 150,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatarWrapper: {
    height: 84,
    width: 84,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 42,
    borderWidth: 3,
    height: 84,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    width: 84,
  },
  avatarEmoji: {
    fontSize: 44,
  },
  weaponBubble: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    top: -4,
    width: 28,
  },
  expressionBubble: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    bottom: -3,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    width: 28,
  },
  bubbleText: {
    fontSize: 15,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  classBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  classText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  powerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  powerText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  rawPower: {
    color: colors.textMuted,
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  penalty: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '800',
  },
});

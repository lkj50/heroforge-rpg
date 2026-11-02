import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import {
  incrementStat,
  decrementStat,
  resetStats,
  applyBuildPreset,
  type StatKey,
  type BuildPreset,
} from '../store/slices/statsSlice';
import { selectStats, selectTotalStats } from '../store/selectors';
import { colors, radius, spacing } from '../theme';

const MAX_STAT_DISPLAY = 20;

const STAT_CONFIG: Array<{
  key: StatKey;
  label: string;
  emoji: string;
  color: string;
}> = [
  { key: 'str', label: 'Fuerza', emoji: '💪', color: colors.danger },
  { key: 'agi', label: 'Agilidad', emoji: '🏃', color: colors.success },
  { key: 'int', label: 'Inteligencia', emoji: '🧠', color: colors.mana },
];

const BUILD_PRESETS: Array<{ preset: BuildPreset; label: string }> = [
  { preset: 'WARRIOR', label: '⚔️ Guerrero' },
  { preset: 'MAGE', label: '🔮 Mago' },
  { preset: 'ROGUE', label: '🗡️ Pícaro' },
  { preset: 'TANK', label: '🛡️ Tanque' },
];

export default function StatsControlPanel() {
  const stats = useAppSelector(selectStats);
  const totalStats = useAppSelector(selectTotalStats);
  const dispatch = useAppDispatch();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Zona B · Entrenamiento</Text>
        <View
          style={[
            styles.pointsBadge,
            { backgroundColor: stats.availablePoints > 0 ? colors.primary : colors.surfaceAlt },
          ]}
        >
          <Text style={styles.pointsText}>⭐ {stats.availablePoints} pts</Text>
        </View>
      </View>

      <View style={styles.statList}>
        {STAT_CONFIG.map((stat) => {
          const baseValue = stats[stat.key];
          const totalValue = totalStats[stat.key];
          const barPercent = Math.min(100, Math.round((baseValue / MAX_STAT_DISPLAY) * 100));
          const decrementInactive = baseValue <= 1;
          const incrementInactive = stats.availablePoints <= 0;

          return (
            <View key={stat.key} style={styles.statRow}>
              <View style={styles.statMain}>
                <View style={styles.statInfo}>
                  <Text style={styles.statName}>
                    {stat.emoji} {stat.label}{'  '}
                    <Text style={styles.baseValue}>{baseValue}</Text>
                    {totalValue !== baseValue && (
                      <Text style={styles.totalValue}>  total {totalValue}</Text>
                    )}
                  </Text>
                </View>

                <View style={styles.statControls}>
                  {/* Sin disabled: así los intentos inválidos siguen despachando y aparecen en el log.
                      La validación real vive en el reducer. */}
                  <Pressable
                    onPress={() => dispatch(decrementStat(stat.key))}
                    style={({ pressed }) => [
                      styles.controlButton,
                      decrementInactive && styles.inactiveButton,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text style={styles.controlText}>−</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => dispatch(incrementStat(stat.key))}
                    style={({ pressed }) => [
                      styles.controlButton,
                      incrementInactive && styles.inactiveButton,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text style={styles.controlText}>+</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.levelTrack}>
                <View
                  style={[
                    styles.levelBar,
                    { backgroundColor: stat.color, width: `${barPercent}%` },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Presets de clase</Text>
      <View style={styles.presets}>
        {BUILD_PRESETS.map(({ preset, label }) => (
          <Pressable
            key={preset}
            onPress={() => dispatch(applyBuildPreset(preset))}
            style={({ pressed }) => [
              styles.presetButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={styles.presetText}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => dispatch(resetStats())}
        style={({ pressed }) => [
          styles.resetButton,
          pressed && styles.pressedButton,
        ]}
      >
        <Text style={styles.resetText}>🧪 Poción de Reseteo</Text>
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
  },
  pointsBadge: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pointsText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  statList: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  statRow: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  statMain: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statInfo: {
    flex: 1,
  },
  statName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  baseValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  totalValue: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
  },
  statControls: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  inactiveButton: {
    opacity: 0.4,
  },
  controlText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  levelTrack: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    height: 6,
    overflow: 'hidden',
  },
  levelBar: {
    borderRadius: radius.sm,
    height: '100%',
  },
  pressedButton: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  presets: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  presetButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  presetText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    height: 38,
    justifyContent: 'center',
  },
  resetText: {
    color: colors.text,
    fontWeight: '800',
  },
});

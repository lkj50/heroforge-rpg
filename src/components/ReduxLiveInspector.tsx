import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { clearLog, type LogEntry } from '../store/slices/actionLogSlice';
import { healHero } from '../store/slices/statsSlice';
import { attackBoss } from '../store/thunks';
import { selectCombatPower, selectHpInfo } from '../store/selectors';
import { colors, radius, spacing } from '../theme';
import AnimatedBar from './ui/AnimatedBar';

const BOSS_NAME = 'Dragón del Abismo';
const BOSS_EMOJI = '🐉';
const BOSS_MAX_HP = 500;

function LogRow({ entry, isRecent }: { entry: LogEntry; isRecent: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  const date = new Date(entry.timestamp);
  const hour = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  const typeColor = entry.type.startsWith('stats/')
    ? colors.mana
    : entry.type.startsWith('inventory/')
      ? colors.warning
      : colors.textMuted;

  return (
    <Animated.View style={{ opacity }}>
      <Text
        numberOfLines={1}
        style={[
          styles.logLine,
          isRecent ? styles.recentLogLine : styles.oldLogLine,
        ]}
      >
        <Text style={styles.logMuted}>{hour} </Text>
        <Text style={{ color: typeColor }}>[{entry.type}]</Text>
        <Text> → {entry.payloadLabel}</Text>
      </Text>
    </Animated.View>
  );
}

export default function ReduxLiveInspector() {
  const dispatch = useAppDispatch();
  const combatPower = useAppSelector(selectCombatPower);
  const hpInfo = useAppSelector(selectHpInfo);
  const entries = useAppSelector((state) => state.actionLog.entries);
  // Estado local a propósito: la vida del jefe solo la necesita esta zona; la vida
  // del héroe sí vive en Redux porque el HUD y esta zona deben compartirla.
  const [bossHp, setBossHp] = useState(BOSS_MAX_HP);
  const [lastResult, setLastResult] = useState('');
  const resultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resultTimer.current) {
        clearTimeout(resultTimer.current);
      }
    };
  }, []);

  const defeated = hpInfo.condition === 'defeated';
  const bossPercent = Math.round((bossHp / BOSS_MAX_HP) * 100);

  const handleAttack = () => {
    if (defeated || bossHp === 0) {
      return;
    }

    const damage = dispatch(attackBoss());
    const actualDamage = Math.min(bossHp, damage);
    setBossHp((currentHp) => Math.max(0, currentHp - damage));
    setLastResult(`Golpeaste por ${actualDamage}`);

    if (resultTimer.current) {
      clearTimeout(resultTimer.current);
    }
    resultTimer.current = setTimeout(() => setLastResult(''), 1800);
  };

  const handleHeal = () => {
    dispatch(healHero());
    setLastResult('');
  };

  const handleNewBoss = () => {
    setBossHp(BOSS_MAX_HP);
    setLastResult('');
  };

  return (
    <View style={styles.card}>
      <View style={styles.arena}>
        <View style={styles.bossRow}>
          <Text style={styles.bossEmoji}>{BOSS_EMOJI}</Text>
          <View style={styles.bossInfo}>
            <Text style={styles.bossName}>{BOSS_NAME}</Text>
            <AnimatedBar
              label=""
              valueText={`${bossHp}/${BOSS_MAX_HP}`}
              percent={bossPercent}
              color={colors.danger}
            />
          </View>
        </View>

        <View style={styles.secondRow}>
          <View style={styles.statusColumn}>
            <View style={styles.powerRow}>
              <Text style={styles.powerText}>Tu poder: {combatPower.final}</Text>
              {combatPower.penaltyApplied && (
                <Text style={styles.penaltyText}>(sobrecargado)</Text>
              )}
            </View>
            {defeated && bossHp > 0 && (
              <Text style={styles.defeatedText}>💀 Has caído. Cúrate para seguir.</Text>
            )}
            {lastResult !== '' && !defeated && bossHp > 0 && (
              <Text style={styles.resultText}>{lastResult}</Text>
            )}
            {bossHp === 0 && (
              <Text style={styles.victoryText}>🏆 ¡Jefe derrotado!</Text>
            )}
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={handleAttack}
              style={({ pressed }) => [
                styles.attackButton,
                (defeated || bossHp === 0) && styles.inactiveButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.actionButtonText}>⚔️ Atacar</Text>
            </Pressable>
            <Pressable
              onPress={handleHeal}
              style={({ pressed }) => [
                styles.healButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.actionButtonText}>❤️ Curar</Text>
            </Pressable>
            {bossHp === 0 && (
            <Pressable
              onPress={handleNewBoss}
              style={({ pressed }) => [
                styles.newBossButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.newBossText}>Nuevo jefe</Text>
            </Pressable>
            )}
          </View>
        </View>
      </View>

      <View style={styles.console}>
        <View style={styles.consoleHeader}>
          <Text style={styles.consoleTitle}>📡 Redux Live · últimas 5 acciones</Text>
          <Pressable
            onPress={() => dispatch(clearLog())}
            style={({ pressed }) => pressed && styles.pressedButton}
          >
            <Text style={styles.clearText}>Limpiar</Text>
          </Pressable>
        </View>

        <View style={styles.consoleBody}>
          {entries.length === 0 ? (
            <Text style={styles.emptyText}>Esperando acciones...</Text>
          ) : (
            entries.map((entry, index) => (
              <LogRow key={entry.id} entry={entry} isRecent={index === 0} />
            ))
          )}
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
    padding: spacing.md,
  },
  arena: {
    marginBottom: spacing.sm,
  },
  bossRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bossEmoji: {
    fontSize: 28,
  },
  bossInfo: {
    flex: 1,
  },
  bossName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  powerRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  secondRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  statusColumn: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  powerText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  penaltyText: {
    color: colors.danger,
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  attackButton: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    justifyContent: 'center',
    height: 34,
    minWidth: 96,
    paddingHorizontal: 14,
  },
  healButton: {
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: radius.sm,
    justifyContent: 'center',
    height: 34,
    minWidth: 96,
    paddingHorizontal: 14,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  inactiveButton: {
    opacity: 0.4,
  },
  pressedButton: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  defeatedText: {
    color: colors.danger,
    fontSize: 11,
    marginTop: 2,
  },
  resultText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  victoryText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '800',
  },
  newBossButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  newBossText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  console: {
    marginTop: spacing.sm,
  },
  consoleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  consoleTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  clearText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  consoleBody: {
    backgroundColor: '#020617',
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginTop: spacing.xs,
    padding: spacing.sm,
  },
  logLine: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 11,
    lineHeight: 15,
  },
  recentLogLine: {
    color: colors.text,
    fontWeight: '700',
  },
  oldLogLine: {
    color: colors.textMuted,
  },
  logMuted: {
    color: colors.textMuted,
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 11,
  },
});

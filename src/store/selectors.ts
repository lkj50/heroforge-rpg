// Estos valores derivan de los slices y no se almacenan duplicados: así solo existe una fuente de verdad
// y los datos calculados siempre se mantienen sincronizados, evitando contradicciones.
import { createSelector } from '@reduxjs/toolkit';
import { MAX_HP } from './slices/statsSlice';
import type { RootState } from './index';

// Lee stats sin transformarlo.
export const selectStats = (state: RootState) => state.stats;

// Lee el catálogo sin transformarlo.
export const selectCatalog = (state: RootState) => state.inventory.catalog;

// Lee los IDs equipados sin transformarlo.
export const selectEquippedIds = (state: RootState) => state.inventory.equippedIds;

// Lee los puntos de vida actuales sin transformarlos.
export const selectCurrentHp = (state: RootState) => state.stats.currentHp;

// Deriva del catálogo y los IDs equipados los objetos de ítems actualmente equipados.
export const selectEquippedItems = createSelector(
  [selectCatalog, selectEquippedIds],
  (catalog, equippedIds) => catalog.filter((item) => equippedIds.includes(item.id)),
);

// Deriva el primer arma equipada de los ítems equipados.
export const selectEquippedWeapon = createSelector(
  [selectEquippedItems],
  (equippedItems) => equippedItems.find((item) => item.category === 'weapon') ?? null,
);

// Deriva los atributos totales sumando stats base y bonos de los ítems equipados.
export const selectTotalStats = createSelector(
  [selectStats, selectEquippedItems],
  (stats, equippedItems) => {
    const bonuses = equippedItems.reduce(
      (total, item) => ({
        str: total.str + item.bonusStr,
        agi: total.agi + item.bonusAgi,
        int: total.int + item.bonusInt,
      }),
      { str: 0, agi: 0, int: 0 },
    );

    return {
      str: Math.max(0, stats.str + bonuses.str),
      agi: Math.max(0, stats.agi + bonuses.agi),
      int: Math.max(0, stats.int + bonuses.int),
    };
  },
);

// Deriva del peso de cada ítem equipado el peso total transportado.
export const selectTotalWeight = createSelector(
  [selectEquippedItems],
  (equippedItems) => equippedItems.reduce((total, item) => total + item.weight, 0),
);

// Deriva la capacidad máxima de carga usando la fuerza total.
export const selectMaxWeightCapacity = createSelector(
  [selectTotalStats],
  (totalStats) => 10 + totalStats.str * 2,
);

// Deriva si el peso equipado supera la capacidad máxima.
export const selectIsOverencumbered = createSelector(
  [selectTotalWeight, selectMaxWeightCapacity],
  (totalWeight, maxWeightCapacity) => totalWeight > maxWeightCapacity,
);

// Deriva el porcentaje y nivel visual de peso desde peso total y capacidad máxima.
export const selectWeightStatus = createSelector(
  [selectTotalWeight, selectMaxWeightCapacity],
  (totalWeight, maxWeightCapacity) => {
    const percent = Math.round((totalWeight / maxWeightCapacity) * 100);
    const level = percent < 70 ? 'ok' : percent <= 100 ? 'warning' : 'overloaded';
    return { percent, level };
  },
);

// Deriva la agilidad efectiva, reduciéndola un 50% al estar sobrecargado.
export const selectEffectiveSpeed = createSelector(
  [selectTotalStats, selectIsOverencumbered],
  (totalStats, isOverencumbered) =>
    isOverencumbered ? Math.round(totalStats.agi * 0.5) : totalStats.agi,
);

// Deriva el poder de combate bruto y final, indicando si hubo penalización por sobrecarga.
export const selectCombatPower = createSelector(
  [selectTotalStats, selectIsOverencumbered],
  (totalStats, isOverencumbered) => {
    const raw = totalStats.str * 3 + totalStats.agi * 2 + totalStats.int * 3;
    const finalPower = isOverencumbered ? Math.round(raw * 0.7) : raw;
    return { raw, final: finalPower, penaltyApplied: isOverencumbered };
  },
);

// Deriva el maná máximo y su porcentaje de referencia desde la inteligencia total.
export const selectManaInfo = createSelector(
  [selectTotalStats],
  (totalStats) => {
    const maxMana = totalStats.int * 10;
    const percent = Math.min(100, Math.round((maxMana / 300) * 100));
    return { maxMana, percent };
  },
);

// Deriva la información y condición visual de los puntos de vida.
export const selectHpInfo = createSelector(
  [selectCurrentHp],
  (current) => {
    const percent = Math.round((current / MAX_HP) * 100);
    const condition = current === 0 ? 'defeated' : percent > 60 ? 'healthy' : 'wounded';
    return { current, max: MAX_HP, percent, condition };
  },
);

// Deriva la clase visual combinando estadísticas, peso y reglas de dominancia.
export const selectHeroVisualClass = createSelector(
  [selectTotalStats, selectTotalWeight],
  (totalStats, totalWeight) => {
    if (totalStats.str >= 15 && totalWeight >= 25) {
      return { name: 'Tanque Pesado', emoji: '🛡️', auraColor: '#f59e0b' };
    }

    const { str, int, agi } = totalStats;
    let dominant: 'str' | 'int' | 'agi' = 'str';

    if (int > str && int >= agi) {
      dominant = 'int';
    } else if (agi > str && agi > int) {
      dominant = 'agi';
    }

    if (totalStats[dominant] >= 15) {
      if (dominant === 'str') {
        return { name: 'Guerrero Berserker', emoji: '🪓', auraColor: '#ef4444' };
      }
      if (dominant === 'int') {
        return { name: 'Archimago', emoji: '🧙', auraColor: '#3b82f6' };
      }
      return { name: 'Asesino Sombrío', emoji: '🥷', auraColor: '#10b981' };
    }

    return { name: 'Aldeano', emoji: '🧑‍🌾', auraColor: '#94a3b8' };
  },
);

// Versión memoizada del selector de referencia del profesor, dividida en selectores pequeños y reutilizables.
export const selectHeroComputedStatus = createSelector(
  [
    selectTotalStats,
    selectTotalWeight,
    selectMaxWeightCapacity,
    selectIsOverencumbered,
    selectHeroVisualClass,
    selectCombatPower,
    selectHpInfo,
  ],
  (
    totalStats,
    currentWeight,
    maxWeightCapacity,
    isOverloaded,
    heroClass,
    combatPower,
    hpInfo,
  ) => ({
    totalStr: totalStats.str,
    totalAgi: totalStats.agi,
    totalInt: totalStats.int,
    currentWeight,
    maxWeightCapacity,
    isOverloaded,
    heroClass: heroClass.name,
    auraColor: heroClass.auraColor,
    combatPower: combatPower.final,
    isDefeated: hpInfo.condition === 'defeated',
  }),
);

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const MAX_HP = 100;

export type StatKey = 'str' | 'agi' | 'int';

export const BUILD_PRESETS = {
  WARRIOR: { str: 16, agi: 8, int: 6 },
  MAGE: { str: 5, agi: 7, int: 18 },
  ROGUE: { str: 6, agi: 17, int: 7 },
  TANK: { str: 14, agi: 5, int: 11 },
} as const;

export type BuildPreset = keyof typeof BUILD_PRESETS;

const initialState = {
  availablePoints: 15,
  str: 5,
  agi: 5,
  int: 5,
  currentHp: 100,
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    incrementStat(state, action: PayloadAction<StatKey>) {
      if (state.availablePoints > 0) {
        state.availablePoints -= 1;
        state[action.payload] += 1;
      }
    },
    decrementStat(state, action: PayloadAction<StatKey>) {
      if (state[action.payload] > 1) {
        state[action.payload] -= 1;
        state.availablePoints += 1;
      }
    },
    takeDamage(state, action: PayloadAction<number>) {
      state.currentHp = Math.max(0, state.currentHp - action.payload);
    },
    healHero(state) {
      state.currentHp = MAX_HP;
    },
    applyBuildPreset(state, action: PayloadAction<BuildPreset>) {
      const preset = BUILD_PRESETS[action.payload];
      state.str = preset.str;
      state.agi = preset.agi;
      state.int = preset.int;
      state.availablePoints = 0;
    },
    resetStats() {
      return initialState;
    },
  },
});

export const {
  incrementStat,
  decrementStat,
  takeDamage,
  healHero,
  applyBuildPreset,
  resetStats,
} = statsSlice.actions;

export default statsSlice.reducer;

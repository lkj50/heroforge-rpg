import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Item = {
  id: string;
  name: string;
  icon: string;
  category: 'weapon' | 'armor' | 'shield' | 'accessory';
  bonusStr: number;
  bonusAgi: number;
  bonusInt: number;
  weight: number;
};

export const ITEM_CATALOG: Item[] = [
  {
    id: 'sword_fire',
    name: 'Espada de Fuego',
    icon: '🔥',
    category: 'weapon',
    bonusStr: 5,
    bonusAgi: 0,
    bonusInt: 0,
    weight: 8,
  },
  {
    id: 'shield_titan',
    name: 'Escudo de Titanio',
    icon: '🛡️',
    category: 'shield',
    bonusStr: 2,
    bonusAgi: 0,
    bonusInt: 0,
    weight: 12,
  },
  {
    id: 'staff_arcane',
    name: 'Báculo Arcano',
    icon: '🪄',
    category: 'weapon',
    bonusStr: 0,
    bonusAgi: 0,
    bonusInt: 6,
    weight: 4,
  },
  {
    id: 'boots_elven',
    name: 'Botas Élficas',
    icon: '🥾',
    category: 'accessory',
    bonusStr: 0,
    bonusAgi: 5,
    bonusInt: 0,
    weight: 2,
  },
  {
    id: 'armor_cursed',
    name: 'Armadura Maldita',
    icon: '🧥',
    category: 'armor',
    bonusStr: 4,
    bonusAgi: -2,
    bonusInt: 0,
    weight: 22,
  },
  {
    id: 'dagger_shadow',
    name: 'Daga Sombría',
    icon: '🗡️',
    category: 'weapon',
    bonusStr: 0,
    bonusAgi: 4,
    bonusInt: 0,
    weight: 3,
  },
  {
    id: 'amulet_sage',
    name: 'Amuleto del Sabio',
    icon: '📿',
    category: 'accessory',
    bonusStr: 0,
    bonusAgi: 0,
    bonusInt: 3,
    weight: 1,
  },
];

const initialState = {
  catalog: ITEM_CATALOG,
  equippedIds: [] as string[],
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    toggleEquipItem(state, action: PayloadAction<string>) {
      const index = state.equippedIds.indexOf(action.payload);
      if (index >= 0) {
        state.equippedIds.splice(index, 1);
      } else {
        state.equippedIds.push(action.payload);
      }
    },
    clearEquipment(state) {
      state.equippedIds = [];
    },
  },
});

export const { toggleEquipItem, clearEquipment } = inventorySlice.actions;

export default inventorySlice.reducer;

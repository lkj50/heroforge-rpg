import { createSlice, nanoid } from '@reduxjs/toolkit';
import { ITEM_CATALOG } from './inventorySlice';

export type LogEntry = {
  id: string;
  type: string;
  payloadLabel: string;
  timestamp: number;
};

const initialState: { entries: LogEntry[] } = {
  entries: [],
};

const actionLogSlice = createSlice({
  name: 'actionLog',
  initialState,
  reducers: {
    clearLog() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // addMatcher alimenta el log automáticamente sin que los componentes tengan que despachar acciones adicionales.
    builder.addMatcher(
      (action) => action.type.startsWith('stats/') || action.type.startsWith('inventory/'),
      (state, action) => {
        const payload = 'payload' in action ? action.payload : undefined;
        let payloadLabel = '—';

        if (payload !== undefined) {
          if (typeof payload === 'string') {
            const item = ITEM_CATALOG.find((catalogItem) => catalogItem.id === payload);
            payloadLabel = item?.name ?? String(payload);
          } else {
            payloadLabel = String(payload);
          }
        }

        const entry: LogEntry = {
          id: nanoid(),
          type: action.type,
          payloadLabel,
          timestamp: Date.now(),
        };

        state.entries.unshift(entry);
        state.entries = state.entries.slice(0, 5);
      },
    );
  },
});

export const { clearLog } = actionLogSlice.actions;

export default actionLogSlice.reducer;

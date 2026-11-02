import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { takeDamage } from './slices/statsSlice';
import { selectCombatPower, selectEffectiveSpeed, selectHpInfo } from './selectors';

// Un thunk es una función que puede leer el store y despachar acciones mediante dispatch.
// Mantener el combate aquí evita lógica de juego en el componente.
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>;

export const attackBoss = (): AppThunk<number> => (dispatch, getState) => {
  const state = getState();

  if (selectHpInfo(state).condition === 'defeated') {
    return 0;
  }

  const bossDamage = Math.round(
    selectCombatPower(state).final * (0.8 + Math.random() * 0.4),
  );
  const effectiveSpeed = selectEffectiveSpeed(state);
  // Cada punto de velocidad efectiva reduce 1 de daño recibido, con un mínimo de 5.
  // La sobrecarga aumenta el daño recibido porque reduce la velocidad efectiva a la mitad.
  const counterDamage = Math.max(5, 30 - effectiveSpeed);

  dispatch(takeDamage(counterDamage));

  // El thunk no genera una acción propia, por eso solo aparece como código del reducer la acción
  // takeDamage que despacha; esa acción sí será capturada por el matcher del log.
  return bossDamage;
};

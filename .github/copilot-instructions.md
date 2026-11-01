# Proyecto: HeroForge RPG

Mini-juego en React Native (Expo, TypeScript) para un taller universitario sobre Redux Toolkit.
El objetivo es demostrar visualmente el flujo: Componente → dispatch(action) → Reducer → Store → Selector → re-render.

## Stack
- Expo (SDK más reciente, plantilla blank-typescript), se prueba en iPhone con Expo Go.
- @reduxjs/toolkit y react-redux.
- Sin librerías nativas extra que no funcionen en Expo Go. Para animaciones usar la API `Animated` de React Native.

## Estructura obligatoria
- src/store/index.ts → configureStore, RootState, AppDispatch, useAppDispatch, useAppSelector.
- src/store/slices/ → statsSlice.ts, inventorySlice.ts, actionLogSlice.ts.
- src/store/selectors.ts → todo el estado derivado.
- src/components/ → HeroAvatarHUD, StatsControlPanel, ArmoryGrid, ReduxLiveInspector.

## Reglas de arquitectura (no romper)
1. Las 4 zonas son componentes hermanos. NUNCA se pasan props entre ellas. Cada una usa useAppSelector y useAppDispatch directamente.
2. NUNCA guardar valores calculados en los slices (stats totales, peso total, sobrecarga, poder de combate, clase del héroe). Se calculan en selectors.ts con createSelector.
3. Los componentes no contienen lógica de negocio: solo leen selectores y despachan acciones.
4. Usar PayloadAction tipado en todos los reducers.
5. Usar siempre useAppDispatch y useAppSelector, nunca useDispatch/useSelector directamente.

## Reglas de juego
- Capacidad de carga = 10 + (Fuerza total × 2). Sobrecarga si peso equipado > capacidad.
- Poder bruto = (STR×3) + (AGI×2) + (INT×3). Con sobrecarga: Math.round(poder × 0.7).
- Presets: 'WARRIOR' | 'MAGE' | 'ROGUE' | 'TANK'.
- Clases visuales: Aldeano, Guerrero Berserker, Archimago, Asesino Sombrío, Tanque Pesado.

## Estilo
- Código simple y legible antes que ingenioso.
- No crear archivos ni funcionalidades que no se pidan en el prompt.
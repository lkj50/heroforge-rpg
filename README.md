# HeroForge RPG

Taller de arquitectura de estado visual con Redux Toolkit en React Native (Expo).

## Descripción

HeroForge RPG es una miniaplicación interactiva para construir y probar un héroe de RPG. Permite repartir atributos, aplicar presets, equipar objetos, observar cambios de peso y clase, curar al héroe y combatir contra un jefe.

El objetivo pedagógico es demostrar el flujo visual de Redux Toolkit: cuatro zonas independientes leen el mismo store, despachan acciones y reaccionan mediante selectores. La interfaz evita el prop drilling porque cada zona obtiene directamente los datos que necesita.

## Stack

- React Native
- Expo
- TypeScript
- `@reduxjs/toolkit`
- `react-redux`

## Cómo ejecutarlo

```bash
npm install
npx expo start
```

Escanea el código QR con **Expo Go** desde el teléfono.

Si el dispositivo no se conecta directamente, intenta iniciar Expo con túnel:

```bash
npx expo start --tunnel
```

## Estructura de carpetas

```text
App.tsx                         Punto de entrada visual; conecta Provider y SafeAreaProvider
src/theme.ts                    Paleta, espaciados y radios compartidos
src/store/index.ts              Configuración del store, tipos RootState/AppDispatch y hooks tipados
src/store/selectors.ts          Selectores memoizados y estado derivado
src/store/thunks.ts             Thunk attackBoss con la lógica de combate
src/store/slices/statsSlice.ts  Atributos base, puntos disponibles y HP del héroe
src/store/slices/inventorySlice.ts Catálogo e IDs de objetos equipados
src/store/slices/actionLogSlice.ts Registro automático de las acciones Redux
src/components/                 Las cuatro zonas funcionales y visuales de la app
src/components/ui/AnimatedBar.tsx Barra animada reutilizable para barras de progreso
```

## Arquitectura de Redux

### Slices

| Slice | Estado principal | Reducers principales |
|---|---|---|
| `stats` | Puntos disponibles, `str`, `agi`, `int` y HP actual | Incrementar/decrementar atributos, recibir daño, curar, aplicar presets y reiniciar estadísticas |
| `inventory` | Catálogo de objetos y IDs equipados | Equipar/desequipar un objeto y vaciar todo el equipo |
| `actionLog` | Lista de hasta 5 entradas recientes | Limpiar el registro; las demás acciones llegan mediante `extraReducers` |

El estado de combate conserva los datos base: atributos, puntos, HP, catálogo y equipamiento. Los totales, porcentajes, peso, clases, maná y poder se calculan fuera de los slices.

### Selectores principales

| Selector | Qué deriva |
|---|---|
| `selectEquippedItems` | Objetos del catálogo cuyos IDs están equipados |
| `selectTotalStats` | Estadísticas base más los bonos positivos o negativos del equipo |
| `selectTotalWeight` | Suma del peso de los objetos equipados |
| `selectMaxWeightCapacity` | Capacidad máxima a partir de la fuerza total |
| `selectIsOverencumbered` | Indica si el peso supera la capacidad máxima |
| `selectWeightStatus` | Porcentaje de carga y nivel visual de peso |
| `selectEffectiveSpeed` | Agilidad efectiva, reducida a la mitad durante sobrecarga |
| `selectCombatPower` | Poder bruto, poder final y si existe penalización |
| `selectManaInfo` | Maná máximo y porcentaje visual del maná |
| `selectHpInfo` | HP actual, máximo, porcentaje y condición del héroe |
| `selectHeroVisualClass` | Clase visual, emoji y color de aura |
| `selectHeroComputedStatus` | Resumen memoizado usado como vista agregada del estado del héroe |

Estos valores no se guardan en los slices para evitar datos duplicados que puedan quedar desincronizados. Los slices mantienen una única fuente de verdad y los selectores derivados mantienen calculada la información derivada.

Los selectores que transforman o devuelven objetos/arreglos usan `createSelector`, por lo que sus resultados se memoizan mientras sus entradas no cambien.

### Log automático

`actionLogSlice` usa `builder.addMatcher` para capturar todas las acciones cuyo tipo comienza por `stats/` o `inventory/`.

No obliga a los componentes a crear despachos adicionales para registrar cada acción. Para cada entrada se obtiene un ID con `nanoid`, un payload legible, el tipo y una fecha. El arreglo conserva únicamente las cinco acciones más recientes, con la más nueva al inicio.

### Thunk de combate

`attackBoss()` es un thunk de tipo `AppThunk<number>`. Puede leer el estado con `getState()` y despachar acciones con Redux Toolkit.

La lógica vive en el thunk en lugar del componente porque el combate combina varios selectores, aplica daño aleatorio al jefe, calcula el contraataque y actualiza el HP del héroe. El thunk devuelve al componente el daño producido contra el jefe. El propio thunk no crea una acción propia en el log; la acción `takeDamage()` que despacha sí queda registrada por `addMatcher`.

## Flujo unidireccional

```text
UI → dispatch(action) → middleware/thunk → reducer → store → selector → re-render
```

Las acciones sencillas llegan directamente a los reducers. Las acciones que requieren leer estado y producir una operación coordinada, como atacar, pasan por un thunk.

## Las cuatro zonas

| Zona | Qué muestra | Qué lee | Qué despacha |
|---|---|---|---|
| `HeroAvatarHUD` | Clase, emoji, aura, arma, HP, maná, carga y poder | Selectores visuales y derivados del héroe | Ninguna acción |
| `StatsControlPanel` | Puntos disponibles, atributos base/totales, barra, presets y reset | `selectStats` y `selectTotalStats` | Incrementar/decrementar atributos, aplicar presets y resetear |
| `ArmoryGrid` | Carga, sobrecarga, catálogo, bonos, peso y objetos equipados | Catálogo, equipo, peso, capacidad y sobrecarga | Equipar/desequipar objetos |
| `ReduxLiveInspector` | Jefe, poder, resultado de ataque, estado del héroe y últimas acciones | Poder, HP, log y `entries` de Redux | Atacar mediante thunk, curar, limpiar log y reiniciar jefe localmente |

## Decisiones de diseño

- El HUD superior y el inspector inferior permanecen fuera del `ScrollView`, mientras el entrenamiento y la armería ocupan el área central desplazable.
- Los botones de estadísticas no usan `disabled`: cuando su acción no tendría efecto siguen despachando. De este modo aparece el intento en el log y la validación real permanece dentro del reducer.
- La vida del jefe usa `useState` local, porque ninguna otra zona necesita compartirla. La vida del héroe sí se guarda en Redux porque la usan el HUD y el inspector.
- Los valores derivados se memoizan con `createSelector` para evitar cálculos y referencias nuevas innecesarias.
- Las barras y el avatar usan animaciones de React Native para comunicar cambios de progreso y clase.

## Reglas del juego

### Atributos y equipo

Cada bonus equipado se suma o resta al atributo base correspondiente. El selector evita que los atributos totales sean negativos.

### Capacidad de carga

```text
Capacidad máxima = 10 + (fuerza total × 2)
Sobrecarga = peso total > capacidad máxima
```

### Poder de combate

```text
Poder bruto = (fuerza × 3) + (agilidad × 2) + (inteligencia × 3)
Poder final = sobrecargado ? redondear(poder bruto × 0.7) : poder bruto
```

La penalización por sobrecarga es del 30 %.

### Velocidad efectiva

La agilidad total se conserva normalmente. Si hay sobrecarga, la velocidad efectiva es:

```text
Velocidad efectiva = redondear(agilidad total × 0.5)
```

### Maná

```text
Maná máximo = inteligencia total × 10
Porcentaje = mínimo(100, redondear(maná máximo / 300 × 100))
```

### HP del héroe

- `healthy`: porcentaje mayor que 60.
- `wounded`: HP actual mayor que 0 con porcentaje de 60 o menos.
- `defeated`: HP actual igual a 0.

### Combate contra el jefe

El daño del héroe al jefe usa el poder final y un factor aleatorio entre 0.8 y 1.2, redondeado:

```text
Daño al jefe = redondear(poder final × factorAleatorio)
Factor aleatorio: 0.8 ≤ factor ≤ 1.2
```

El contraataque usa la velocidad efectiva:

```text
Contraataque = máximo(5, 30 - velocidad efectiva)
```

Por ello, cada punto de velocidad efectiva reduce un punto de daño recibido, con un mínimo de 5. La sobrecarga reduce la velocidad efectiva a la mitad y hace que el contraataque sea mayor.

### Clases visuales

Las clases se determinan en este orden:

1. Si fuerza total es al menos 15 y peso total al menos 25: **Tanque Pesado**.
2. Si la estadística dominante alcanza al menos 15:
   - Fuerza: **Guerrero Berserker**.
   - Inteligencia: **Archimago**.
   - Agilidad: **Asesino Sombrío**.
3. En caso contrario: **Aldeano**.

La prioridad de empate entre estadísticas dominantes es **Fuerza, Inteligencia, Agilidad**.

## Autor

Nombre: ______________________________

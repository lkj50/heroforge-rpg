import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HeroAvatarHUD from './src/components/HeroAvatarHUD';
import StatsControlPanel from './src/components/StatsControlPanel';
import ArmoryGrid from './src/components/ArmoryGrid';
import ReduxLiveInspector from './src/components/ReduxLiveInspector';
import { store } from './src/store';
import { colors, spacing } from './src/theme';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />

          {/* Las cuatro zonas son componentes hermanos: no se pasan props y todas leen del store.
              El HUD y el inspector quedan fijos para que el efecto dominó sea visible siempre. */}
          <HeroAvatarHUD />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <StatsControlPanel />
            <ArmoryGrid />
          </ScrollView>

          <ReduxLiveInspector />
        </SafeAreaView>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    gap: spacing.md,
    padding: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
});

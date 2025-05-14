// app/_layout.tsx
import React, { useEffect, useState, ReactNode } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

import { GlobalProvider } from '../GlobalProvider';
/////////////////////////
// 1) Error Boundary  //
/////////////////////////
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    this.setState({ error });
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>¡Ups! Algo falló.</Text>
          <Text style={styles.errorMsg}>{this.state.error.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

/////////////////////////
// 2) Root Layout     //
/////////////////////////
export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  //const [isReady, setIsReady] = useState(false);
  const [isReady, setIsReady]       = useState(false);
  const [lastRoute, setLastRoute]   = useState<string | null>(null);


  useEffect(() => {
    // prevenimos que el splash auto-oquiera
    SplashScreen.preventAutoHideAsync().catch(() => {});

    (async () => {
      try {
        const lastRoute = await AsyncStorage.getItem('@lastRoute');
        const currentRoute = '/' + segments.join('/');

        if (lastRoute && currentRoute === '/') {
          await router.replace(lastRoute as any);
          await AsyncStorage.removeItem('@lastRoute');
        }
      } catch (e) {
        console.warn('Error restaurando ruta:', e);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, [segments, router]);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#873B8C" />
      </View>
    );
  }

   return (
       <GlobalProvider>
         <ErrorBoundary>
           <RouteTracker />
           <Slot />
         </ErrorBoundary>
       </GlobalProvider>
     );
}

/////////////////////////
// 3) Route Tracker   //
/////////////////////////
function RouteTracker() {
  const segments = useSegments();

  useEffect(() => {
    AsyncStorage.setItem('@lastRoute', '/' + segments.join('/')).catch(e =>
      console.warn('No pude guardar la ruta:', e)
    );
  }, [segments]);

  return null;
}

/////////////////////////
// 4) Styles          //
/////////////////////////
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorMsg: {
    textAlign: 'center',
  },
});

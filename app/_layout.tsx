import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();
  const [loading, setLoading] = useState(true);
  const [didNavigate, setDidNavigate] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!didNavigate) {
          const lastRoute = await AsyncStorage.getItem('@lastRoute');
          const currentRoute = '/' + segments.join('/');
          // Solo navegamos si la ruta actual es "/" y hay una última ruta guardada.
          if (lastRoute && currentRoute === '/') {
            // Esperamos un microtick antes de hacer replace
            setTimeout(() => {
              router.replace(lastRoute as any);
              setDidNavigate(true);
              // Para evitar que se repita, eliminamos la última ruta
              AsyncStorage.removeItem('@lastRoute');
            }, 0);
          } else {
            setDidNavigate(true);
          }
        }
      } catch (error) {
        console.error('Error al cargar la última ruta:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [segments, didNavigate, router]);


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#873B8C" />
      </View>
    );
  }

  return <Slot />;
}

// app/esquema.tsx
import React, { useEffect } from 'react';
import EsquemaScreen from '../screens/EsquemaScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSegments } from 'expo-router';

export default function EsquemaRoute() {
  const segments = useSegments(); // Por ejemplo: ['grupo']

  useEffect(() => {
    const currentRoute = '/' + segments.join('/');
    AsyncStorage.setItem('@lastRoute', currentRoute).catch(console.error);
  }, [segments]);

  return <EsquemaScreen />;
}

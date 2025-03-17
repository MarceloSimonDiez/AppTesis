// app/extracciones.tsx
import React, { useEffect } from 'react';
import ExtraccionesScreen from '../screens/ExtraccionesScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSegments } from 'expo-router';

export default function GrupoRoute() {
  const segments = useSegments(); // Por ejemplo: ['grupo']

  useEffect(() => {
    const currentRoute = '/' + segments.join('/');
    AsyncStorage.setItem('@lastRoute', currentRoute).catch(console.error);
  }, [segments]);

  return <ExtraccionesScreen />;
}

// app/grupo.tsx
import React, { useEffect } from 'react';
import GruposScreen from '../screens/GruposScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSegments } from 'expo-router';

export default function GrupoRoute() {
  const segments = useSegments(); // Por ejemplo: ['grupo']

  useEffect(() => {
    const currentRoute = '/' + segments.join('/');
    AsyncStorage.setItem('@lastRoute', currentRoute).catch(console.error);
  }, [segments]);

  return <GruposScreen />;
}

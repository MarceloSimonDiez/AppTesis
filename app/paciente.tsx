// app/paciente.tsx
import React, { useEffect } from 'react';
import PacienteScreen from '../screens/IndividuoScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSegments } from 'expo-router';

export default function PacienteRoute() {
  const segments = useSegments(); // Por ejemplo: ['grupo']

  useEffect(() => {
    const currentRoute = '/' + segments.join('/');
    AsyncStorage.setItem('@lastRoute', currentRoute).catch(console.error);
  }, [segments]);

  return <PacienteScreen />;
}

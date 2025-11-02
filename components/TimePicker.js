import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { responsiveFontSize as rf, responsiveWidth as rw, responsiveHeight as rh } from "react-native-responsive-dimensions";

// Función auxiliar (sin cambios)
const generateNumbers = (n) =>
  Array.from({ length: n }, (_, i) => i.toString().padStart(2, '0'));

export default function TimePicker({ onTimeChange }) {
  const [days, setDays] = useState('00');
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');

  // useEffect (sin cambios)
  useEffect(() => {
    onTimeChange &&
      onTimeChange({
        days: Number(days),
        hours: Number(hours),
        minutes: Number(minutes),
      });
  }, [days, hours, minutes]);

  // --- RETURN (Estructura modificada) ---
  return (
    <View style={styles.container}>
      {/* Columna para Días */}
      <View style={styles.column}>
        <Text style={styles.labelPicker}>Días</Text>
        {/* 1. Contenedor blanco añadido */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={days}
            onValueChange={setDays}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {generateNumbers(31).map((d) => (
              <Picker.Item key={d} label={d} value={d} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Columna para Hora */}
      <View style={styles.column}>
        <Text style={styles.labelPicker}>Hora</Text>
        {/* 2. Contenedor blanco añadido */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={hours}
            onValueChange={setHours}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {generateNumbers(24).map((h) => (
              <Picker.Item key={h} label={h} value={h} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Columna para Minuto */}
      <View style={styles.column}>
        <Text style={styles.labelPicker}>Minuto</Text>
        {/* 3. Contenedor blanco añadido */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={minutes}
            onValueChange={setMinutes}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {generateNumbers(60).map((m) => (
              <Picker.Item key={m} label={m} value={m} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
}

// --- ESTILOS CORREGIDOS ---
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  column: {
    alignItems: 'center',
    flex: 1, // Cada columna toma 1/3 del espacio
    marginHorizontal: rw(1), // Pequeño espacio entre columnas
  },
  labelPicker: {
    fontSize: rf(2.2), 
    fontWeight: 'bold',
    color: '#663399',
    marginBottom: rh(1), // Espacio entre label y contenedor
  },
  // --- ESTE ES EL NUEVO ESTILO PARA EL CONTENEDOR ---
  pickerContainer: {
    backgroundColor: '#FFFFFF', // Fondo blanco
    borderRadius: rw(3), // Bordes redondeados
    width: '100%', // Ocupa el 100% de la columna
    height: rh(10), // Altura fija
    justifyContent: 'center', // Centra el picker (útil en iOS)
    overflow: 'hidden', // Para que el picker no se salga de los bordes
    ...Platform.select({
      ios: { // Sombra para iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { // Sombra para Android (elevation)
        elevation: 2,
      },
    }),
  },
  picker: {
    height: rh(20), // Altura (a veces iOS la necesita)
    width: '100%', // Ocupa el 100% del contenedor blanco
  },
  pickerItem: {
    fontSize: rf(2.8), 
    color: '#873B8C',
  },
});
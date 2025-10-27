import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { responsiveFontSize as rf, responsiveWidth as rw, responsiveHeight as rh } from "react-native-responsive-dimensions";

// Función auxiliar para generar un array de strings de '00' a 'n-1'
const generateNumbers = (n) =>
  Array.from({ length: n }, (_, i) => i.toString().padStart(2, '0'));

export default function TimePicker({ onTimeChange }) {
  const [days, setDays] = useState('00');
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');




  // Disparar callback cuando cambie days, hours o minutes
  useEffect(() => {
    onTimeChange &&
      onTimeChange({
        days: Number(days),
        hours: Number(hours),
        minutes: Number(minutes),
      });
  }, [days, hours, minutes]);

  return (
    <View style={styles.container}>
      {/* Columna para Días */}
      <View style={styles.column}>
        <Text style={styles.labelPicker}>Días</Text>
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

      {/* Columna para Hora */}
      <View style={styles.column}>
        <Text style={styles.labelPicker}>Hora</Text>
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

      {/* Columna para Minuto */}
      <View style={styles.column}>
        <Text style={styles.labelPicker}>Minuto</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: rh(1),
  },

  column: {
    alignItems: 'center',
    padding: rw(5), // antes 20
  },

  labelPicker: {
    fontSize: rf(2),
    fontWeight: 'bold',
    color: '#873B8C',
    marginBottom: rh(1),
  },

  picker: {
    width: rw(22), // antes 90
  },

  pickerItem: {
    fontSize: rf(2.2),
    color: '#873B8C',
  },
});

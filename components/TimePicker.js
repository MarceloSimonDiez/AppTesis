// TimePicker.js
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

const TimePicker = ({ onTimeChange }) => {
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");

  const generateNumbers = (limit) =>
    Array.from({ length: limit }, (_, i) => i.toString().padStart(2, "0"));

  const handleTimeChange = (h, m) => {
    if (onTimeChange) {
      onTimeChange({ hours: h, minutes: m });
    }
  };

  return (
    <View style={styles.container}>
      {/* Columna para "Hora" */}
      <View style={styles.column}>
        <Text style={styles.labelPicker}>Hora</Text>
        <Picker
          selectedValue={hours}
          onValueChange={(itemValue) => {
            setHours(itemValue);
            handleTimeChange(itemValue, minutes);
          }}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          {generateNumbers(24).map((num) => (
            <Picker.Item key={num} label={num} value={num} />
          ))}
        </Picker>
      </View>

      {/* Columna para "Minuto" */}
      <View style={styles.column}>
        <Text style={styles.labelPicker}>Minuto</Text>
        <Picker
          selectedValue={minutes}
          onValueChange={(itemValue) => {
            setMinutes(itemValue);
            handleTimeChange(hours, itemValue);
          }}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          {generateNumbers(60).map((num) => (
            <Picker.Item key={num} label={num} value={num} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Contenedor principal en fila para las dos columnas
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 1,
  },
  // Cada columna (una para Hora y otra para Minuto)
  column: {
    alignItems: "center",
    padding: 20,
  },

  // Texto encima de cada Picker, parecido a "SELECCIONAR TIEMPO"
  labelPicker: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#873B8C",
    marginBottom: 8,
  },
  // Ajusta el tamaño del Picker
  picker: {
    width: 90, 
  },
  // Opcionalmente ajusta tamaño y color del texto dentro de la ruleta
  pickerItem: {
    fontSize: 20,
    color: '#873B8C',

  },
  
});

export default TimePicker;

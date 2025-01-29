import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress, style, textStyle }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6200EE', // Color de fondo
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute', // Posicionamiento absoluto
    bottom: 50,
    left: 20,            // Margen desde la izquierda
    right: 20,
  },
  text: {
    color: '#FFFFFF', // Color del texto
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomButton;
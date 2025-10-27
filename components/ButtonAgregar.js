import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import buttonStyles from '../styles/buttonStyles'; // Importamos los estilos

const CustomButton = ({ title, onPress, style, textStyle }) => {
  return (
    <TouchableOpacity style={[buttonStyles.buttonContinuar, style]} onPress={onPress}>
      <Text style={[buttonStyles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

// screens/HomeScreen.tsx
import React from "react";
import { View, Text, Button, TouchableOpacity } from "react-native";

import styles from "../styles/globalStyles";
import CustomButton from '../components/ButtonAgregar';

const GrupoScreen = ({navigation}) => {
  return (
    <View style={styles.fondoApp}>
      <Text style={styles.main}>GRUPO</Text>
        
          <CustomButton
            title="AGREGAR"
            onPress={() => console.log('Botón presionado')}
            style={{ backgroundColor: '#46004B', }}
            textStyle={{ fontSize: 18 }} 
          />

        <View style={styles.botonesContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.botonesI}>VOLVER</Text>
          </TouchableOpacity>
        
          <TouchableOpacity onPress={() => navigation.navigate('Paciente')}>
            <Text style={styles.botonesD}>SIGUIENTE</Text>
          </TouchableOpacity>


    </View>
</View>
  );
}

export default GrupoScreen;
import React from "react";
import { View, Text, TouchableOpacity, button } from "react-native";
import styles from "../styles/globalStyles";
import CustomButton from '../components/ButtonAgregar';

const EsquemaScreen = ({navigation}) => {
    return (
        <View style={styles.fondoApp}>
            <Text style={styles.main}>ESQUEMA</Text>

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
        
                <TouchableOpacity onPress={() => navigation.navigate('Extracciones')}>
                    <Text style={styles.botonesD}>SIGUIENTE</Text>
                </TouchableOpacity>
            </View>   
        </View>
    );
}

export default EsquemaScreen;
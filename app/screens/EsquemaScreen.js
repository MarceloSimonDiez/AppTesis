import React from "react";
import { View, Text, TouchableOpacity, button } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from "../styles/globalStyles";
import CustomButton from '../components/ButtonAgregar';


const EsquemaScreen = ({navigation}) => {
    return (
        <View style={styles.fondoApp}>
            <Text style={styles.main}>ESQUEMA</Text>

            <CustomButton
                title="AGREGAR"
                onPress={() => console.log('Botón presionado')}
            />
            
            <View style={styles.botonesContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.botonesI}>VOLVER</Text>
                 </TouchableOpacity>

                 <TouchableOpacity onPress={() => navigation.navigate('Extracciones')}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.botonesD}>CONTINUAR</Text>
                        <Icon name="arrow-forward-ios" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>
            </View>   
        </View>
    );
}

export default EsquemaScreen;
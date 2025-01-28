import React from "react";
import { View, Text, TouchableOpacity, button } from "react-native";
import styles from "../styles/globalStyles";


const ExtraccionesScreen = ({navigation}) => {
    return (
        <View style={styles.fondoApp}>
             <Text style={styles.main}>EXTRACCIONES</Text>
            
             <View style={styles.botonesContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.botonesI}>VOLVER</Text>
                 </TouchableOpacity>
            </View>
        </View>
    );
}

export default ExtraccionesScreen;
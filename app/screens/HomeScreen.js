import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import styles from "../styles/globalStyles";


const HomeScreen = ({ navigation }) => {
    return (
            <View style={{ flex: 1, backgroundColor: '#4E3350' }}>
                <Text style={styles.main}>HOME</Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Grupo')}>
                    <Text style={styles.buttonText}>INICIAR</Text>
                </TouchableOpacity>  
            </View>
    );
};

export default HomeScreen;
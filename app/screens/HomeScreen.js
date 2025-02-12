import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import styles from "../styles/globalStyles";
import CustomButton from '../components/ButtonAgregar';

const HomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safeAreaFull}>
            <StatusBar backgroundColor="#4E3350" barStyle="light-content" />
            <View style={styles.fullScreen}>
                <Text style={styles.main}>HOME</Text>
                <CustomButton
                    title="INICIAR"
                    onPress={() => navigation.navigate('Grupo')}
                    style={{ backgroundColor: '#A153A7' }}
                />
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;

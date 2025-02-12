import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "../styles/globalStyles";
import CustomButton from '../components/ButtonAgregar';

const EsquemaScreen = ({ route, navigation }) => {
    const { pacientes = [] } = route.params || [];
    const [intervalos, setIntervalos] = useState([]);
    const agregarIntervalo = () => {
        setIntervalos([...intervalos, { id: Date.now().toString(), tiempo: "" }]);
    };

    const eliminarIntervalo = (id) => {
        setIntervalos(intervalos.filter((item) => item.id !== id));
    };

    const actualizarTiempo = (id, nuevoTiempo) => {
        setIntervalos(intervalos.map((item) =>
            item.id === id ? { ...item, tiempo: nuevoTiempo } : item
        ));
    };

    const renderItem = ({ item }) => (
        <View style={styles.intervaloContainer}>
            <View style={styles.headerContainer}>
                <Text style={{color: 'white',}}>Intervalos de tiempo:</Text>
                <TouchableOpacity onPress={() => eliminarIntervalo(item.id)}>
                    <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
            <TextInput
                style={styles.input}
                placeholder="Ingrese tiempo"
                placeholderTextColor="#888"
                value={item.tiempo}
                onChangeText={(texto) => actualizarTiempo(item.id, texto)}
            />
        </View>
    );

    return (
        <View style={styles.fondoApp}>
            <Text style={styles.main}>ESQUEMA</Text>

            <FlatList
                data={intervalos}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            <CustomButton
                title="AGREGAR"
                onPress={agregarIntervalo}
            />

            <View style={styles.botonesContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.botonesI}>VOLVER</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Extracciones', { pacientes, intervalos })}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.botonesD}>CONTINUAR</Text>
            <Icon name="arrow-forward-ios" size={20} color="#fff" />
        </View>
    </TouchableOpacity>
            </View>
        </View>
    );
};

export default EsquemaScreen;

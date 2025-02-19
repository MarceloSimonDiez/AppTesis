import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import styles from "../styles/globalStyles";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const ExtraccionesScreen = ({ route, navigation }) => {
    const { intervalos, pacientes } = route.params;
    const [temporizadores, setTemporizadores] = useState({});

    const activarTemporizador = (id) => {
        if (!temporizadores[id]) {
            setTemporizadores((prevState) => ({
                ...prevState,
                [id]: { activo: true, tiempo: 0 } // Inicializa el tiempo en 0 segundos
            }));
        }
    };

    // Efecto para manejar el temporizador
    useEffect(() => {
        const interval = setInterval(() => {
            setTemporizadores((prevState) => {
                const nuevosTemporizadores = { ...prevState };
                Object.keys(nuevosTemporizadores).forEach((id) => {
                    if (nuevosTemporizadores[id].activo) {
                        nuevosTemporizadores[id].tiempo += 1;
                    }
                });
                return nuevosTemporizadores;
            });
        }, 1000);

        return () => clearInterval(interval); // Limpia el intervalo al desmontar
    }, []);

    const renderPaciente = ({ item }) => {
        const temporizadorActivo = temporizadores[item.id];

        return (
            <View style={styles.extraccionContainerE}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    <View style={styles.infoContainerE}>
                        <Text style={styles.labelE}>Paciente</Text>
                        <View style={styles.inputBoxE}>
                            <Text style={styles.inputTextE}>{item.nombre || "Sin nombre"}</Text>
                        </View>
                    </View>

                    <View style={styles.infoContainerE}>
                        <Text style={styles.labelE}>Grupo</Text>
                        <View style={styles.inputBoxE}>
                            <Text style={styles.inputTextE}>{item.grupoName}</Text>
                        </View>
                    </View>

                    {!temporizadorActivo ? (
                        <TouchableOpacity onPress={() => activarTemporizador(item.id)}>
                            <MaterialCommunityIcons name="play-circle-outline" size={32} color="#fff" style={styles.iconStyleE} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {temporizadorActivo && (
                    <View style={styles.timerContainer}>
                        <Text style={styles.timerText}>
                            {`Tiempo: ${Math.floor(temporizadorActivo.tiempo / 60)
                                .toString()
                                .padStart(2, "0")}:${(temporizadorActivo.tiempo % 60)
                                .toString()
                                .padStart(2, "0")}`}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.extraccionesScreenContainer}>
            <View style={styles.headerContainerE}>
                <Text style={styles.headerText}>Próximas Extracciones</Text>
            </View>

            <FlatList
                data={pacientes}
                keyExtractor={(item) => item.id}
                renderItem={renderPaciente}
                contentContainerStyle={{ padding: 16 }}
            />

            <View style={styles.botonesContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.botonesI}>VOLVER</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ExtraccionesScreen;

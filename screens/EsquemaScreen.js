// screens/EsquemaScreen.js (Después)
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "../styles/globalStyles";
import CustomButton from "../components/ButtonAgregar";
import TimePicker from "../components/TimePicker";

const EsquemaScreen = () => {
  const router = useRouter();
  // Obtenemos parámetros, por ejemplo, pacientes (serializados)
  const params = useLocalSearchParams();
  const initialPacientes = params.pacientes ? JSON.parse(params.pacientes) : [];
  
  const [pacientesData, setPacientesData] = useState(initialPacientes);
  const [intervalos, setIntervalos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Cargar intervalos desde AsyncStorage al montar el componente
  useEffect(() => {
    const loadIntervalos = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('intervalosData');
        if (jsonValue != null) {
          setIntervalos(JSON.parse(jsonValue));
        }
      } catch (error) {
        console.error("Error al cargar los intervalos:", error);
      }
    };
    loadIntervalos();
  }, []);

  // Guardar los intervalos en AsyncStorage cada vez que se actualicen
  useEffect(() => {
    const saveIntervalos = async () => {
      try {
        await AsyncStorage.setItem('intervalosData', JSON.stringify(intervalos));
      } catch (error) {
        console.error("Error al guardar los intervalos:", error);
      }
    };
    saveIntervalos();
  }, [intervalos]);

  const agregarIntervalo = () => {
    setIntervalos([
      ...intervalos,
      { id: Date.now().toString(), tiempo: { hours: "00", minutes: "00" } },
    ]);
  };

  const eliminarIntervalo = (id) => {
    setIntervalos(intervalos.filter((item) => item.id !== id));
  };

  const actualizarTiempo = (id, nuevoTiempo) => {
    setIntervalos(intervalos.map((item) =>
      item.id === id ? { ...item, tiempo: nuevoTiempo } : item
    ));
  };

  const abrirModal = (id) => {
    setSelectedId(id);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.intervalTimeContainer}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={styles.intervalLabelE}>intervalos de tiempo:</Text>
        <TouchableOpacity
          style={styles.intervalTimeButton}
          onPress={() => abrirModal(item.id)}
        >
          <Text style={styles.intervalTimeText}>
            {`${item.tiempo.hours}:${item.tiempo.minutes}`}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => eliminarIntervalo(item.id)}>
        <Icon name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  // ... Lógica de temporizadores se mantiene igual

  return (
    <View style={styles.fondoApp}>
      <Text style={styles.main}>ESQUEMA</Text>
      {/* Lista de intervalos */}
      <FlatList
        data={intervalos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <CustomButton title="AGREGAR" onPress={agregarIntervalo} />
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        {/* Modal para seleccionar tiempo */}
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>SELECCIONAR TIEMPO</Text>
            <TimePicker
              onTimeChange={(nuevoTiempo) => {
                if (selectedId) {
                  actualizarTiempo(selectedId, nuevoTiempo);
                }
              }}
            />
            <TouchableOpacity style={styles.modalButton} onPress={cerrarModal}>
              <Text style={styles.modalButtonText}>CONFIRMAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.botonesContainer}>
        <TouchableOpacity onPress={() => router.push("paciente")}>
          <Text style={styles.botonesI}>VOLVER</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "extracciones",
              params: {
                pacientes: JSON.stringify(pacientesData),
                intervalos: JSON.stringify(intervalos),
              },
            })
          }
        >
          <Text style={styles.botonesD}>CONTINUAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EsquemaScreen;

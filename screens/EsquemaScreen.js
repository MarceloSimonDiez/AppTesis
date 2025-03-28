// EsquemaScreen.js (DESPUÉS, usando GlobalContext)
import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "../styles/globalStyles";
import CustomButton from "../components/ButtonAgregar";
import TimePicker from "../components/TimePicker";
import { GlobalContext } from "../GlobalProvider";

const EsquemaScreen = () => {
  const router = useRouter();
  // Leemos los intervalos y pacientes desde el contexto
  const { pacientes, intervalos, setIntervalos } = useContext(GlobalContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const agregarIntervalo = () => {
    setIntervalos(prev => [
      ...prev,
      { id: Date.now().toString(), tiempo: { hours: "00", minutes: "00" } },
    ]);
  };

  const eliminarIntervalo = (id) => {
    setIntervalos(prev => prev.filter(item => item.id !== id));
  };

  const actualizarTiempo = (id, nuevoTiempo) => {
    setIntervalos(prev =>
      prev.map(item => item.id === id ? { ...item, tiempo: nuevoTiempo } : item)
    );
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
        <Text style={styles.intervalLabelE}>Intervalos de tiempo:</Text>
        <TouchableOpacity style={styles.intervalTimeButton} onPress={() => abrirModal(item.id)}>
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

  return (
    <View style={styles.fondoApp}>
      <Text style={styles.main}>ESQUEMA</Text>
      <FlatList
        data={intervalos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <CustomButton title="AGREGAR" onPress={agregarIntervalo} />
      <Modal visible={modalVisible} transparent animationType="fade">
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
        <TouchableOpacity onPress={() => router.push({ pathname: "extracciones" })}>
          <Text style={styles.botonesD}>CONTINUAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EsquemaScreen;

// EsquemaScreen.js (DESPUÉS, usando GlobalContext)
import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { useRouter } from "expo-router";
// import Icon from "react-native-vector-icons/MaterialIcons";
import { MaterialIcons } from "@expo/vector-icons";
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
  const { sampleName } = useContext(GlobalContext);

  // const agregarIntervalo = () => {
  //   setIntervalos(prev => [
  //     ...prev,
  //     { id: Date.now().toString(), tiempo: { hours: "00", minutes: "00" } },
  //   ]);
  // };

  const [pendingTime, setPendingTime] = useState({ hours: "00", minutes: "00" });

const abrirModal = (id) => {
  if (id) {
    // estamos editando uno existente
    const existing = intervalos.find(item => item.id === id);
    setPendingTime(existing.tiempo);
  } else {
    // es un nuevo intervalo
    setPendingTime({ hours: "00", minutes: "00" });
  }
  setSelectedId(id);
  setModalVisible(true);
};

  const eliminarIntervalo = (id) => {
    setIntervalos(prev => prev.filter(item => item.id !== id));
  };

  const actualizarTiempo = (id, nuevoTiempo) => {
    setIntervalos(prev =>
      prev.map(item => item.id === id ? { ...item, tiempo: nuevoTiempo } : item)
    );
  };

  // const abrirModal = (id) => {
  //   setSelectedId(id);
  //   setModalVisible(true);
  // };

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
        <MaterialIcons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
    {/* tu header blanco aquí */}
    <View style={styles.header}>
      <Text style={styles.headerText}>{sampleName}</Text>
    </View>
    <View style={styles.fondoApp}>
      <Text style={styles.main}>ESQUEMA DE MUESTREO</Text>
      <FlatList
        data={intervalos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 20}}
      />
   <CustomButton
  title="AGREGAR"
  onPress={() => abrirModal(null)}
/>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>SELECCIONAR TIEMPO</Text>
            {/* <TimePicker
              onTimeChange={(nuevoTiempo) => {
                if (selectedId) {
                  actualizarTiempo(selectedId, nuevoTiempo);
                }
              }}
            /> */}
            <TimePicker
             onTimeChange={setPendingTime}
            />
            {/* <TouchableOpacity style={styles.modalButton} onPress={cerrarModal}>
              <Text style={styles.modalButtonText}>CONFIRMAR</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  if (selectedId) {
                    // actualizar uno existente
                    actualizarTiempo(selectedId, pendingTime);
                  } else {
                    // crear uno nuevo con el tiempo seleccionado
                    const newId = Date.now().toString();
                    setIntervalos(prev => [
                      ...prev,
                      { id: newId, tiempo: pendingTime },
                    ]);
                  }
                  cerrarModal();
                }}
              >
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
           <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.botonesD}>CONTINUAR</Text>
              <MaterialIcons name="arrow-forward-ios" size={20} color="#fff" />
            </View>
        </TouchableOpacity>
      </View>
    </View>
       </View>
  );
};

export default EsquemaScreen;

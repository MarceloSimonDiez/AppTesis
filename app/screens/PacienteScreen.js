import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import styles from "../styles/globalStyles";
import ModalPaciente from "../components/ModalPaciente"; // Reutilizamos el modal de edición
import Icon from "react-native-vector-icons/MaterialIcons";

const PacienteScreen = ({ route, navigation }) => {
  const { grupos = [] } = route.params || {};

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [isViewingMode, setIsViewingMode] = useState(true);
  const [pacientesData, setPacientesData] = useState(
    grupos.flatMap((grupo) =>
      Array.from({ length: parseInt(grupo.cantidadPacientes, 10) || 0 }).map((_, index) => ({
        id: `${grupo.id}-paciente-${index}`,
        nombre: "",
        grupoName: grupo.name,
        sexo: "",
        edad: "",
        peso: "",
        descripcion: "",
      }))
    )
  );

  const handleAddDetalles = (pacienteId, detalles) => {
    setPacientesData((prevData) =>
      prevData.map((paciente) => (paciente.id === pacienteId ? { ...paciente, ...detalles } : paciente))
    );
    setModalVisible(true);
  };

  const renderPaciente = ({ item }) => (
    <TouchableOpacity
      style={{
        marginBottom: 12,
        backgroundColor: '#BB86FC',
        borderRadius: 12,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      onPress={() => {
        setSelectedPaciente(item);
        setIsViewingMode(true); // Modo solo visualización
        setModalVisible(true);
      }}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ fontSize: 14, color: 'white', fontWeight: '600', marginBottom: 4 }}>Paciente</Text>
        <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 8 }}>
          <Text style={{ color: '#333' }}>{item.nombre || "Sin nombre"}</Text>
        </View>
      </View>

      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={{ fontSize: 14, color: 'white', fontWeight: '600', marginBottom: 4 }}>Grupo</Text>
        <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 8 }}>
          <Text style={{ color: '#333' }}>{item.grupoName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.fondoApp}>
      <Text style={styles.main}>PACIENTE</Text>

      <FlatList
        data={pacientesData}
        keyExtractor={(item) => item.id}
        renderItem={renderPaciente}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: 'gray', marginTop: 20 }}>No hay grupos disponibles</Text>}
      />

      <ModalPaciente
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={(detalles) => handleAddDetalles(selectedPaciente.id, detalles)}
        paciente={selectedPaciente}
        isViewingMode={isViewingMode}
        onEdit={() => setIsViewingMode(false)} // Cambia a modo edición
      />

      <View style={styles.botonesContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.botonesI}>VOLVER</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Esquema', { pacientes: pacientesData })}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.botonesD}>CONTINUAR</Text>
        <Icon name="arrow-forward-ios" size={20} color="#fff" />
    </View>
</TouchableOpacity>


      </View>
    </View>
  );
};

export default PacienteScreen;

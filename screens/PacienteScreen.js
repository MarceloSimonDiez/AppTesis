// screens/PacienteScreen.js (Después)
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "../styles/globalStyles";
import ModalPaciente from "../components/ModalPaciente";
import Icon from "react-native-vector-icons/MaterialIcons";

const PacienteScreen = () => {
  const router = useRouter();
  // Obtenemos los parámetros (por ejemplo, "grupos")
  const { grupos } = useLocalSearchParams();
  // Convertimos el parámetro 'grupos' (cadena JSON) a array, o usamos [] si no existe
  const gruposData = grupos ? JSON.parse(grupos) : [];

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [isViewingMode, setIsViewingMode] = useState(true);
  const [pacientesData, setPacientesData] = useState(
    gruposData.flatMap((grupo) =>
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

  // Cargar datos desde AsyncStorage al montar el componente
  useEffect(() => {
    const loadPacientes = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('pacientesData');
        if (jsonValue != null) {
          setPacientesData(JSON.parse(jsonValue));
        }
      } catch (error) {
        console.error("Error al cargar los pacientes:", error);
      }
    };
    loadPacientes();
  }, []);

  // Cargar nuevamente los datos cada vez que la pantalla reciba foco
  useFocusEffect(
    React.useCallback(() => {
      const loadPacientes = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('pacientesData');
          if (jsonValue != null) {
            setPacientesData(JSON.parse(jsonValue));
          }
        } catch (error) {
          console.error("Error al cargar los pacientes:", error);
        }
      };
      loadPacientes();
    }, [])
  );

  // Guardar los datos en AsyncStorage cada vez que pacientesData se actualice
  useEffect(() => {
    const savePacientes = async () => {
      try {
        await AsyncStorage.setItem('pacientesData', JSON.stringify(pacientesData));
      } catch (error) {
        console.error("Error al guardar los pacientes:", error);
      }
    };
    savePacientes();
  }, [pacientesData]);

  useEffect(() => {
    console.log("Estado de grupos actualizado:", gruposData);
  }, [gruposData]);

  const handleAddDetalles = (pacienteId, detalles) => {
    setPacientesData((prev) =>
      prev.map((paciente) =>
        paciente.id === pacienteId ? { ...paciente, ...detalles } : paciente
      )
    );
    setModalVisible(true);
  };

  // Renderizar cada paciente
  const renderPaciente = ({ item }) => (
    <TouchableOpacity
      style={{
        marginBottom: 12,
        backgroundColor: "#BB86FC",
        borderRadius: 12,
        padding: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      onPress={() => {
        setSelectedPaciente(item);
        setIsViewingMode(true);
        setModalVisible(true);
      }}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ fontSize: 14, color: "white", fontWeight: "600", marginBottom: 4 }}>
          Paciente
        </Text>
        <View style={{ backgroundColor: "white", borderRadius: 8, padding: 8 }}>
          <Text style={{ color: "#333" }}>{item.nombre || "Sin nombre"}</Text>
        </View>
      </View>
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={{ fontSize: 14, color: "white", fontWeight: "600", marginBottom: 4 }}>
          Grupo
        </Text>
        <View style={{ backgroundColor: "white", borderRadius: 8, padding: 8 }}>
          <Text style={{ color: "#333" }}>{item.grupoName}</Text>
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
      />
      <ModalPaciente
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={(detalles) => handleAddDetalles(selectedPaciente.id, detalles)}
        paciente={selectedPaciente}
        isViewingMode={isViewingMode}
        onEdit={() => setIsViewingMode(false)}
      />
      <View style={styles.botonesContainer}>
        <TouchableOpacity onPress={() => router.push("grupo")}>
          <Text style={styles.botonesI}>VOLVER</Text>
        </TouchableOpacity>
        {/* Navegamos a la ruta "esquema", pasando pacientesData serializado */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "esquema",
              params: { pacientes: JSON.stringify(pacientesData) },
            })
          }
        >
          <Text style={styles.botonesD}>CONTINUAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PacienteScreen;

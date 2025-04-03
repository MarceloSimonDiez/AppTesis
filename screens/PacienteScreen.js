// PacienteScreen.js (MODIFICADO para fusionar en lugar de sobrescribir)
import React, { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { GlobalContext } from "../GlobalProvider"; // Importamos el contexto global
import styles from "../styles/globalStyles";
import ModalPaciente from "../components/ModalPaciente";
import Icon from "react-native-vector-icons/MaterialIcons";

const PacienteScreen = () => {
  const router = useRouter();
  const { dataLoaded, grupos, pacientes, setPacientes } = useContext(GlobalContext);
  
  // Recalcular la lista de pacientes solo si los datos ya se cargaron y pacientes está vacío.
useEffect(() => {
  if (dataLoaded && grupos.length > 0) {
    const pacientesGenerados = grupos.flatMap((grupo) =>
      Array.from({ length: parseInt(grupo.cantidadPacientes, 10) || 0 }).map((_, i) => ({
        id: `${grupo.id}-paciente-${i}`,
        nombre: "",
        grupoName: grupo.name,
        sexo: "",
        edad: "",
        peso: "",
        descripcion: "",
      }))
    );

    setPacientes((prev) => {
      const pacientesActualizados = pacientesGenerados.map((p) => {
        const existente = prev.find((x) => x.id === p.id);
        return existente ? existente : p;
      });

      return pacientesActualizados;
    });
  }
}, [dataLoaded, grupos]);

  
  useEffect(() => {
    console.log("👀 Estado actual de pacientes:", JSON.stringify(pacientes, null, 2));
  }, [pacientes]);
  
  

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [isViewingMode, setIsViewingMode] = useState(true);

  const handleAddDetalles = (pacienteId, detalles) => {
    setPacientes((prev) =>
      prev.map((paciente) => {
        if (paciente.id === pacienteId) {
          // Si se está modificando el nombre y es distinto al anterior, logueamos el paciente modificado
          if (detalles.nombre && detalles.nombre !== paciente.nombre) {
            console.log("Paciente modificado (nombre actualizado):", { ...paciente, ...detalles });
          }
          return { ...paciente, ...detalles };
        }
        return paciente;
      })
    );
    setModalVisible(true);
  };
  

  const renderPaciente = ({ item }) => {
    console.log("Renderizando paciente:", item);
    return (
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
};
  return (
    <View style={styles.fondoApp}>
      <Text style={styles.main}>PACIENTE</Text>
      <FlatList
        data={pacientes}
        keyExtractor={(item) => item.id}
        renderItem={renderPaciente}
        contentContainerStyle={{ paddingTop: 20 }} 
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
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "esquema",
            })
          }
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.botonesD}>CONTINUAR</Text>
            <Icon name="arrow-forward-ios" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PacienteScreen;

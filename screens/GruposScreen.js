import React, { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { GlobalContext } from "../GlobalProvider"; // Importamos el contexto
import { useRouter } from "expo-router";
import styles from "../styles/globalStyles";
import ModalForm from "../components/ModalGrupo";
import CustomButton from "../components/ButtonAgregar";
import { MaterialIcons } from "@expo/vector-icons";

const GROUP_COLORS = [
  "#EF9A9A",
  "#A5D6A7",
  "#90CAF9",
  "#FFCC80",
  "#BA68C8",
  "#80CBC4",
  "#BCAAA4",
  "#F48FB1",
  "#9FA8DA",
  "#E6EE9C",
];

const GrupoScreen = () => {
  const router = useRouter();
  const {
    sampleName,
    grupos,
    addGroup,
    updateGroup,
    deleteGroup,
  } = useContext(GlobalContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState(null);

  useEffect(() => {
    console.log("Estado de grupos actualizado:", JSON.stringify(grupos, null, 2));
  }, [grupos]);

  const handleAddGroup = (name, description, cantidadPacientes) => {
    if (name.trim() === "" || isNaN(cantidadPacientes)) {
      console.error("La cantidad de pacientes debe ser un número válido");
      return;
    }

    if (grupoEditando) {
      // edición: mantiene el color que ya tenía
      updateGroup(grupoEditando.id, name, description, cantidadPacientes);
      setGrupoEditando(null);
    } else {
      // creación: calcula color según índice y lo guarda en el provider
      const index = grupos.length % GROUP_COLORS.length;
      const color = GROUP_COLORS[index];
      addGroup(name, description, cantidadPacientes, color);
    }

    setModalVisible(false);
  };

  const handleEditGroup = (grupo) => {
    setGrupoEditando(grupo);
    setModalVisible(true);
  };

  const handleDeleteGroup = (id) => {
    deleteGroup(id);
  };

  const renderGrupo = ({ item, index }) => {
    // usa el color guardado en el grupo (item.color)
    const color = item.color ?? GROUP_COLORS[index % GROUP_COLORS.length];
    return (
      <View style={[styles.grupoContainer, { backgroundColor: color }]}>
        <Text style={[styles.grupoLabel, { color: "#fff" }]}>Grupo</Text>
        <View style={styles.grupoContent}>
          <Text style={[styles.grupoName, { color: "#000" }]}>{item.name}</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditGroup(item)}
            >
              <MaterialIcons name="edit" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                marginLeft: 8,
                padding: 4,
                backgroundColor: color,
                borderRadius: 4,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => handleDeleteGroup(item.id)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>x</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{sampleName}</Text>
      </View>

      <View style={styles.fondoApp}>
        <Text style={styles.main}>GRUPO</Text>
        <FlatList
          data={grupos}
          keyExtractor={(item) => item.id}
          renderItem={renderGrupo}
          contentContainerStyle={{ padding: 16 }}
        />

        <CustomButton
          title="AGREGAR"
          onPress={() => {
            setGrupoEditando(null);
            setModalVisible(true);
          }}
        />
        <ModalForm
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onAdd={handleAddGroup}
          grupoEditando={grupoEditando}
        />

        <View style={styles.botonesContainer}>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Text style={styles.botonesI}>VOLVER</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({ pathname: "paciente" })}>
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

export default GrupoScreen;

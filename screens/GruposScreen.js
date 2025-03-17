// screens/GruposScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import styles from "../styles/globalStyles";
import ModalForm from "../components/ModalGrupo";
import CustomButton from "../components/ButtonAgregar";
import Icon from "react-native-vector-icons/MaterialIcons";

const GrupoScreen = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [grupos, setGrupos] = useState([]);
  const [grupoEditando, setGrupoEditando] = useState(null);

  // Al montar, cargar grupos guardados
  useEffect(() => {
    AsyncStorage.getItem("@grupos")
      .then((data) => {
        if (data) {
          setGrupos(JSON.parse(data));
        }
      })
      .catch((err) => console.error("Error al cargar grupos:", err));
  }, []);

  // Guardar grupos cada vez que cambien
  useEffect(() => {
    AsyncStorage.setItem("@grupos", JSON.stringify(grupos)).catch((err) =>
      console.error("Error al guardar grupos:", err)
    );
  }, [grupos]);

  useEffect(() => {
    console.log("Estado de grupos actualizado:", grupos);
  }, [grupos]);

  const handleAddGroup = (name, description, cantidadPacientes) => {
    if (name.trim() !== "" && !isNaN(cantidadPacientes)) {
      if (grupoEditando) {
        // Actualizar grupo existente
        const gruposActualizados = grupos.map((grupo) =>
          grupo.id === grupoEditando.id
            ? { ...grupo, name, description, cantidadPacientes }
            : grupo
        );
        console.log("Grupo editado:", {
          id: grupoEditando.id,
          name,
          description,
          cantidadPacientes,
        });
        setGrupos(gruposActualizados);
        setGrupoEditando(null);
      } else {
        // Agregar nuevo grupo
        const nuevoGrupo = {
          id: Date.now().toString(),
          name,
          description,
          cantidadPacientes,
        };
        console.log("Nuevo grupo agregado:", nuevoGrupo);
        setGrupos((prev) => [...prev, nuevoGrupo]);
      }
      setModalVisible(false);
    } else {
      console.error("La cantidad de pacientes debe ser un número válido");
    }
  };

  const handleEditGroup = (grupo) => {
    console.log("Editando grupo:", grupo);
    setGrupoEditando(grupo);
    setModalVisible(true);
  };

  const handleDeleteGroup = (id) => {
    setGrupos((prev) => prev.filter((grupo) => grupo.id !== id));
  };

  const renderGrupo = ({ item }) => {
    console.log("Renderizando grupo:", item);
    return (
      <View style={styles.grupoContainer}>
        <Text style={styles.grupoLabel}>Grupo</Text>
        <View style={styles.grupoContent}>
          <Text style={styles.grupoName}>{item.name}</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditGroup(item)}
            >
              <Icon name="edit" size={24} color="#6A008A" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                marginLeft: 8,
                padding: 4,
                backgroundColor: "#A153A7", // Un morado suave, acorde al estilo de la app
                borderRadius: 4,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => handleDeleteGroup(item.id)}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>x</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
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
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "paciente",
              params: { grupos: JSON.stringify(grupos) },
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

export default GrupoScreen;

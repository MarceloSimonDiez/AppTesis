// GruposScreen.js - DESPUÉS
import React, { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { GlobalContext } from "../GlobalProvider"; // Importamos el contexto
import { useRouter } from "expo-router";
import styles from "../styles/globalStyles";
import ModalForm from "../components/ModalGrupo";
import CustomButton from "../components/ButtonAgregar";
import Icon from "react-native-vector-icons/MaterialIcons";

const GrupoScreen = () => {
  const router = useRouter();
  const { grupos, setGrupos } = useContext(GlobalContext); // Usamos el estado global
  const [modalVisible, setModalVisible] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState(null);

  useEffect(() => {
    console.log("Estado de grupos actualizado:", JSON.stringify(grupos, null, 2));
  }, [grupos]);

  const handleAddGroup = (name, description, cantidadPacientes) => {
    if (name.trim() !== "" && !isNaN(cantidadPacientes)) {
      if (grupoEditando) {
        const gruposActualizados = grupos.map((grupo) =>
          grupo.id === grupoEditando.id
            ? { ...grupo, name, description, cantidadPacientes }
            : grupo
        );
        setGrupos(gruposActualizados);
        setGrupoEditando(null);
      } else {
        const nuevoGrupo = {
          id: Date.now().toString(),
          name,
          description,
          cantidadPacientes,
        };
        setGrupos([...grupos, nuevoGrupo]);
      }
      setModalVisible(false);
    } else {
      console.error("La cantidad de pacientes debe ser un número válido");
    }
  };

  const handleEditGroup = (grupo) => {
    setGrupoEditando(grupo);
    setModalVisible(true);
  };

  const handleDeleteGroup = (id) => {
    setGrupos(grupos.filter((grupo) => grupo.id !== id));
  };

  const renderGrupo = ({ item }) => (
    <View style={styles.grupoContainer}>
      <Text style={styles.grupoLabel}>Grupo</Text>
      <View style={styles.grupoContent}>
        <Text style={styles.grupoName}>{item.name}</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={styles.editButton} onPress={() => handleEditGroup(item)}>
            <Icon name="edit" size={24} color="#6A008A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginLeft: 8,
              padding: 4,
              backgroundColor: "#A153A7",
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
              // Ahora ya no es necesario pasar los grupos por params,
              // ya que PacienteScreen los leerá del GlobalContext.
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

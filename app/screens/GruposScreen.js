import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, Modal } from "react-native";
import styles from "../styles/globalStyles";
import ModalForm from "../components/ModalGrupo";
import CustomButton from "../components/ButtonAgregar";
import Icon from "react-native-vector-icons/MaterialIcons";

const GrupoScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [grupos, setGrupos] = useState([]);
  const [grupoEditando, setGrupoEditando] = useState(null); // Nuevo estado para edición

  useEffect(() => {
    console.log("Estado de grupos actualizado:", grupos);
  }, [grupos]);

  const handleAddGroup = (name, description, cantidadPacientes) => {
    if (name.trim() !== "" && !isNaN(cantidadPacientes)) {
      if (grupoEditando) {
        // Si estamos editando, actualizamos el grupo existente
        const gruposActualizados = grupos.map((grupo) =>
          grupo.id === grupoEditando.id
            ? { ...grupo, name, description, cantidadPacientes }
            : grupo
        );

        console.log("Grupo editado:", { id: grupoEditando.id, name, description, cantidadPacientes });
        setGrupos(gruposActualizados);
        setGrupoEditando(null); // Limpiamos la edición
      } else {
        // Si no estamos editando, agregamos un nuevo grupo
        const nuevoGrupo = { id: Date.now().toString(), name, description, cantidadPacientes };
        console.log("Nuevo grupo agregado:", nuevoGrupo);
        setGrupos((prevGrupos) => [...prevGrupos, nuevoGrupo]);
      }
      setModalVisible(false);
    } else {
      // Si la cantidadPacientes no es válida
      console.error("La cantidad de pacientes debe ser un número válido");
    }
  };

  const handleEditGroup = (grupo) => {
    console.log("Editando grupo:", grupo);
    setGrupoEditando(grupo); // Guardamos el grupo que se quiere editar
    setModalVisible(true);
  };

  const renderGrupo = ({ item }) => {
    console.log("Renderizando grupo:", item);

    return (
      <View style={styles.grupoContainer}>
        <Text style={styles.grupoLabel}>Grupo</Text>
        <View style={styles.grupoContent}>
          <Text style={styles.grupoName}>{item.name}</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => handleEditGroup(item)}>
            <Icon name="edit" size={24} color="#6A008A" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.fondoApp}>
      <Text style={styles.main}>GRUPO</Text>

      {/* Lista de grupos */}
      <FlatList
        data={grupos}
        keyExtractor={(item) => item.id}
        renderItem={renderGrupo}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Botón para abrir el modal para agregar */}
      <CustomButton title="AGREGAR" onPress={() => {
        setGrupoEditando(null); // Limpiamos cualquier edición previa
        setModalVisible(true);
      }} />

      {/* Modal para agregar/editar */}
      <ModalForm 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onAdd={handleAddGroup} 
        grupoEditando={grupoEditando} // Pasamos el grupo en edición
      />

      {/* Botones inferiores */}
      <View style={styles.botonesContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.botonesI}>VOLVER</Text>
        </TouchableOpacity>

        {/* Navegación a PacienteScreen pasando los grupos */}
        <TouchableOpacity onPress={() => navigation.navigate("Paciente", { grupos: grupos })}>
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
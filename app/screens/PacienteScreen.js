import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import styles from "../styles/globalStyles";
import ModalPaciente from "../components/ModalPaciente";
import CustomButton from "../components/ButtonAgregar";
import Icon from "react-native-vector-icons/MaterialIcons";

const PacienteScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'grupo' o 'paciente'
  const [grupos, setGrupos] = useState([
    { id: "1", name: "Grupo A", description: "Grupo de prueba", pacientes: [] },
    { id: "2", name: "Grupo B", description: "Otro grupo", pacientes: [] },
  ]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  console.log("Grupos en PacienteScreen:", grupos);

  // Agregar un nuevo grupo
  const handleAddGroup = (name, description) => {
    const newGroup = {
      id: Date.now().toString(), // Genera un ID único
      name,
      description,
      pacientes: [],
    };
    setGrupos([...grupos, newGroup]); // Agrega el grupo a la lista
    setModalVisible(false);
  };

  // Agregar un paciente a un grupo existente
  const handleAddPaciente = (name, age, sex, weight, description) => {
    setGrupos((prevGrupos) =>
      prevGrupos.map((group) =>
        group.id === selectedGroup.id
          ? {
              ...group,
              pacientes: [...group.pacientes, { id: Date.now().toString(), name, age, sex, weight, description }],
            }
          : group
      )
    );
    setModalVisible(false);
  };

  // Mostrar modal para agregar grupos o pacientes
  const openModal = (type, group = null) => {
    setModalType(type);
    setSelectedGroup(group);
    setModalVisible(true);
  };

  return (
    <View style={styles.fondoApp}>
      <Text style={styles.main}>PACIENTE</Text>

      {/* Renderizar grupos dinámicos */}
      <FlatList
        data={grupos}
        keyExtractor={(group) => group.id}
        renderItem={({ item: group }) => (
          <View style={styles.groupContainer}>
            {/* Nombre del grupo */}
            <Text style={styles.groupTitle}>{group.name}</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => openModal("paciente", group)}>
              <Text style={styles.addButtonText}>+ Agregar Paciente</Text>
            </TouchableOpacity>

            {/* Renderizar los pacientes dentro del grupo */}
            <FlatList
              data={group.pacientes}
              keyExtractor={(paciente) => paciente.id}
              renderItem={({ item: paciente }) => (
                <TouchableOpacity style={styles.groupBox}>
                  <Text style={styles.groupText}>{paciente.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      />

      {/* Botón para agregar un nuevo grupo */}
      <CustomButton title="AGREGAR GRUPO" onPress={() => openModal("grupo")} />

      {/* Modal dinámico para agregar grupos o pacientes */}
      <ModalPaciente
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={modalType === "grupo" ? handleAddGroup : handleAddPaciente}
        grupos={grupos}
      />

      {/* Botones inferiores */}
      <View style={styles.botonesContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.botonesI}>VOLVER</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Esquema")}>
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
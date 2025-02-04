//GrupoScreen
import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import styles from "../styles/globalStyles";
import ModalForm from "../components/ModalGrupo";
import CustomButton from "../components/ButtonAgregar";
import Icon from "react-native-vector-icons/MaterialIcons";

const GrupoScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [grupos, setGrupos] = useState([]);

  const handleAddGroup = (name, description) => {
    if (name.trim() !== "") {
      setGrupos((prevGrupos) => [...prevGrupos, { id: Date.now().toString(), name, description }]);
    }
  };

  const renderGrupo = ({ item }) => (
    <View style={styles.grupoContainer}>
      <Text style={styles.grupoLabel}>Grupo</Text>
      <View style={styles.grupoContent}>
        <Text style={styles.grupoName}>{item.name}</Text>
        <TouchableOpacity style={styles.editButton}>
          <Icon name="edit" size={24} color="#6A008A" />
        </TouchableOpacity>
      </View>
    </View>
  );

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

      {/* Botón para abrir el modal */}
      <CustomButton title="AGREGAR" onPress={() => setModalVisible(true)} />

      {/* Modal */}
      <ModalForm 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onAdd={handleAddGroup} 
      />

      {/* Botones inferiores */}
      <View style={styles.botonesContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.botonesI}>VOLVER</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Paciente")}>
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
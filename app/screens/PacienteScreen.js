// screens/GrupoScreen.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../styles/globalStyles";
import ModalForm from "../components/ModalPaciente";
import CustomButton from "../components/ButtonAgregar";
import Icon from 'react-native-vector-icons/MaterialIcons';

const PacienteScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddGroup = (name, description) => {
    console.log("Grupo agregado:", { name, description });
  };

  return (
    <View style={styles.fondoApp}>
      <Text style={styles.main}>PACIENTE</Text>

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

        <TouchableOpacity onPress={() => navigation.navigate('Esquema')}>
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
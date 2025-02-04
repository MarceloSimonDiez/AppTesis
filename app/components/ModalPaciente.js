// components/ModalForm.js
import React, { useState } from "react";
import { Modal, TextInput, View, Text, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import modalStyles from "../styles/modalStyles";
import CustomButton from "./ButtonAgregar";

const ModalForm = ({ visible, onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    onAdd(name, description);
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalBackground}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>PACIENTE</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Aquí estamos ajustando la posición de los campos con marginTop */}
          <Image
             // Reemplaza con la ruta de tu imagen
            style={[modalStyles.image, { marginTop: 0 }]}  // Desplazamos la imagen un poco hacia arriba
          />

          <Text style={modalStyles.label}>Nombre:</Text>
          <View style={modalStyles.inputContainer}>
            <TextInput
              style={modalStyles.input}
              placeholder="Ingrese el nombre"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
            <Icon name="edit" size={20} color="#888" />
          </View>
        
          {/* ESTE NO LO COMPLETA EL USUARIO, SINO QUE TA 
          TIENE VALORES PRECARGADOS CON LOS GRUPO DEFINIDOS ANTES */}
          <Text style={modalStyles.label}>Grupo:</Text>
          <View style={modalStyles.inputContainer}>
            <TextInput
              style={modalStyles.input}
              placeholder="Ingrese el nombre"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
            <Icon name="edit" size={20} color="#888" />
          </View>

          <Text style={modalStyles.label}>Sexo:</Text>
          <View style={modalStyles.inputContainer}>
            <TextInput
              style={modalStyles.input}
              placeholder="Ingrese el nombre"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
            <Icon name="edit" size={20} color="#888" />
          </View>

          <Text style={modalStyles.label}>Edad:</Text>
          <View style={modalStyles.inputContainer}>
            <TextInput
              style={modalStyles.input}
              placeholder="Ingrese el nombre"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
            <Icon name="edit" size={20} color="#888" />
          </View>

          <Text style={modalStyles.label}>Peso:</Text>
          <View style={modalStyles.inputContainer}>
            <TextInput
              style={modalStyles.input}
              placeholder="Ingrese el nombre"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
            <Icon name="edit" size={20} color="#888" />
          </View>
        
          <Text style={modalStyles.label}>Descripción:</Text>
          <View style={modalStyles.inputContainer}>
            <TextInput
              style={modalStyles.input}
              placeholder="Ingrese la descripción"
              placeholderTextColor="#888"
              value={description}
              onChangeText={setDescription}
            />
            <Icon name="edit" size={20} color="#888" />
          </View>
            
          <View style={modalStyles.modalFooter}>
            <CustomButton title="AGREGAR" onPress={handleAdd} />
          </View>
   
        </View>
      </View>
    </Modal>
  );
};

export default ModalForm;
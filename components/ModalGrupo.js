import React, { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import modalStyles from "../styles/modalStyles";
import CustomButton from "./ButtonAgregar";

const ModalGrupo = ({ visible, onClose, onAdd, grupoEditando }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cantidadPacientes, setCantidadPacientes] = useState("");

  useEffect(() => {
    if (grupoEditando) {
      setName(grupoEditando.name);
      setDescription(grupoEditando.description);
      setCantidadPacientes(grupoEditando.cantidadPacientes?.toString() || "");
    } else {
      setName("");
      setDescription("");
      setCantidadPacientes("");
    }
  }, [grupoEditando]);

  const handleAdd = () => {
    onAdd(name, description, cantidadPacientes);
    setName("");
    setDescription("");
    setCantidadPacientes("");
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={modalStyles.modalBackground}
        >
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>
                {grupoEditando ? "EDITAR GRUPO" : "AGREGAR GRUPO"}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

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

            <Text style={modalStyles.label}>Cantidad de Pacientes:</Text>
            <View style={modalStyles.inputContainer}>
              <TextInput
                style={modalStyles.input}
                placeholder="Ingrese la cantidad"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={cantidadPacientes}
                onChangeText={setCantidadPacientes}
              />
              <Icon name="people" size={20} color="#888" />
            </View>

            <CustomButton title={grupoEditando ? "GUARDAR CAMBIOS" : "AGREGAR"} onPress={handleAdd} />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ModalGrupo;

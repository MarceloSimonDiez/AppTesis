// ModalGrupo.js
import React, { useEffect, useRef, useState, } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import modalStyles from "../styles/modalStyles";
import CustomButton from "./ButtonAgregar";
import { StatusBar } from "react-native";


const { width, height } = Dimensions.get("window");

const ModalGrupo = ({ visible, onClose, onAdd, grupoEditando }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cantidadPacientes, setCantidadPacientes] = useState("");
  const nameRef = useRef(null);

  // Carga datos al editar
  useEffect(() => {
    if (grupoEditando) {
      setName(grupoEditando.name);
      setDescription(grupoEditando.description);
      setCantidadPacientes(
        grupoEditando.cantidadPacientes?.toString() || ""
      );
    } else {
      setName("");
      setDescription("");
      setCantidadPacientes("");
    }
  }, [grupoEditando]);

  // Auto–focus al aparecer
  useEffect(() => {
    if (visible) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [visible]);

  const handleAdd = () => {
    onAdd(name, description, cantidadPacientes);
    setName("");
    setDescription("");
    setCantidadPacientes("");
    onClose();
  };

  if (!visible) return null;

  return (
    
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {/* Overlay full‐screen */}
      <View style={styles.overlay}>
        {/* Contenedor del modal */}
        <View style={modalStyles.modalContainer}>
          {/* Header */}
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>
              {grupoEditando ? "EDITAR GRUPO" : "AGREGAR GRUPO"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Zona scrollable */}
          <ScrollView
            contentContainerStyle={modalStyles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={modalStyles.label}>Nombre:</Text>
            <View style={modalStyles.inputContainer}>
              <TextInput
                ref={nameRef}
                style={modalStyles.input}
                placeholder="Ingrese el nombre"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
              />
              <MaterialIcons name="edit" size={20} color="#888" />
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
              <MaterialIcons name="edit" size={20} color="#888" />
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
              <MaterialIcons name="people" size={20} color="#888" />
            </View>
          </ScrollView>
        </View>


        <View style={[modalStyles.modalFooter, styles.footer]}>
          <CustomButton
            title={grupoEditando ? "GUARDAR CAMBIOS" : "AGREGAR"}
            onPress={handleAdd}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ModalGrupo;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999, // por encima de todo
  },
  footer: {
    bottom: 60,
    left: 20,
    right: 20,
  },
});

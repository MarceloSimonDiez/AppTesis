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
import buttonStyles from '../styles/buttonStyles';


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
             
            </View>

            <Text style={modalStyles.label}>Cantidad de Individuos:</Text>
            <View style={modalStyles.inputContainer}>
              <TextInput
                style={modalStyles.input}
                placeholder="Ingrese la cantidad"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={cantidadPacientes}
                onChangeText={setCantidadPacientes}
              />
             
            </View>
          </ScrollView>
        </View>


        <View style={[modalStyles.modalFooter, styles.footer]}>
              <TouchableOpacity
                style={buttonStyles.button}
                onPress={handleAdd}
                activeOpacity={0.7}
              >
                <Text style={buttonStyles.text}>
                  { grupoEditando ? "GUARDAR CAMBIOS" : "AGREGAR" }
                </Text>
              </TouchableOpacity>

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
    backgroundColor: "transparent",
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

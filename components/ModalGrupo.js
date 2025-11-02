import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Modal, // <-- 1. IMPORTAMOS MODAL NATIVO
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import modalStyles from "../styles/modalStyles";
import { RFValue } from "react-native-responsive-fontsize";

const ModalGrupo = ({ visible, onClose, onAdd, grupoEditando }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cantidadPacientes, setCantidadPacientes] = useState("");
  const nameRef = useRef(null);

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

  useEffect(() => {
    if (visible) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [visible]);

  // --- ARREGLO DEL ERROR DE 'KEY' (PARTE 1) ---
  const handleAdd = () => {
    const grupoData = {
        ...(grupoEditando && { id: grupoEditando.id }), 
        name: name,
        description: description,
        cantidadPacientes: cantidadPacientes,
    };
    onAdd(grupoData); // Envía el objeto
    setName("");
    setDescription("");
    setCantidadPacientes("");
    onClose();
  };

  return (
    // 2. USAMOS EL COMPONENTE MODAL NATIVO
    <Modal
      transparent={true} // Obligatorio para el overlay
      visible={visible} // Controlado por el prop
      animationType="fade" // Animación suave
      onRequestClose={onClose} // Para el botón "atrás" de Android
    >
      {/* 3. El overlay oscuro ahora está dentro del Modal */}
      <TouchableWithoutFeedback onPress={() => {
        Keyboard.dismiss();
        onClose();
      }}>
        <View style={modalStyles.overlay}>
          
      <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
          style={modalStyles.kavWrapper}
      >
            {/* 5. Contenedor del modal (blanco) */}
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={modalStyles.modalContainer}>
                
                {/* Header */}
                <View style={modalStyles.modalHeader}>
                  <Text style={modalStyles.modalTitle}>
                    {grupoEditando ? "Editar Grupo" : "Agregar Grupo"}
                  </Text>
                  <TouchableOpacity onPress={onClose}>
                    <MaterialIcons name="close" size={RFValue(24)} color="#333" />
                  </TouchableOpacity>
                </View>

                {/* Zona scrollable */}
                <ScrollView
                  style={modalStyles.scrollView}
                  contentContainerStyle={modalStyles.scrollContainer}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={modalStyles.label}>Nombre:</Text>
                  <TextInput
                    ref={nameRef}
                    style={modalStyles.input}
                    placeholder="Ingrese el nombre"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                  />
                  <Text style={modalStyles.label}>Descripción:</Text>
                  <TextInput
                    style={modalStyles.input}
                    placeholder="Ingrese la descripción"
                    placeholderTextColor="#999"
                    value={description}
                    onChangeText={setDescription}
                  />
                  <Text style={modalStyles.label}>Cantidad de Individuos:</Text>
                  <TextInput
                    style={modalStyles.input}
                    placeholder="Ingrese la cantidad"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={cantidadPacientes}
                    onChangeText={setCantidadPacientes}
                  />
                  
                  {/* Botón DENTRO del ScrollView */}
                  <View style={modalStyles.modalFooter}>
                    <TouchableOpacity
                      style={modalStyles.primaryButton}
                      onPress={handleAdd}
                      activeOpacity={0.7}
                    >
                      <Text style={modalStyles.primaryButtonText}>
                        {grupoEditando ? "GUARDAR CAMBIOS" : "AGREGAR"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ModalGrupo;
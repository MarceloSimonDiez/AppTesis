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
  Modal, 
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
// 1. Usamos los mismos estilos que ModalGrupo
import modalStyles from "../styles/modalStyles"; 
import { RFValue } from "react-native-responsive-fontsize";

// 2. Mantenemos el nombre y los props del componente
const ModalIndividuo = ({ visible, onClose, onSave, paciente }) => {
  
  // 3. Mantenemos la lógica y los estados del modal morado
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState("");
  const [peso, setPeso] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [grupo, setGrupo] = useState(""); // Campo del modal morado

  const nameRef = useRef(null); // Tomado de ModalGrupo para el focus

  useEffect(() => {
    if (paciente) {
      setNombre(paciente.nombre || "");
      setEdad(paciente.edad || "");
      setSexo(paciente.sexo || "");
      setPeso(paciente.peso || "");
      setDescripcion(paciente.descripcion || "");
      setGrupo(paciente.grupoName || "N/A"); // Asumo que el 'paciente' tiene 'grupoName'
    } else {
      // Limpiar campos si no hay paciente
      setNombre("");
      setEdad("");
      setSexo("");
      setPeso("");
      setDescripcion("");
      setGrupo("");
    }
  }, [paciente]); // Se actualiza si el 'paciente' cambia

  useEffect(() => {
    // Auto-focus al abrir (lógica de ModalGrupo)
    if (visible) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [visible]);

  const handleSave = () => {
    onSave({
      nombre,
      edad,
      sexo,
      peso,
      descripcion,
    });
  };

  // 4. Usamos la ESTRUCTURA del modal blanco (ModalGrupo)
  return (
    <Modal
      transparent={true} 
      visible={visible} 
      animationType="fade" 
      onRequestClose={onClose} 
    >
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
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={modalStyles.modalContainer}>
                
                {/* Header (estilo ModalGrupo) */}
                <View style={modalStyles.modalHeader}>
                  <Text style={modalStyles.modalTitle}>
                    {/* Usamos un título basado en la lógica de ModalIndividuo */}
                    {paciente?.nombre ? "Editar Individuo" : "Agregar Individuo"}
                  </Text>
                  <TouchableOpacity onPress={onClose}>
                    <MaterialIcons name="close" size={RFValue(24)} color="#333" />
                  </TouchableOpacity>
                </View>

                {/* Zona scrollable (estilo ModalGrupo) */}
                <ScrollView
                  style={modalStyles.scrollView}
                  contentContainerStyle={modalStyles.scrollContainer}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  
                  {/* 5. Usamos los CAMPOS del modal morado, 
                         con los ESTILOS del modal blanco */}
                  
                  <Text style={modalStyles.label}>Grupo:</Text>
                  <TextInput
                    style={[modalStyles.input, { backgroundColor: '#E0E0E0', color: '#666' }]} // Deshabilitado
                    value={grupo}
                    editable={false}
                  />

                  <Text style={modalStyles.label}>Identificador:</Text>
                  <TextInput
                    ref={nameRef} // Asignamos la ref para el auto-focus
                    style={modalStyles.input}
                    value={nombre}
                    onChangeText={setNombre}
                    placeholder="Ingrese identificador"
                    placeholderTextColor="#999"
                  />
            
                  <Text style={modalStyles.label}>Edad:</Text>
                  <TextInput
                    style={modalStyles.input}
                    value={edad}
                    onChangeText={setEdad}
                    placeholder="Ingrese edad"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />

                  <Text style={modalStyles.label}>Sexo:</Text>
                  <TextInput
                    style={modalStyles.input}
                    value={sexo}
                    onChangeText={setSexo}
                    placeholder="Ingrese sexo (M/F)"
                    placeholderTextColor="#999"
                  />

                  <Text style={modalStyles.label}>Peso:</Text>
                  <TextInput
                    style={modalStyles.input}
                    value={peso}
                    onChangeText={setPeso}
                    placeholder="Ingrese peso (kg)"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />

                  <Text style={modalStyles.label}>Descripción:</Text>
                  <TextInput
                    style={modalStyles.input}
                    value={descripcion}
                    onChangeText={setDescripcion}
                    placeholder="Ingrese descripción"
                    placeholderTextColor="#999"
                    multiline
                  />
                  
                  {/* Botón DENTRO del ScrollView (estilo ModalGrupo) */}
                  <View style={modalStyles.modalFooter}>
                    <TouchableOpacity
                      style={modalStyles.primaryButton}
                      onPress={handleSave} // Usamos el handler del modal morado
                      activeOpacity={0.7}
                    >
                      <Text style={modalStyles.primaryButtonText}>
                        Guardar
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

// 6. Eliminamos todos los 'styles' locales del modal morado

export default ModalIndividuo;
import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import modalStyles from "../styles/modalStyles";
import buttonStyles from "../styles/buttonStyles";


const ModalPaciente = ({ visible, onClose, onAdd, paciente }) => {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState("");
  const [peso, setPeso] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [grupo, setGrupo] = useState("");

  useEffect(() => {
    if (paciente) {
      setNombre(paciente.nombre || "");
      setEdad(paciente.edad || "");
      setSexo(paciente.sexo || "");
      setPeso(paciente.peso || "");
      setDescripcion(paciente.descripcion || "");
      setGrupo(paciente.grupoName || "Sin grupo");
    }
  }, [paciente]);

  const handleSave = () => {
    onAdd({
      nombre,
      edad,
      sexo,
      peso,
      descripcion,
    });
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={modalStyles.modalBackground}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>Editar Paciente</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.scrollContainer} contentContainerStyle={{ paddingBottom: 80 }}>
            <Text style={modalStyles.label}>Grupo:</Text>
            <View style={modalStyles.inputContainer}>
              <Text style={modalStyles.input}>{grupo}</Text>
            </View>

            <Text style={modalStyles.label}>Nombre:</Text>
            <View style={modalStyles.inputContainer}>
              <TextInput
                style={modalStyles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ingrese nombre"
                placeholderTextColor="#888"
              />
            </View>

            <Text style={modalStyles.label}>Edad:</Text>
            <View style={modalStyles.inputContainer}>
              <TextInput
                style={modalStyles.input}
                value={edad}
                onChangeText={setEdad}
                placeholder="Ingrese edad"
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
            </View>

            <Text style={modalStyles.label}>Sexo:</Text>
            <View style={modalStyles.inputContainer}>
              <TextInput
                style={modalStyles.input}
                value={sexo}
                onChangeText={setSexo}
                placeholder="Ingrese sexo"
                placeholderTextColor="#888"
              />
            </View>

            <Text style={modalStyles.label}>Peso:</Text>
            <View style={modalStyles.inputContainer}>
              <TextInput
                style={modalStyles.input}
                value={peso}
                onChangeText={setPeso}
                placeholder="Ingrese peso"
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
            </View>

            <Text style={modalStyles.label}>Descripción:</Text>
            <View style={modalStyles.inputContainer}>
              <TextInput
                style={modalStyles.input}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Ingrese descripción"
                placeholderTextColor="#888"
              />
            </View>
          </ScrollView>

          <View style={modalStyles.modalFooter}>
            <TouchableOpacity style={modalStyles.fixedButton} onPress={handleSave}>
              <Text style={buttonStyles.text}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalPaciente;

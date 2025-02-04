// components/ModalForm.js
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, FlatList, TextInput } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import modalStyles from "../styles/modalStyles"; // Importamos los estilos modalStyles
import CustomButton from "./ButtonAgregar";

const ModalPaciente = ({ visible, onClose, onAdd, grupos = [] }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupList, setShowGroupList] = useState(false);

  const handleAdd = () => {
    onAdd(name, age, sex, weight, description, selectedGroup);
    setName("");
    setAge("");
    setSex("");
    setWeight("");
    setDescription("");
    setSelectedGroup(null);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={modalStyles.modalBackground}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>PACIENTE</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* NOMBRE */}
          <Text style={modalStyles.label}>Nombre:</Text>
          <View style={modalStyles.inputContainer}>
            <TextInput
              style={modalStyles.input}
              placeholder="Ingrese el nombre"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
            <Icon name="person" size={20} color="#888" />
          </View>

          {/* EDAD */}
          <Text style={modalStyles.label}>Edad:</Text>
          <View style={modalStyles.inputContainer}>
            <TextInput
              style={modalStyles.input}
              placeholder="Ingrese la edad"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
            <Icon name="calendar-today" size={20} color="#888" />
          </View>

          {/* SEXO */}
          <Text style={modalStyles.label}>Sexo:</Text>
          <View style={modalStyles.inputContainer}>
            <TextInput
              style={modalStyles.input}
              placeholder="Ingrese el sexo"
              placeholderTextColor="#888"
              value={sex}
              onChangeText={setSex}
            />
            <Icon name="wc" size={20} color="#888" />
          </View>

          {/* PESO */}
          <Text style={modalStyles.label}>Peso (kg):</Text>
          <View style={modalStyles.inputContainer}>
            <TextInput
              style={modalStyles.input}
              placeholder="Ingrese el peso"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
            <Icon name="fitness-center" size={20} color="#888" />
          </View>

          {/* SELECCIÓN DE GRUPO */}
          <Text style={modalStyles.label}>Grupo:</Text>
          <TouchableOpacity style={modalStyles.inputContainer} onPress={() => setShowGroupList(!showGroupList)}>
            <Text style={[modalStyles.input, { textAlignVertical: "center" }]}>
              {selectedGroup ? selectedGroup.name : "Selecciona un grupo"}
            </Text>
            <Icon name="arrow-drop-down" size={24} color="#888" />
          </TouchableOpacity>

          {/* LISTA DE GRUPOS - Se muestra si showGroupList es true */}
          {showGroupList && (
            <View style={modalStyles.dropdownContainer}>
              <FlatList
                data={grupos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={modalStyles.dropdownItem}
                    onPress={() => {
                      setSelectedGroup(item);
                      setShowGroupList(false);
                    }}
                  >
                    <Text style={modalStyles.dropdownText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* DESCRIPCIÓN */}
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

          {/* BOTÓN DE AGREGAR */}
          <View style={modalStyles.modalFooter}>
            <CustomButton title="AGREGAR" onPress={handleAdd} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalPaciente;
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
import modalStyles from "../styles/modalStyles";
import { RFValue } from "react-native-responsive-fontsize";
import { useTranslation } from 'react-i18next';

const ModalGrupo = ({ visible, onClose, onAdd, grupoEditando }) => {
  const { t } = useTranslation();
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
      transparent={true} 
      visible={visible} 
      animationType="fade" 
      onRequestClose={onClose} 
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
                    {grupoEditando 
                      ? t('grupos.modal.editar') 
                      : t('grupos.modal.agregar')
                    }
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
                 <Text style={modalStyles.label}>{t('grupos.form.nombre')}</Text>
                  <TextInput
                    ref={nameRef}
                    style={modalStyles.input}
                    placeholder={t('modales.grupo_nombre')}
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                  />
                 <Text style={modalStyles.label}>{t('grupos.form.descripcion')}</Text>
                  <TextInput
                    style={modalStyles.input}
                    placeholder={t('modales.grupo_descripcion')}
                    placeholderTextColor="#999"
                    value={description}
                    onChangeText={setDescription}
                  />
                  <Text style={modalStyles.label}>{t('grupos.form.cantidad_individuos')}</Text>
                  <TextInput
                    style={modalStyles.input}
                    placeholder={t('modales.grupo_cantidad')}
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
                        {grupoEditando ? t('common.guardar_cambios') : t('common.agregar')}
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
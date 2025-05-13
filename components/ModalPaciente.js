// ModalPacienteSimple.js
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
} from "react-native";
import modalStyles from "../styles/modalStyles";
import CustomButton from "./ButtonAgregar";


const { width, height } = Dimensions.get("window");
const SBH = StatusBar.currentHeight || 0;
const SCROLL_PADDING_TOP = 100;
const FOOTER_HEIGHT = 100;



export default function ModalPaciente({ visible, onClose, onAdd, paciente }) {
  // — tus estados de campos —
  const [grupo, setGrupo] = useState("");
  const [nombre, setNombre] = useState("");
  const [sexo, setSexo] = useState("");
  const [edad, setEdad] = useState("");
  const [peso, setPeso] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // — efecto para poblar datos de `paciente` —
  useEffect(() => {
    if (paciente) {
      setGrupo(paciente.grupoName || "");
      setNombre(paciente.nombre || "");
      setEdad(paciente.edad?.toString() || "");
      setSexo(paciente.sexo || "");
      setPeso(paciente.peso?.toString() || "");
      setDescripcion(paciente.descripcion || "");
    } else {
      setGrupo("");
      setNombre("");
      setEdad("");
      setSexo("");
      setPeso("");
      setDescripcion("");
    }
  }, [paciente]);

  const [keyboardVisible, setKeyboardVisible] = useState(false);

useEffect(() => {
  const showSub = Keyboard.addListener("keyboardDidShow", () => {
    setKeyboardVisible(true);
  });
  const hideSub = Keyboard.addListener("keyboardDidHide", () => {
    setKeyboardVisible(false);
  });
  return () => {
    showSub.remove();
    hideSub.remove();
  };
}, []);

  const handleSave = () => {
    onAdd({ nombre, edad, sexo, peso, descripcion });
    onClose();
  };

  

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.wrapper}>

           <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={onClose}>
               <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView
              behavior={Platform.OS === "android" ? "height" : "padding"}
              keyboardVerticalOffset={SBH + 20}
              style={styles.flex}
          >
          <View style={{ flex: 1, overflow: "hidden" }}>
            {/* Área scrollable */}
            <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            >
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
          </View>
          </KeyboardAvoidingView>
         
          {/* <TouchableOpacity style={styles.footer} onPress={onClose}>
              <CustomButton title="Guardar" onPress={handleSave} />
          </TouchableOpacity> */}
{!keyboardVisible && (
  <View style={styles.footer}>
    <CustomButton title="Guardar" onPress={handleSave} />
  </View>
)}
        </View>
        
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  wrapper: {
    width: width,
    height: "95%",      // 60% de la pantalla
    backgroundColor: "#873B8C",
    borderTopLeftRadius:40,
    borderTopRightRadius:40,
    overflow: "hidden",
    paddingTop: 60,
  },
  scrollWrapper: {
    flex: 1,
    width: "100%",
    overflow: "hidden",            // recorta lo que quede arriba
  },
  scroll: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: FOOTER_HEIGHT + 16,
    
  },
  item: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 4,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  footer: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#fff",
    fontSize: 16,
  },
  closeButtonContainer: {
    position: "absolute",
    top: 16,
    right: 30,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
    lineHeight: 28,
  },
});


// screens/HomeScreen.js
import React, { useState, useEffect, useContext } from "react";
import {View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Keyboard, SafeAreaView, Pressable, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import CustomButton from "../components/ButtonAgregar";
// Ajustá la ruta si tu GlobalProvider.js está en otra carpeta
import { GlobalContext } from "../GlobalProvider";
import buttonStyles from '../styles/buttonStyles';

const LOGO = require("../assets/images/iconoInicio.png");
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const H_MARGIN = 10;    // margen horizontal total que querés restar
const V_MARGIN = 50;    // margen vertical total



export default function HomeScreen() {
  const router = useRouter();
  const { sampleName, setSampleName } = useContext(GlobalContext);
  const [localName, setLocalName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);


  useEffect(() => {
      if (sampleName) {
        router.replace("grupo");
      }
    }, [sampleName]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleContinue = () => {
    setSampleName(localName);
    setModalVisible(false);
    router.push("grupo");
  };

  if (sampleName === null) {
    return null;
  }
  
  // 2) Si sampleName no es cadena vacía → ya hay un nombre guardado, redirigimos
  if (sampleName !== "") {
    router.replace("grupo");
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Pantalla completa clickeable */}
      <Pressable
        style={styles.pressableFull}
        onPress={() => !keyboardVisible && setModalVisible(true)}
        android_ripple={{ color: "transparent", borderless: true }}
      >
        <View style={styles.logoContainer}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </View>
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Ingrese nombre del muestreo</Text>
            <TextInput
              style={styles.modalInput}
              value={localName}
              onChangeText={setLocalName}
              placeholder="Nombre de Muestreo"
              placeholderTextColor="#999"
              autoFocus
            />
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#873B8C",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: "#3E014D",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
  },
    safeArea: {
    flex: 1,
    backgroundColor: "#882D99",
  },
  pressableFull: {
    flex: 1,
    backgroundColor: "#822D99",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
  },
    logoContainer: {
    width: SCREEN_W - H_MARGIN,    
    height: SCREEN_H - V_MARGIN,
    borderRadius: 20,
    backgroundColor:  "#822D99",
    alignItems: "center",
    justifyContent: "center",
    // elevación Android
    elevation: 8,
  },
});
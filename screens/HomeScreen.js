// screens/HomeScreen.js
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import CustomButton from "../components/ButtonAgregar";
// Ajustá la ruta si tu GlobalProvider.js está en otra carpeta
import { GlobalContext } from "../GlobalProvider";

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
    <View style={styles.container}>
      {!keyboardVisible && (
        <CustomButton
          title="INICIAR"
          onPress={() => setModalVisible(true)}
          style={{ backgroundColor: "#873B8C" }}
        />
      )}

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
              placeholder="Ej: Muestreo 1"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
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
});

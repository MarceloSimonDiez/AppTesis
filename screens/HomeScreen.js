// screens/HomeScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  SafeAreaView,
  Pressable,
  Image,
  KeyboardAvoidingView, // <-- 1. Importante para el teclado
  Platform,
  LayoutAnimation, // <-- 2. Para animar el logo
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalContext } from '../GlobalProvider';

// --- Constantes (en un solo archivo) ---
const LOGO = require('../assets/images/iconoInicio.png');

const colors = {
  backgroundDark: '#3E014D',
  primary: '#663399',
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#E0E0E0',
  textPlaceholder: '#B0B0B0',
};

// 3. Habilitar LayoutAnimation en Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
// ---------------------------------------------

export default function HomeScreen() {
  const router = useRouter();
  const { sampleName, setSampleName } = useContext(GlobalContext);
  const [localName, setLocalName] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false); // <-- 4. Mantenemos esto

  // --- LÓGICA (Simplificada) ---

  // Redirige si ya existe un nombre
  useEffect(() => {
    if (sampleName) {
      router.replace('grupo');
    }
  }, [sampleName]);

  // Escucha el teclado para animar el logo
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // <-- 5. Animar
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // <-- 5. Animar
      setKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleContinue = () => {
    if (localName.trim() === '') return; // Evitar nombres vacíos
    setSampleName(localName);
  };

  if (sampleName === null) {
    return null; // O un <ActivityIndicator />
  }

  // --- RENDER (Completamente nuevo) ---
  return (
    <SafeAreaView style={styles.container}>
      {/* 6. KeyboardAvoidingView maneja el teclado automáticamente */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Contenedor de Bienvenida (Logo y Título) */}
        <View style={styles.welcomeContainer}>
          <Image
            source={LOGO}
            // 7. El logo se achica cuando aparece el teclado
            style={[
              styles.logo,
              keyboardVisible ? styles.logoSmall : styles.logoLarge,
            ]}
            resizeMode="contain"
          />
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>
            Ingrese un nombre para comenzar el muestreo
          </Text>
        </View>

        {/* Contenedor del Formulario (Input y Botón) */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            value={localName}
            onChangeText={setLocalName}
            placeholder="Nombre del Muestreo"
            placeholderTextColor={colors.textPlaceholder}
            autoFocus={true}
            returnKeyType="done"
            onSubmitEditing={handleContinue} // 8. Continuar al presionar 'done'
          />
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              localName.trim() === '' && styles.buttonDisabled, // 9. Estilo deshabilitado
            ]}
            onPress={handleContinue}
            disabled={localName.trim() === ''} // 9. Deshabilitar si está vacío
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- ESTILOS (Completamente nuevos) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'space-between', // Separa el logo (arriba) y el form (abajo)
  },
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    marginBottom: 24,
    // El tamaño se aplica dinámicamente
  },
  logoLarge: {
    width: 120,
    height: 120,
  },
  logoSmall: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  input: {
    backgroundColor: colors.white, // Input de color morado más claro
    borderRadius: 10,
    height: 55,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
    fontSize: 16,
    color: '#090909ff', // Texto de input blanco
    borderWidth: 1,
    borderColor: colors.primary, // Borde sutil
  },
  button: {
    backgroundColor: colors.primary, // Botón blanco (alto contraste)
    borderRadius: 10,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    backgroundColor: '#AAA', // Estilo gris cuando está deshabilitado
  },
  buttonText: {
    color: colors.white, // Texto del botón color morado
    fontSize: 16,
    fontWeight: 'bold',
  },
});
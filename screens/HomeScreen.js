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
  Platform,
  LayoutAnimation,
  UIManager,
  Dimensions,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter, useRootNavigationState } from 'expo-router';
import { GlobalContext } from '../GlobalProvider';
import {
  responsiveFontSize as rf,
  responsiveWidth as rw,
  responsiveHeight as rh,
} from "react-native-responsive-dimensions";
import { useTranslation } from 'react-i18next';

// --- Constantes (en un solo archivo) ---
const LOGO = require('../assets/images/iconoInicio.png');
const LOGO_PLADEMA = require('../assets/images/logo_pladema.png');
const LOGO_INSTITUCIONES = require('../assets/images/logo-civetan.png');
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
  const { t } = useTranslation();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { sampleName, setSampleName, idioma, cambiarIdioma } = useContext(GlobalContext);
  const [localName, setLocalName] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false); // <-- 4. Mantenemos esto

  useEffect(() => {
    // Solo navega si hay un nombre Y la navegación ya está lista
    if (sampleName && rootNavigationState?.key) {
      router.replace('grupo');
    }
  }, [sampleName, rootNavigationState]);

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

  // --- RENDER ---
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={rh(5)} // Margen extra sobre el teclado
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.mainWrapper}>
          {/* Selector de Idioma */}
          <View style={styles.languageSelector}>
            <Pressable
              onPress={() => cambiarIdioma('es')}
              style={[styles.langBtn, idioma === 'es' && styles.langBtnActive]}
            >
              <Text style={[styles.langText, idioma === 'es' && styles.langTextActive]}>ES</Text>
            </Pressable>
            <View style={styles.langSeparator} />
            <Pressable
              onPress={() => cambiarIdioma('en')}
              style={[styles.langBtn, idioma === 'en' && styles.langBtnActive]}
            >
              <Text style={[styles.langText, idioma === 'en' && styles.langTextActive]}>EN</Text>
            </Pressable>
          </View>

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
            <Text style={styles.title}>{t('home.welcome')}</Text>
            <Text style={styles.subtitle}>
              {t('home.subtitle')}
            </Text>
          </View>

          {/* Contenedor del Formulario (Input y Botón) */}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              value={localName}
              onChangeText={setLocalName}
              placeholder={t('home.placeholder')}
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
              <Text style={styles.buttonText}>{t('home.boton')}</Text>
            </Pressable>
          </View>

          {/* Logos Institucionales (Footer) */}
          {!keyboardVisible && (
            <View style={styles.footerLogos}>
              <Image
                source={LOGO_PLADEMA}
                style={styles.logoPladema}
                resizeMode="contain"
              />
              <Image
                source={LOGO_INSTITUCIONES}
                style={styles.logoInstituciones}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.backgroundDark,
  },
  mainWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  languageSelector: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: rh(2),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 4,
  },
  langBtn: {
    paddingHorizontal: rw(4),
    paddingVertical: rh(0.8),
    borderRadius: 16,
  },
  langBtnActive: {
    backgroundColor: colors.primary,
  },
  langText: {
    color: colors.textLight,
    fontSize: rf(1.6),
    fontWeight: '600',
  },
  langTextActive: {
    color: colors.white,
  },
  langSeparator: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rw(8),
    marginTop: rh(5), // Espacio desde el selector de idioma
    marginBottom: rh(3),
  },
  logo: {
    marginBottom: rh(2),
  },
  logoLarge: {
    width: rh(15),
    height: rh(15),
  },
  logoSmall: {
    width: rh(8), // Un poco más pequeño aún
    height: rh(8),
  },
  title: {
    fontSize: rf(3.5),
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: rh(0.5),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: rf(1.8),
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: rw(5),
  },
  formContainer: {
    paddingVertical: rh(2.5),
    paddingHorizontal: rw(5),
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: rh(1.2),
    height: rh(6.5),
    paddingHorizontal: rw(4),
    marginBottom: rh(2),
    width: '100%',
    fontSize: rf(2.0),
    color: '#090909ff',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  button: {
    backgroundColor: colors.primary, // Botón blanco (alto contraste)
    borderRadius: rh(1.2),
    height: rh(6.5),
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
    color: colors.white, 
    fontSize: rf(2.0),
    fontWeight: 'bold',
  },
  footerLogos: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: rh(2),
    paddingHorizontal: rw(8), 
    backgroundColor: colors.white,
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8, 
  },
  logoPladema: {
    width: rw(28),
    height: rh(5.5),
    opacity: 1, 
  },
  logoInstitucionesContainer: {
    opacity: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInstituciones: {
    width: rw(50), 
    height: rh(5.5),
  },
});
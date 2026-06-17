// GlobalProvider.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [grupos, setGrupos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [esquemas, setEsquemas] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [sampleName, setSampleName] = useState(null);
  const [temporizadores, setTemporizadores] = useState({});
  const [hideAddButtons, setHideAddButtons] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [idioma, setIdioma] = useState(null);

  const saveEsquemas = async (nuevosEsquemas) => {
    try {
      setEsquemas(nuevosEsquemas);
      await AsyncStorage.setItem("esquemasData", JSON.stringify(nuevosEsquemas));
    } catch (e) {
      console.error("Error guardando esquemas", e);
    }
  };

  const cambiarIdioma = async (nuevoIdioma) => {
    try {
      setIdioma(nuevoIdioma);
      await i18n.changeLanguage(nuevoIdioma);
      await AsyncStorage.setItem("idioma", nuevoIdioma);
    } catch (e) {
      console.error("Error al cambiar el idioma:", e);
    }
  };

  // --- EFECTOS DE CARGA (Al montar) ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [
          savedGrupos,
          savedPacientes,
          savedEsquemas,
          storedName,
          storedHideButtons,
          storedColorIndex,
          storedIdioma
        ] = await Promise.all([
          AsyncStorage.getItem("gruposData"),
          AsyncStorage.getItem("pacientesData"),
          AsyncStorage.getItem("esquemasData"),
          AsyncStorage.getItem("sampleName"),
          AsyncStorage.getItem("hideAddButtons"),
          AsyncStorage.getItem("colorIndex"),
          AsyncStorage.getItem("idioma")
        ]);

        if (savedGrupos) setGrupos(JSON.parse(savedGrupos));
        if (savedPacientes) setPacientes(JSON.parse(savedPacientes));
        if (savedEsquemas) setEsquemas(JSON.parse(savedEsquemas));
        setSampleName(storedName ?? "");
        if (storedHideButtons !== null) setHideAddButtons(JSON.parse(storedHideButtons));
        if (storedColorIndex !== null) setColorIndex(parseInt(storedColorIndex));

        if (storedIdioma) {
          setIdioma(storedIdioma);
          i18n.changeLanguage(storedIdioma);
        } else {
          // Si no hay idioma guardado, i18n ya usa el del dispositivo por defecto en su init
          setIdioma(i18n.language);
        }

      } catch (e) {
        console.error("❌ Error al cargar datos iniciales:", e);
      } finally {
        setDataLoaded(true);
      }
    };
    loadInitialData();
  }, []);

  // --- EFECTOS DE GUARDADO (Persistence) ---
  useEffect(() => {
    if (dataLoaded) {
      AsyncStorage.setItem("gruposData", JSON.stringify(grupos)).catch(() => { });
    }
  }, [grupos, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      AsyncStorage.setItem("pacientesData", JSON.stringify(pacientes)).catch(() => { });
    }
  }, [pacientes, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      AsyncStorage.setItem("esquemasData", JSON.stringify(esquemas)).catch(() => { });
    }
  }, [esquemas, dataLoaded]);

  useEffect(() => {
    if (dataLoaded && sampleName !== null) {
      AsyncStorage.setItem("sampleName", sampleName).catch(() => { });
    }
  }, [sampleName, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      AsyncStorage.setItem("hideAddButtons", JSON.stringify(hideAddButtons)).catch(() => { });
    }
  }, [hideAddButtons, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      AsyncStorage.setItem("colorIndex", String(colorIndex)).catch(() => { });
    }
  }, [colorIndex, dataLoaded]);

  //console.log('🌐 GlobalProvider montado, temporizadores inicial:', temporizadores);


  return (
    <GlobalContext.Provider
      value={{
        grupos,
        setGrupos,
        pacientes,
        setPacientes,
        esquemas,
        setEsquemas,
        saveEsquemas,
        dataLoaded,
        sampleName,
        setSampleName,
        temporizadores,
        setTemporizadores,
        hideAddButtons,
        setHideAddButtons,
        colorIndex,
        setColorIndex,
        idioma,
        cambiarIdioma,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

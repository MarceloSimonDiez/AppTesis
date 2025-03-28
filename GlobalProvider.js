// GlobalProvider.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [grupos, setGrupos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [intervalos, setIntervalos] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  useEffect(() => {
    const loadGrupos = async () => {
      try {
        const savedGrupos = await AsyncStorage.getItem("gruposData");
        console.log("📥 Grupos cargados al iniciar:", savedGrupos);
        if (savedGrupos) {
          setGrupos(JSON.parse(savedGrupos));
        }
      } catch (e) {
        console.error("❌ Error al cargar grupos:", e);
      }
    };
    loadGrupos();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedPacientes = await AsyncStorage.getItem('pacientesData');
        console.log("📥 Pacientes cargados al iniciar:", savedPacientes); // 👈
  
        if (savedPacientes) {
          setPacientes(JSON.parse(savedPacientes));
        }
      } catch (e) {
        console.error("❌ Error cargando pacientes:", e);
      } finally {
        setDataLoaded(true);
      }
    };
    loadData();
  }, []);

  // Cargar los intervalos al inicio
useEffect(() => {
  const loadIntervalos = async () => {
    try {
      const savedIntervalos = await AsyncStorage.getItem("intervalosData");
      console.log("📥 Intervalos cargados al iniciar:", savedIntervalos);
      if (savedIntervalos) {
        setIntervalos(JSON.parse(savedIntervalos));
      }
    } catch (e) {
      console.error("❌ Error al cargar intervalos:", e);
    }
  };
  loadIntervalos();
}, []);

  useEffect(() => {
    if (dataLoaded) {
      console.log("💾 Guardando pacientes:", JSON.stringify(pacientes, null, 2));
      AsyncStorage.setItem("pacientesData", JSON.stringify(pacientes));
    }
  }, [pacientes]);
  

  useEffect(() => {
    AsyncStorage.setItem('gruposData', JSON.stringify(grupos));
  }, [grupos]);

  useEffect(() => {
    AsyncStorage.setItem('pacientesData', JSON.stringify(pacientes));
  }, [pacientes]);

  useEffect(() => {
    AsyncStorage.setItem('intervalosData', JSON.stringify(intervalos));
  }, [intervalos]);

  return (
  <GlobalContext.Provider
    value={{
      grupos,
      setGrupos,
      pacientes,
      setPacientes,
      intervalos,
      setIntervalos,
      dataLoaded
    }}
  >
      {children}
    </GlobalContext.Provider>
  );
};

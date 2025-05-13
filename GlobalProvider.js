// GlobalProvider.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const GlobalContext = createContext();

const GROUP_COLORS = [
  "#F44336", "#4CAF50", "#2196F3", "#FF9800", "#9C27B0",
  "#009688", "#795548", "#E91E63", "#3F51B5", "#CDDC39",
];

export const GlobalProvider = ({ children }) => {
  const [grupos, setGrupos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [intervalos, setIntervalos] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [sampleName, setSampleName] = useState("");
  
  const addGroup = (name, description, cantidadPacientes, color) => {
    const newGroup = {
      id: Date.now().toString(),
      name,
      description,
      cantidadPacientes,
      color,
    };
    setGrupos((prev) => [...prev, newGroup]);
  };
  
  const updateGroup = (id, name, description, cantidadPacientes) => {
    setGrupos((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, name, description, cantidadPacientes } : g
      )
    );
  };
  
  // Agregá esta función para poder borrar grupos desde el Screen:
  const deleteGroup = (id) => {
    setGrupos((prev) => prev.filter((g) => g.id !== id));
  };


  useEffect(() => {
    AsyncStorage.setItem("sampleName", sampleName);
  }, [sampleName]);
  
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
      addGroup, 
      setGrupos,              
      updateGroup,
      deleteGroup,            
      pacientes,
      setPacientes,
      intervalos,
      setIntervalos,
      dataLoaded,
      sampleName,     
      setSampleName,   
    }}
  >
      {children}
    </GlobalContext.Provider>
  );
};

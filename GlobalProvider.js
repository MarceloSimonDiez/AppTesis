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
  const [sampleName, setSampleName] = useState(null);
  const [temporizadores, setTemporizadores] = useState({});
  const [hideAddButtons, setHideAddButtons] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);


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
  // 1. Actualizar el grupo
  let nuevoColor = null;
  setGrupos((prevGrupos) =>
    prevGrupos.map((g) => {
      if (g.id === id) {
        nuevoColor = g.color; // guardamos el color actual
        return { ...g, name, description, cantidadPacientes };
      }
      return g;
    })
  );

  // 2. Actualizar pacientes asociados al grupo
  setPacientes((prevPacientes) =>
    prevPacientes.map((p) =>
      p.id.startsWith(`${id}-`)
        ? { ...p, grupoName: name, color: nuevoColor }
        : p
    )
  );
};

  
  // Agregá esta función para poder borrar grupos desde el Screen:
const deleteGroup = (id) => {
    setGrupos((prev) => prev.filter((g) => g.id !== id));
  };

useEffect(() => {
  AsyncStorage.setItem('colorIndex', String(colorIndex));
}, [colorIndex]);

  // 1) Al montar, leo el valor guardado (si existe)
useEffect(() => {
  (async () => {
    try {
      const json = await AsyncStorage.getItem('hideAddButtons');
      if (json !== null) {
        setHideAddButtons(JSON.parse(json));
      }
    } catch (e) {
      console.warn('No pude cargar hideAddButtons:', e);
    }
  })();
}, []);

useEffect(() => {
  const loadColorIndex = async () => {
    try {
      const storedIndex = await AsyncStorage.getItem("colorIndex");
      if (storedIndex !== null) {
        setColorIndex(parseInt(storedIndex));
      }
    } catch (e) {
      console.error("❌ Error al cargar colorIndex:", e);
    }
  };
  loadColorIndex();
}, []);


// 2) Cada vez que cambie, lo guardo
useEffect(() => {
  (async () => {
    try {
      await AsyncStorage.setItem('hideAddButtons', JSON.stringify(hideAddButtons));
    } catch (e) {
      console.warn('No pude guardar hideAddButtons:', e);
    }
  })();
}, [hideAddButtons]);

useEffect(() => {
    if (sampleName !== null) {
        AsyncStorage.setItem("sampleName", sampleName);
      }      
}, [sampleName]);

  useEffect(() => {
      const loadSampleName = async () => {
        try {
            const storedName = await AsyncStorage.getItem("sampleName");
                // si no hay nada, almacenamos string vacío para indicar que ya terminamos de leer
            setSampleName(storedName ?? "");
        } catch (e) {
          console.error("❌ Error al cargar sampleName:", e);
          setSampleName("");
        }
      };
      loadSampleName();
    }, []);


  useEffect(() => {
    const loadGrupos = async () => {
      try {
        const savedGrupos = await AsyncStorage.getItem("gruposData");
        //log("📥 Grupos cargados al iniciar:", savedGrupos);
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
        //console.log("📥 Pacientes cargados al iniciar:", savedPacientes); // 👈
  
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
      //console.log("📥 Intervalos cargados al iniciar:", savedIntervalos);
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
     // console.log("💾 Guardando pacientes:", JSON.stringify(pacientes, null, 2));
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

  //console.log('🌐 GlobalProvider montado, temporizadores inicial:', temporizadores);


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
      temporizadores,       
      setTemporizadores, 
      hideAddButtons,
      setHideAddButtons, 
      colorIndex,
      setColorIndex, 
    }}
  >
      {children}
    </GlobalContext.Provider>
  );
};

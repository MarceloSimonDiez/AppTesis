import React, { useContext, useEffect, useState, useReducer, useMemo } from "react"; // --- CAMBIO: Se añade 'useMemo'
import * as MediaLibrary from 'expo-media-library';
import { View, Text,  TouchableOpacity, FlatList, SafeAreaView, AppState,Platform,InteractionManager, Alert } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import styles from "../styles/globalStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlobalContext } from "../GlobalProvider";
import buttonStyles from '../styles/buttonStyles';
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Notifications from 'expo-notifications';
import Paciente from "../components/Paciente";
import { guardarCSVenDescargas } from '../services/fileUtils';
import extraccionesStyles from "../styles/extraccionesStyles";
import * as XLSX from 'xlsx';
import { RFValue } from "react-native-responsive-fontsize";
import grupoStyles from "../styles/grupoStyles";

// Devuelve 'SIN_INICIAR' | 'CURSO' | 'FINALIZADO' según el estado de un paciente
function getStatus(paciente, timer, esquemas = []) { // Añadido 'esquemas'
  if (!paciente.esquemaId) return 'SIN_INICIAR';
  const esquema = esquemas.find(e => e.id === paciente.esquemaId);
  if (!esquema || !esquema.intervalos || esquema.intervalos.length === 0) {
    return 'SIN_INICIAR';
  }
  const idx   = timer?.intervalIndex ?? 0;
  const active= timer?.activo === true;
  const fin   = timer?.finished === true;
  const done  = timer?.allFinished === true;
  const curInt = esquema.intervalos?.[idx] || {};
  const isDay = curInt.tiempo?.days > 0;

  if (done) return 'FINALIZADO';
  if (active || (fin && !done)) return 'CURSO';
  if (!active && !fin && idx === 0) return 'SIN_INICIAR';
  if (isDay && fin) return 'FINALIZADO';
  return 'SIN_INICIAR';
}

const ExtraccionesScreen = () => {
  const router = useRouter();
  const {grupos,pacientes,
    esquemas,
    dataLoaded,
    setGrupos,
    setPacientes,
    setIntervalos,
    sampleName,
    setEsquemas,
    setSampleName,
    temporizadores,       
    setTemporizadores  
  } = useContext(GlobalContext);
  const [patientsWithIntervals, setPatientsWithIntervals] = useState([]);
  const [filter, setFilter] = useState('SIN_INICIAR');
  const [isExporting, setIsExporting] = useState(false);
  const [basePacientesList, setBasePacientesList] = useState([]);
  // Utilizamos useReducer para forzar un re-render cada segundo.
  // Cada vez que se llama a forceUpdate() se actualiza un estado interno que no usamos,
  // lo que provoca que React vuelva a renderizar el componente.
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  // Dentro de ExtraccionesScreen, tras temporizadores y patientsWithIntervals:
  const allFinishedAll = Array.isArray(patientsWithIntervals) && patientsWithIntervals.length > 0 &&
  patientsWithIntervals.every(p => {
    const t = temporizadores[p.id] || {};
    // 1) Confirmación manual (último ✔️)
    if (t.allFinished) return true;

    // 2) Último intervalo es “días” **Y** ya venció ese timer
    const intervals = p.intervalos || [];
    const lastInt   = intervals[intervals.length - 1];
    const isDay     = lastInt?.tiempo?.days > 0;
    // Sólo lo tomamos como finalizado si el timer llegó a cero
    if (isDay && t.finished === true) return true;

    return false;
  });
  const [highlightedId, setHighlightedId] = useState(null);  
  const { setHideAddButtons } = useContext(GlobalContext);


  const handlePlay = (pacienteId, accion) => {
    setHideAddButtons(true);               // ocultás botones globalmente
    iniciarIntervalo(pacienteId, accion);  // tu lógica original
  };

  const confirmarFin = () => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que querés finalizar y exportar los datos recopilados hasta este momento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aceptar', onPress: exportarMatrices }
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    // Iteramos el array que SÍ tiene .intervalos
    patientsWithIntervals.forEach(p => {
      const data = temporizadores[p.id] || {};
      const idx  = data.intervalIndex ?? 0;
      const cur  = p.intervalos[idx];
      if (cur?.tiempo?.days > 0 && !data.allFinished) {
        setTemporizadores(prev => ({
          ...prev,
          [p.id]: {
            ...prev[p.id],
            activo:       false,
            finished:     true,
            allFinished:  true,
            intervalIndex: idx + 1,
          }
        }));
      }
    });
  }, [patientsWithIntervals, temporizadores]);


  
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate();
    }, 1000); // Cada 1000 milisegundos (1 segundo)
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
      }),
    });
  }, []);
  
  useEffect(() => {
    // Para Android: canal de alarma de máxima prioridad
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('alarm-channel', {
        name: 'Alarm Channel',
        importance: Notifications.AndroidImportance.MAX,           // prioridad máxima
        sound: 'default',                                         // usar sonido por defecto
        vibrationPattern: [0, 250, 250, 250],
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
      });
    }
  }, []);
  
// MODIFICA ESTE BLOQUE
  useEffect(() => {
      const task = InteractionManager.runAfterInteractions(() => {
      // (Esta lógica interna está perfecta)
      const pacientesConEsquema = pacientes.filter(p => p.esquemaId);
      const nuevosPacientes = pacientesConEsquema.map((p) => { 
        const esquemaDelPaciente = esquemas.find(e => e.id === p.esquemaId);    
        const intervalosDelEsquema = esquemaDelPaciente ? esquemaDelPaciente.intervalos : [];
        const intervalosParaPaciente = intervalosDelEsquema.map((i) => ({
          ...i,
          tiempo: { ...i.tiempo },
          outcome: null,
          tiempoRespuesta: null,
        }));
        return {
          ...p,
          intervalos: intervalosParaPaciente, 
        };
      });
      // No seteamos el estado final, sino el estado base.
      setBasePacientesList(nuevosPacientes);
    });

    return () => task.cancel();
    
  }, [pacientes, esquemas]); // <--- (Las dependencias están bien)

  
// MODIFICA ESTE BLOQUE
  useEffect(() => {
    const cargarTemporizadores = async () => {
      if (basePacientesList.length === 0) {
        setTemporizadores({});
        setPatientsWithIntervals([]);
        return;
      }

      const nuevosTimers = {};
      const nuevosPatientsWithIntervals = [];
  
      
      for (const paciente of basePacientesList) {
        try {

        const [dataStr, intervalosTomadosStr, inicioStr] = await Promise.all([
            AsyncStorage.getItem(`temporizador-${paciente.id}`),
            AsyncStorage.getItem(`intervalosTomados-${paciente.id}`),
            AsyncStorage.getItem(`inicio-${paciente.id}`) 
          ]);

          let temporizadorGuardado = null;
          let intervalosGuardados = null;
  
          if (dataStr) temporizadorGuardado = JSON.parse(dataStr);
          if (intervalosTomadosStr) intervalosGuardados = JSON.parse(intervalosTomadosStr);
  
          
          if (temporizadorGuardado) {
            const { startTime, intervalIndex, duration, zeroReachedAt, finished, allFinished } = temporizadorGuardado;
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(duration - elapsed, 0);
            const calculadoZero = zeroReachedAt ?? (remaining === 0 ? startTime + duration * 1000 : null);
            nuevosTimers[paciente.id] = {
              activo: remaining > 0,
              tiempo: remaining,
              finished: finished !== undefined ? finished : (remaining === 0),
              allFinished: allFinished !== undefined ? allFinished : false,
              intervalIndex,
              zeroReachedAt: calculadoZero,
              notificationId: null,
            };
          }

          nuevosPatientsWithIntervals.push({
            ...paciente,
            inicio: inicioStr || null,
            intervalos: (paciente.intervalos || []).map((i, idx) => { 
              const existente = intervalosGuardados?.[idx];
              return {
                ...i,
                tiempo: { ...i.tiempo },
                outcome: existente?.outcome ?? null,
                tiempoRespuesta: existente?.tiempoRespuesta ?? null,
                horaInicio: existente?.horaInicio ?? null,
              };
            }),
          });
        } catch (e) {
          console.warn("Error cargando datos persistidos:", e);
        }
      }
  
      // 4. SETEAMOS AMBOS ESTADOS JUNTOS
      // Esto soluciona el "flicker"
      setTemporizadores(nuevosTimers);
      setPatientsWithIntervals(nuevosPatientsWithIntervals);
    };
  
    cargarTemporizadores();
  }, [basePacientesList]); 
  
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active") {
        console.log("🔙 Volvimos al primer plano. Recalculando temporizadores...");
        const nuevosTimers = {};
  
        for (const paciente of pacientes) {
          try {
            const dataStr = await AsyncStorage.getItem(`temporizador-${paciente.id}`);
            if (dataStr) {
              // Recuperamos además finished y allFinished
              const { startTime, intervalIndex, duration, zeroReachedAt, finished, allFinished } = JSON.parse(dataStr);
              const elapsed = Math.floor((Date.now() - startTime) / 1000);
              const remaining = Math.max(duration - elapsed, 0);
              const calculadoZero = zeroReachedAt ?? (remaining === 0 ? startTime + duration * 1000 : null);
  
              nuevosTimers[paciente.id] = {
                activo: remaining > 0,
                tiempo: remaining,
                finished: finished !== undefined ? finished : (remaining === 0),
                allFinished: allFinished !== undefined ? allFinished : false,
                intervalIndex,
                zeroReachedAt: calculadoZero,
              };
            }
          } catch (e) {
            console.warn("⛔ Error al recalcular desde segundo plano:", e);
          }
        }
  
        setTemporizadores(nuevosTimers);
      }
    });
  
    return () => subscription.remove();
  }, [pacientes]);
    
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTemporizadores((prev) => {
        const nextState = { ...prev };
        Object.keys(nextState).forEach((id) => {
          const data = nextState[id];
          if (data.activo && !data.finished && !data.allFinished) {
            if (data.tiempo > 0) {
              data.tiempo -= 1;
            } else if (!data.finished) {
              data.tiempo = 0;
              data.activo = false;
              
              
              data.finished = true;
              if ('notificationId' in data && data.notificationId) {
                Notifications.cancelScheduledNotificationAsync(data.notificationId);
              }

  
              if (!data.zeroReachedAt) {
                data.zeroReachedAt = Date.now();
              }
              // Guardamos el estado completo en AsyncStorage
              AsyncStorage.getItem(`temporizador-${id}`).then((savedStr) => {
                if (savedStr) {
                  const saved = JSON.parse(savedStr);
                  saved.zeroReachedAt = data.zeroReachedAt;
                  saved.finished = true;
                  AsyncStorage.setItem(`temporizador-${id}`, JSON.stringify(saved));
                }
              });
            }
          }
        });
        return nextState;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const algunTemporizadorIniciado = Object.values(temporizadores).some(
    (t) => t.intervalIndex !== 0 || t.activo || t.finished
  );
  
  const convertirAHorasMinutos = (hours, minutes) =>
    parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60;

const iniciarIntervalo = async (idPaciente, intervalIndex) => {
  const paciente = patientsWithIntervals.find(p => p.id === idPaciente);
  if (!paciente) return;

  // 1) Guardar hora de PLAY

 // 1) Guardar hora de PLAY solo en el primer intervalo
 if (intervalIndex === 0) {
   const now = new Date().toISOString();
   setPatientsWithIntervals(prev =>
     prev.map(p =>
       p.id === idPaciente
         ? { ...p, inicio: now }
         : p
     )
   );
   await AsyncStorage.setItem(`inicio-${idPaciente}`, now);
 }

  // 2) Si ya no hay más intervalos, salimos
  if (intervalIndex >= paciente.intervalos.length) {
    return;
  }

  // 3) Lógica de temporizadores (igual que antes)
  const { hours, minutes } = paciente.intervalos[intervalIndex].tiempo;
  const totalSegundos = Number(hours) * 3600 + Number(minutes) * 60;
  const startTime = Date.now();
  const horaInicio = new Date().toLocaleTimeString();

  await AsyncStorage.setItem(
    `temporizador-${idPaciente}`,
    JSON.stringify({
      startTime,
      intervalIndex,
      duration: totalSegundos,
      horaInicio,
      zeroReachedAt: null,
    })
  );

  setTemporizadores(prev => ({
    ...prev,
    [idPaciente]: {
      activo: true,
      tiempo: totalSegundos,
      finished: false,
      allFinished: false,
      intervalIndex,
      horaInicio,
      zeroReachedAt: null,
      notificationId: null,
    },
  }));

  if (totalSegundos > 59) {
    const endTime = startTime + totalSegundos * 1000;
    const triggerDate = new Date(endTime - 59_000);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ ¡Está por terminar el tiempo!',
        body: `Al paciente ${paciente.nombre} le falta poco para terminar.`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: 'alarm-channel',
        allowWhileIdle: true,
      },
    });

    setTemporizadores(prev => ({
      ...prev,
      [idPaciente]: {
        ...prev[idPaciente],
        notificationId,
      },
    }));
  }

  // 4) Actualizar horaInicio en el propio intervalo (opcional)
  setPatientsWithIntervals(prev =>
    prev.map(p =>
      p.id === idPaciente
        ? {
            ...p,
            intervalos: p.intervalos.map((intv, i) =>
              i === intervalIndex
                ? { ...intv, horaInicio }
                : intv
            ),
          }
        : p
    )
  );
};

 const registrarResultadoIntervalo = (idPaciente, outcome, tiempoRespuesta) => {
   setPatientsWithIntervals(prev =>
     prev.map(paciente => {
       if (paciente.id !== idPaciente) return paciente;

       // 1) Detecto índice y tipo de intervalo
       const currentIndex = temporizadores[idPaciente]?.intervalIndex ?? 0;
       const curInterval = paciente.intervalos[currentIndex];

       // 2) Si es "por días", salto sin grabar nada
       if (curInterval?.days > 0) return paciente;

       // 3) Si no, construyo el array de intervalos actualizado
       const nuevosIntervalos = paciente.intervalos.map((intervalo, idx) =>
         idx === currentIndex
           ? { ...intervalo, outcome, tiempoRespuesta }
           : intervalo
       );

       // 4) Persisto en AsyncStorage
       AsyncStorage.setItem(
         `intervalosTomados-${idPaciente}`,
         JSON.stringify(nuevosIntervalos)
       );

       // 5) Retorno el paciente con la lista de intervalos actualizada
       return { ...paciente, intervalos: nuevosIntervalos };
     })
   );
 };
const iniciarSiguienteIntervalo = async (idPaciente, outcome) => {
  console.log('▶️ iniciarSiguienteIntervalo llamado para', idPaciente, '– estado actual:', temporizadores[idPaciente]);

  // 1️⃣ Hora de respuesta
  const horaResp = new Date().toLocaleTimeString();

  // 2️⃣ Si llegó a cero, registramos en backend…
  const zeroTime = temporizadores[idPaciente]?.zeroReachedAt;
  if (zeroTime) {
    await registrarResultadoIntervalo(idPaciente, outcome, horaResp);

    // ——— 2a) Y guardamos outcome + tiempoRespuesta en patientsWithIntervals ———
    setPatientsWithIntervals(prev =>
      prev.map(p =>
        p.id === idPaciente
          ? {
              ...p,
              intervalos: p.intervalos.map((intv, i) =>
                i === temporizadores[idPaciente].intervalIndex
                  ? { 
                      ...intv,
                      outcome,               // "1" o "0"
                      tiempoRespuesta: horaResp
                    }
                  : intv
              )
            }
          : p
      )
    );
  }

  // 3️⃣ Estado actual del temporizador
  const data = temporizadores[idPaciente];
  if (!data) return;

  // 4️⃣ Índice siguiente
  const nextIndex = data.intervalIndex + 1;
  const paciente  = patientsWithIntervals.find(p => p.id === idPaciente);

  // 5️⃣ Si era el último intervalo, solo marcamos finished y allFinished
  if (!paciente || nextIndex >= paciente.intervalos.length) {
    console.log('🚨 Entré al último intervalo para', idPaciente);

    // Aquí dejamos el setTemporizadores para la UI
    setTemporizadores(prev => ({
      ...prev,
      [idPaciente]: {
        ...prev[idPaciente],
        activo:      false,
        tiempo:      0,
        finished:    true,
        allFinished: true,
        intervalIndex: nextIndex,
      }
    }));

    // Persistir en AsyncStorage si usas esa lógica
    const savedStr = await AsyncStorage.getItem(`temporizador-${idPaciente}`);
    if (savedStr) {
      const saved = JSON.parse(savedStr);
      saved.finished    = true;
      saved.allFinished = true;
      await AsyncStorage.setItem(
        `temporizador-${idPaciente}`,
        JSON.stringify(saved)
      );
    }
    return;
  }

  // 6️⃣ Si NO era el último, arrancamos el siguiente intervalo
  iniciarIntervalo(idPaciente, nextIndex);
};
 

// Esta es la función completa y corregida
  const exportarMatrices = async () => {
    // --- Evita doble clic ---
    if (isExporting) return;
    setIsExporting(true);

    try {
      // --- INICIO DE LA LÓGICA DE HOJAS ---
      
      const wb = XLSX.utils.book_new();

      // --- HOJA 1: DATOS GENERALES ---
      // (Esta hoja lista a todos los pacientes y sus datos demográficos)
      const cabeceraDatos = [
        // "ID Paciente",  // <-- Eliminado
        "Nombre", 
        "Sexo", 
        "Edad", 
        "Peso", 
        "Descripción", 
        "Grupo", 
        "Esquema Asignado"
      ];
      const filasDatos = patientsWithIntervals.map(p => [
        // p.id, // <-- Eliminado
        p.nombre, 
        p.sexo, 
        p.edad, 
        p.peso, 
        p.descripcion, 
        p.grupoName, 
        p.esquemaName || "N/A"
      ]);
      const ws_datos = XLSX.utils.aoa_to_sheet([cabeceraDatos, ...filasDatos]);
      XLSX.utils.book_append_sheet(wb, ws_datos, "Datos Generales");

      // --- HOJAS 2, 3...: UNA POR ESQUEMA ---
      
      // 1. Encontrar los esquemas que sí están en uso
      const esquemasEnUso = esquemas.filter(e => 
        patientsWithIntervals.some(p => p.esquemaId === e.id)
      );

      // 2. Crear una hoja para cada esquema
      for (const esquema of esquemasEnUso) {
        
        // Cabecera dinámica para este esquema
        const cabeceraEsquema = [
          // "ID Paciente", // <-- Eliminado
          "Nombre", 
          "Hora Inicio"
        ];
        
        // CORRECCIÓN: Usamos 'esquema.intervalos'
        (esquema.intervalos || []).forEach((intervalo, idx) => {
          cabeceraEsquema.push(`T${idx + 1} (${intervalo.nombre})`);
          cabeceraEsquema.push(`T${idx + 1} Hora Tomada`);
          cabeceraEsquema.push(`T${idx + 1} Resp (seg)`);
        });

        const filasEsquema = [];
        const pacientesDelEsquema = patientsWithIntervals.filter(p => p.esquemaId === esquema.id);
        
        for (const paciente of pacientesDelEsquema) {
          const timer = temporizadores[paciente.id];
          // CORRECCIÓN: Usamos 'timer.startTime' para la hora de inicio
          const horaInicio = timer?.startTime 
            ? new Date(timer.startTime).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            : "N/A";
            
          const filaPaciente = [
            // paciente.id, // <-- Eliminado
            paciente.nombre, 
            horaInicio
          ];
          
          (esquema.intervalos || []).forEach((intervalo, idx) => {
            const pIntervalo = paciente.intervalos[idx]; // Datos guardados del paciente
            
            const outcome = pIntervalo?.outcome == null ? "" : (pIntervalo.outcome === "1" ? "SI" : "NO");
            const horaTomada = pIntervalo?.horaInicio
              ? new Date(pIntervalo.horaInicio).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : "";
            const tiempoResp = pIntervalo?.tiempoRespuesta ?? "";

            filaPaciente.push(outcome);
            filaPaciente.push(horaTomada);
            filaPaciente.push(tiempoResp);
          });
          filasEsquema.push(filaPaciente);
        }
        
        const ws_esquema = XLSX.utils.aoa_to_sheet([cabeceraEsquema, ...filasEsquema]);
        const nombreHoja = esquema.nombre.substring(0, 30);
        XLSX.utils.book_append_sheet(wb, ws_esquema, nombreHoja);
      }
      
      // --- FIN DE LA LÓGICA DE HOJAS ---


      // 6. Generar el archivo Excel en formato Base64
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      // 7. Definir nombre y tipo
      const baseName = sampleName.replace(/\s+/g, "");
      const nombreArchivo = `${baseName}_Resultados.xlsx`;
      const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      // --- INICIO DE LA LÓGICA DE PREGUNTAR (Y LIMPIEZA CORREGIDA) ---

      const limpiarDatosYNavegar = async () => {
        // 1. Cancelar todas las notificaciones pendientes
        await Notifications.cancelAllScheduledNotificationsAsync();

        // 2. Buscar TODAS las claves dinámicas (timers, intervalos)
        const allKeys = await AsyncStorage.getAllKeys();
        const dynamicKeysToRemove = allKeys.filter(key => 
          key.startsWith('temporizador-') || 
          key.startsWith('intervalosTomados-')
        );

        // 3. Definir claves estáticas (los nombres de tus datos en context/storage)
        const staticKeysToRemove = [
          'grupos',       // O 'gruposData', como lo tengas guardado
          'pacientes',    // O 'pacientesData'
          'esquemas',     // O 'esquemasData' / 'intervalosData'
          'sampleName'
        ];
        
        // 4. Borrar TODO (dinámico y estático) de AsyncStorage
        await AsyncStorage.multiRemove([
            ...dynamicKeysToRemove,
            ...staticKeysToRemove
        ]);
  
        // 5. Resetear el estado global (Context)
        setGrupos([]);
        setPacientes([]);
        setEsquemas([]); 
        setSampleName("");
        setHideAddButtons(false); // <-- Importante: Muestra botones en inicio
        
        // 6. Navegar al inicio
        router.replace("/");
      };

      // (El resto de las funciones 'compartirArchivo' y 'guardarEnAlmacenamiento' 
      //  se quedan como las tenías)

      const compartirArchivo = async () => {
        try {
          const uri_cache = FileSystem.cacheDirectory + nombreArchivo;
          await FileSystem.writeAsStringAsync(uri_cache, wbout, {
            encoding: FileSystem.EncodingType.Base64
          });
          await Sharing.shareAsync(uri_cache, { mimeType, dialogTitle: 'Compartir Resultados (.xlsx)' });
          return true; // Éxito
        } catch (shareError) {
          console.error("Error al compartir:", shareError);
          Alert.alert("Error", "No se pudo compartir el archivo.");
          return false; // Fallo
        }
      };

      const guardarEnAlmacenamiento = async () => {
        if (Platform.OS !== 'android') return await compartirArchivo();
        try {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            const directoryUri = permissions.directoryUri;
            const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, nombreArchivo, mimeType);
            await FileSystem.writeAsStringAsync(fileUri, wbout, {
              encoding: FileSystem.EncodingType.Base64
            });
            Alert.alert("Éxito", `Archivo "${nombreArchivo}" guardado con éxito.`);
            return true;
          } else {
            Alert.alert("Cancelado", "No se seleccionó un directorio.");
            return false;
          }
        } catch (safError) {
          console.error("Error con StorageAccessFramework:", safError);
          Alert.alert("Error de guardado", "No se pudo guardar el archivo. Se intentará compartir como alternativa.");
          return await compartirArchivo();
        }
      };

      // --- Flujo principal (Preguntar al usuario - Sin cambios) ---
      if (Platform.OS === 'android') {
        Alert.alert(
          "Exportar Resultados",
          "¿Qué deseas hacer con el archivo?",
          [
            { text: "Cancelar", style: "cancel", onPress: () => setIsExporting(false) },
            {
              text: "Compartir",
              onPress: async () => {
                const completado = await compartirArchivo();
                if (completado) await limpiarDatosYNavegar();
                setIsExporting(false); 
              }
            },
            {
              text: "Guardar en Almacenamiento",
              onPress: async () => {
                const completado = await guardarEnAlmacenamiento();
                if (completado) await limpiarDatosYNavegar();
                setIsExporting(false);
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        // iOS
        const completado = await compartirArchivo();
        if (completado) await limpiarDatosYNavegar();
        setIsExporting(false);
      }

    } catch (e) {
      console.error("Error al exportar (fase de creación):", e);
      Alert.alert("Error", "No se pudo generar el archivo Excel.");
      setIsExporting(false);
    }
  };

const sinIniciar   = [];
const enCurso      = [];
const finalizados  = [];

patientsWithIntervals.forEach(p => {
  const temp = temporizadores[p.id] || {};
  const status = getStatus(p, temp, esquemas);
  if      (status === 'SIN_INICIAR')  sinIniciar.push(p);
  else if (status === 'CURSO')        enCurso.push(p);
  else if (status === 'FINALIZADO')   finalizados.push(p);
});

// 2) Preparamos los datos a mostrar según el filter
let dataToShow = [];

if (filter === 'SIN_INICIAR') {
  dataToShow = sinIniciar;
}
else if (filter === 'CURSO') {
  // a) separamos quienes ya cumplieron el tiempo y esperan confirmación (retardo)
  const retardo = enCurso.filter(p => {
    const t = temporizadores[p.id] || {};
    const isDayInterval = p.intervalos[t.intervalIndex]?.days > 0;
    return t.finished && !t.allFinished && !isDayInterval;
  });
  // b) el resto sigue con tiempo corriendo (restante)
  const restante = enCurso.filter(p => !retardo.includes(p));

  // c) ordenamos cada subgrupo
  // — Retardo: de mayor a menor espera
  retardo.sort((a, b) => {
    const waitedA = (Date.now() - temporizadores[a.id].zeroReachedAt) / 1000;
    const waitedB = (Date.now() - temporizadores[b.id].zeroReachedAt) / 1000;
    return waitedB - waitedA;
  });
  // — Restante: de menor a mayor segundos restantes
  restante.sort((a, b) => {
    const tA = temporizadores[a.id].tiempo;
    const tB = temporizadores[b.id].tiempo;
    return tA - tB;
  });

  // d) concatenamos para el orden final
  dataToShow = [...retardo, ...restante];
}
else if (filter === 'FINALIZADO') {
  dataToShow = finalizados;
}

// 3) Botón Terminar solo si TODOS están en finalizados
const showTerminar = finalizados.length === patientsWithIntervals.length;

return (

    <SafeAreaView style={styles.safeArea}>
      <View style={grupoStyles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={grupoStyles.backButton}>
          <MaterialIcons name="arrow-back" size={RFValue(24)} color="#333" />
        </TouchableOpacity>  
        <Text style={grupoStyles.headerTitle}>{sampleName || "Muestra Farmacológica"}</Text>  
        <TouchableOpacity 
          onPress={confirmarFin} 
          // 3. --- CAMBIO: Añadimos estilo para posicionar la 'X' ---
          style={{
            position: 'absolute',
            right: RFValue(15), // Ajusta 'right' (15 es un valor común)
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            padding: 5
          }}
        >
          <MaterialIcons name="close" size={RFValue(26)} color="#E53935" />
        </TouchableOpacity>  
      </View>  
     
     <View style={[styles.container, { alignItems: 'stretch' }]}>

        {/* 6. ELIMINADO: El <View style={extraccionesStyles.topBarCard}> (cabezal morado) se borra */}
        
        {/* 7. MOVIDO: Los filtros ahora van aquí, sobre fondo gris */}
        <View style={extraccionesStyles.filterRow}>
          {[
            ['SIN_INICIAR', 'SIN INICIAR'],
            ['CURSO', 'EN CURSO'],
            ['FINALIZADO', 'FINALIZADOS'],
          ].map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[
                extraccionesStyles.filterButton,
                filter === key && extraccionesStyles.filterButtonActive
              ]}
              onPress={() => setFilter(key)}
            >
              <Text
                style={[
                  extraccionesStyles.filterText,
                  filter === key && extraccionesStyles.filterTextActive
                ]}
              >
                {label}
              </Text>
              {filter === key && <View style={extraccionesStyles.filterUnderline}/>}
            </TouchableOpacity>
          ))}
        </View>
   
        {/* 8. CAMBIO: FlatList ajustado para el nuevo layout */}
<FlatList
          data={dataToShow}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            // ¡AHORA SÍ! Renderizamos solo el componente Paciente,
            // que ya tiene sus propios estilos de tarjeta.
            <Paciente
              paciente={item}
              temp={temporizadores[item.id]}
              grupos={grupos}
              handlePlay={handlePlay}
              iniciarSiguienteIntervalo={iniciarSiguienteIntervalo}
              highlightedId={highlightedId}
              setHighlightedId={setHighlightedId}
            />
          )}
        />

      </View>

      {/* 10. CAMBIO: Contenedor de botón inferior (de globalStyles) */}
      <View style={styles.bottomButtonContainer}>
        {showTerminar  && (
        <TouchableOpacity 
          // 11. CAMBIO: Usando estilo global
          style={styles.primaryButton} 
          onPress={exportarMatrices}
        >
          {/* 12. CAMBIO: Usando texto de botón global */}
          <Text style={styles.primaryButtonText}>Exportar Datos</Text>
        </TouchableOpacity>)}
      </View>
    </SafeAreaView>
    
  );
};

export default ExtraccionesScreen;
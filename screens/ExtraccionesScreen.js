import React, { useContext, useEffect,useState, useReducer } from "react";
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
function getStatus(paciente, timer) {
  const idx   = timer?.intervalIndex ?? 0;
  const active= timer?.activo === true;
  const fin   = timer?.finished === true;
  const done  = timer?.allFinished === true;
  const curInt= paciente.intervalos?.[idx] || {};
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
    intervalos,
    dataLoaded,
    setGrupos,
    setPacientes,
    setIntervalos,
    sampleName,
    setSampleName,
    temporizadores,       
    setTemporizadores  
  } = useContext(GlobalContext);
  const [patientsWithIntervals, setPatientsWithIntervals] = useState([]);
  const [filter, setFilter] = useState('SIN_INICIAR');
  const [isExporting, setIsExporting] = useState(false);

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
    if (!patientsWithIntervals.length) return;  // nada que recargar aún
  
    const loadPersisted = async () => {
      try {
        const recargados = await Promise.all(
          patientsWithIntervals.map(async p => {
            const [inicio, stored] = await Promise.all([
              AsyncStorage.getItem(`inicio-${p.id}`),
              AsyncStorage.getItem(`intervalosTomados-${p.id}`)
            ]);
            return {
              ...p,
              ...(inicio   ? { inicio }    : {}),
              ...(stored   ? { intervalos: JSON.parse(stored) } : {}),
            };
          })
        );
        setPatientsWithIntervals(recargados);
      } catch (e) {
        console.error("Error cargando persistencia:", e);
      }
    };
  
    loadPersisted();
  }, [patientsWithIntervals]);
  
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
  
  useEffect(() => {
    const nuevosPacientes = pacientes.map((p) => ({
      ...p,
      intervalos: intervalos.map((i) => ({
        ...i,
        tiempo: { ...i.tiempo },
        outcome: null,
        tiempoRespuesta: null,
      })),
    }));
    setPatientsWithIntervals(nuevosPacientes);
  }, [pacientes, intervalos]);

  useEffect(() => {
    const cargarPacientesConIntervalos = async () => {
      try {
        const data = await AsyncStorage.getItem('intervalosTomados');
        if (data) {
          const parsed = JSON.parse(data);
          setPatientsWithIntervals(parsed);
        } else {
          // Si no hay datos previos, armamos la estructura
          const nuevosPacientes = pacientes.map((p) => ({
            ...p,
            intervalos: intervalos.map((i) => ({
              ...i,
              tiempo: { ...i.tiempo },
              outcome: null,
            })),
          }));
          setPatientsWithIntervals(nuevosPacientes);
        }
      } catch (err) {
        console.error("Error cargando intervalos tomados:", err);
      }
    };
  
    cargarPacientesConIntervalos();
  }, [pacientes, intervalos]);
  
  useEffect(() => {
    const cargarTemporizadores = async () => {
      if (pacientes.length === 0) return;
  
      const nuevosTimers = {};
      const nuevosPatientsWithIntervals = [];
  
      for (const paciente of pacientes) {
        try {
          const dataStr = await AsyncStorage.getItem(`temporizador-${paciente.id}`);
          const intervalosTomadosStr = await AsyncStorage.getItem(`intervalosTomados-${paciente.id}`);
  
          let temporizadorGuardado = null;
          let intervalosGuardados = null;
  
          if (dataStr) {
            temporizadorGuardado = JSON.parse(dataStr);
          }
  
          if (intervalosTomadosStr) {
            intervalosGuardados = JSON.parse(intervalosTomadosStr);
          }
  
          // Calcular estado del temporizador si existe
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
  
          // Aplicar los intervalos tomados a cada paciente
          nuevosPatientsWithIntervals.push({
            ...paciente,
            intervalos: intervalos.map((i, idx) => {
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
  
      setTemporizadores(nuevosTimers);
      setPatientsWithIntervals(nuevosPatientsWithIntervals);
    };
  
    cargarTemporizadores();
  }, [pacientes]);
  
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
 

const exportarMatrices = async () => {
  // --- Evita doble clic ---
  if (isExporting) return;
  setIsExporting(true); // (1) Se pone en true

  try {
    // 1. Armar CSV datos (Tu código original - Sin cambios)
    const cabeceraDatos = ["Nombre", "Edad", "Sexo", "Peso", "Descripción", "Grupo"];
    const filasDatos = patientsWithIntervals.map(p => [
      p.nombre, p.edad, p.sexo, p.peso, p.descripcion, p.grupoName
    ]);
    const datosArray = [cabeceraDatos, ...filasDatos];

    // 2. Armar CSV muestreo (Tu código original - Sin cambios)
    const headerMuestreo = [
      "identificador",
      "inicio",
      ...intervalos.map((i, idx) => {
        if (i.tiempo.days > 0) return `t${idx + 1} ${i.tiempo.days}d`;
        const hh = String(i.tiempo.hours).padStart(2, "0");
        const mm = String(i.tiempo.minutes).padStart(2, "0");
        return `t${idx + 1} ${hh}:${mm}`;
      })
    ];
    const filasMuestreo = patientsWithIntervals.map(p => {
      const identificador = p.nombre;
      const inicio = p.inicio ? new Date(p.inicio).toLocaleTimeString() : "";
    
      const outcomes = p.intervalos.map(i => {
        if (i.outcome == null) return "";
        const symbol = i.outcome === "1" ? "si" : "no";
        const suffix = i.tiempoRespuesta ? ` (${i.tiempoRespuesta})` : "";
        return symbol + suffix;
      });
    
      return [identificador, inicio, ...outcomes];
    });
    const muestreoArray = [headerMuestreo, ...filasMuestreo];
    
    // 3, 4 y 5. Crear el libro de Excel (Tu código original - Sin cambios)
    const wb = XLSX.utils.book_new();
    const ws_datos = XLSX.utils.aoa_to_sheet(datosArray);
    const ws_muestreo = XLSX.utils.aoa_to_sheet(muestreoArray);
    XLSX.utils.book_append_sheet(wb, ws_datos, "Datos");
    XLSX.utils.book_append_sheet(wb, ws_muestreo, "Muestreo");

    // 6. Generar el archivo Excel en formato Base64 (Sin cambios)
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

    // 7. Definir nombre y tipo (Sin cambios)
    const baseName = sampleName.replace(/\s+/g, "");
    const nombreArchivo = `${baseName}_Resultados.xlsx`;
    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    // --- INICIO DE LA LÓGICA DE PREGUNTAR (NUEVO) ---

    // Función auxiliar para 'Limpieza' (Paso 10)
    // La movemos aquí para poder llamarla desde el Alert
    const limpiarDatosYNavegar = async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.multiRemove([
        "gruposData",
        "pacientesData",
        "intervalosData",
        ...patientsWithIntervals.map(p => `intervalosTomados-${p.id}`),
        ...patientsWithIntervals.map(p => `inicio-${p.id}`),
      ]);

      setGrupos([]);
      setPacientes([]);
      setIntervalos([]);
      setSampleName("");
      setHideAddButtons(false);
      router.replace("/");
    };

    // Función auxiliar para 'Compartir'
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

    // Función auxiliar para 'Guardar' (Android SAF)
    const guardarEnAlmacenamiento = async () => {
      // (Esta función asume que Platform.OS === 'android')
      try {
        // 1. Pedir permiso para ELEGIR un directorio (el usuario elegirá "Descargas")
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (permissions.granted) {
          // El usuario concedió permiso y eligió un directorio
          const directoryUri = permissions.directoryUri;

          // 2. Crear el archivo en ese directorio
          const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, nombreArchivo, mimeType);
          
          // 3. Escribir los datos (base64) en el archivo
          await FileSystem.writeAsStringAsync(fileUri, wbout, {
            encoding: FileSystem.EncodingType.Base64
          });
          
          Alert.alert("Éxito", `Archivo "${nombreArchivo}" guardado con éxito.`);
          return true; // Éxito

        } else {
          // El usuario canceló la selección de directorio
          Alert.alert("Cancelado", "No se seleccionó un directorio.");
          return false; // Cancelado por usuario
        }
      } catch (safError) {
        console.error("Error con StorageAccessFramework:", safError);
        Alert.alert("Error de guardado", "No se pudo guardar el archivo. Se intentará compartir como alternativa.");
        // Plan B: Si SAF falla, intentar 'Compartir'
        return await compartirArchivo();
      }
    };

    // --- Flujo principal (Preguntar al usuario) ---

    if (Platform.OS === 'android') {
      // En Android, damos ambas opciones
      Alert.alert(
        "Exportar Resultados",
        "¿Qué deseas hacer con el archivo?",
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => {
              // (2) Si cancela, solo re-habilita el botón
              setIsExporting(false);
            }
          },
          {
            text: "Compartir",
            onPress: async () => {
              const completado = await compartirArchivo();
              if (completado) {
                await limpiarDatosYNavegar();
              }
              setIsExporting(false); // (2) Re-habilita al terminar
            }
          },
          {
            text: "Guardar en Almacenamiento",
            onPress: async () => {
              const completado = await guardarEnAlmacenamiento();
              if (completado) {
                await limpiarDatosYNavegar();
              }
              setIsExporting(false); // (2) Re-habilita al terminar
            }
          }
        ],
        { cancelable: false } // Evita que se cierre al tocar fuera
      );
      // La función termina aquí para Android. (isExporting sigue true)
      // El 'setIsExporting(false)' se llama DENTRO de los 'onPress'.

    } else {
      // En iOS, solo compartimos (lógica original)
      const completado = await compartirArchivo();
      if (completado) {
        await limpiarDatosYNavegar();
      }
      setIsExporting(false); // (2) Re-habilita al terminar (iOS)
    }

  } catch (e) {
    // (3) Re-habilita si hay un error en la *creación* del Excel
    console.error("Error al exportar (fase de creación):", e);
    Alert.alert("Error", "No se pudo generar el archivo Excel.");
    setIsExporting(false);
  }
  // (4) Ya no hay 'finally', porque el estado 'isExporting'
  // se maneja de forma asíncrona dentro de los 'onPress' (Android)
  // o al final del bloque 'else' (iOS).
};

const sinIniciar   = [];
const enCurso      = [];
const finalizados  = [];

patientsWithIntervals.forEach(p => {
  const temp = temporizadores[p.id] || {};
  const status = getStatus(p, temp);
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
import React, { useContext, useEffect,useState, useReducer } from "react";
import { View, Text,  TouchableOpacity, FlatList, SafeAreaView, AppState,Platform,InteractionManager, Alert } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  // Si es all-day y venció, también lo tratamos como finalizado:
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
  const [filter, setFilter] = useState('NOT_STARTED');
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
    // --- NUEVO: Evita doble clic ---
    if (isExporting) return;
    setIsExporting(true);

    try {
      // 1. Armar CSV datos (Tu código original)
      const cabeceraDatos = ["Nombre", "Edad", "Sexo", "Peso", "Descripción", "Grupo"];
      const filasDatos = patientsWithIntervals.map(p => [
        p.nombre, p.edad, p.sexo, p.peso, p.descripcion, p.grupoName
      ]);
      // --- CAMBIO AQUÍ ---
      // Ya no lo convertimos a string, dejamos el array
      const datosArray = [cabeceraDatos, ...filasDatos];

      // 2. Armar CSV muestreo (Tu código original)
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
      // --- CAMBIO AQUÍ ---
      // Ya no lo convertimos a string, dejamos el array
      const muestreoArray = [headerMuestreo, ...filasMuestreo];
      
      const baseName = sampleName.replace(/\s+/g, "");

      // --- INICIO DE LA LÓGICA DE EXCEL (CORREGIDA) ---

      // 3. Crear un "Libro" (Workbook) de Excel
      const wb = XLSX.utils.book_new();

      // 4. Convertir tus Arrays en "Hojas" (Sheets)
      // --- CAMBIO AQUÍ ---
      const ws_datos = XLSX.utils.aoa_to_sheet(datosArray);
      // --- CAMBIO AQUÍ ---
      const ws_muestreo = XLSX.utils.aoa_to_sheet(muestreoArray);

      // 5. Añadir las hojas al libro con los nombres que quieras
      XLSX.utils.book_append_sheet(wb, ws_datos, "Datos");
      XLSX.utils.book_append_sheet(wb, ws_muestreo, "Muestreo");

      // 6. Generar el archivo Excel en formato Base64 (Sin cambios)
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      // 7. Definir la ruta del archivo (Sin cambios)
      const nombreArchivo = `${baseName}_Resultados.xlsx`;
      const uri = FileSystem.cacheDirectory + nombreArchivo;

      // 8. Escribir el archivo Excel en el caché (Sin cambios)
      await FileSystem.writeAsStringAsync(uri, wbout, {
        encoding: FileSystem.EncodingType.Base64
      });

      // 9. Compartir el archivo (SOLO SE LLAMA UNA VEZ) (Sin cambios)
      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Compartir Resultados (.xlsx)'
      });
      
      // 10. Limpiar y volver al Home (Tu código original - sin cambios)
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
      
    } catch (e) {
      console.error("Error al exportar:", e);
      Alert.alert("Error", "No se pudo generar o compartir el archivo Excel.");
    } finally {
      // 11. Pase lo que pase, re-habilita el botón (Sin cambios)
      setIsExporting(false);
    }
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

if (filter === 'NOT_STARTED') {
  dataToShow = sinIniciar;
}
else if (filter === 'RUNNING') {
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
else if (filter === 'DONE') {
  dataToShow = finalizados;
}

// 3) Botón Terminar solo si TODOS están en finalizados
const showTerminar = finalizados.length === patientsWithIntervals.length;

  return (
    
   <View style={extraccionesStyles.extraccionesScreenContainer}>
    
      <View style={extraccionesStyles.topBarCard}>
        <SafeAreaView>
          <Text style={extraccionesStyles.title}>Próximas Extracciones</Text>
          <Text style={extraccionesStyles.subtitle}>{sampleName}</Text>
        </SafeAreaView>
        <TouchableOpacity
            style={buttonStyles.backButton}
            onPress={() => router.push("esquema")}  // o navigation.goBack(), router.back(), etc.
            activeOpacity={0.7}
          >
          <MaterialIcons name="arrow-back" size={32} color="#fff" />
      </TouchableOpacity>

              {/* --- Botón rojo en la esquina superior --- */}
      <TouchableOpacity style={extraccionesStyles.abortButton} onPress={confirmarFin}  activeOpacity={0.7}> 
        <MaterialCommunityIcons name="close" size={24} color="rgb(0, 0, 0)" />
      </TouchableOpacity>


    <View style={extraccionesStyles.filterRow}>
      {[ 
        ['NOT_STARTED','Sin Iniciar'],
        ['RUNNING',  'En curso'],
        ['DONE',     'Finalizados'],
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
    </View>
   
      <FlatList
        data={dataToShow}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
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
        contentContainerStyle={{ padding: 16, paddingHorizontal: 16 }}
      />

      <View style={extraccionesStyles.botonesContainer}>
        {showTerminar  && (
        <TouchableOpacity style={buttonStyles.button} onPress={exportarMatrices}>
          <Text style={extraccionesStyles.title}>Exportar Datos</Text>
        </TouchableOpacity>)}
      </View>
    </View>
    
  );
};

export default ExtraccionesScreen;
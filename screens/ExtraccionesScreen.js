import React, { useContext, useEffect, useState, useReducer } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, SafeAreaView, AppState,Platform, StyleSheet} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "../styles/globalStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlobalContext } from "../GlobalProvider";
import buttonStyles from '../styles/buttonStyles';
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Notifications from 'expo-notifications';


// Función para formatear un tiempo dado en segundos (usada para otros tiempos)
const formatTiempo = (segundos) => {
  if (segundos < 60) return `${segundos}s`;
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `${minutos}m`;
  const horas = Math.floor(minutos / 60);
  return `${horas}h`;
};

// Función que calcula y formatea el tiempo transcurrido (retardo) a partir de zeroReachedAt
const formatRetardo = (zeroReachedAt) => {
  if (!zeroReachedAt) return "0s";
  
  const elapsed = Math.floor((Date.now() - zeroReachedAt) / 1000);
  
  const horas = Math.floor(elapsed / 3600);
  const minutos = Math.floor((elapsed % 3600) / 60);
  const segundos = elapsed % 60;
  
  if (horas > 0) return `${horas}h ${minutos}m ${segundos}s`;
  if (minutos > 0) return `${minutos}m ${segundos}s`;
  return `${segundos}s`;
};

const ExtraccionesScreen = () => {
  const router = useRouter();
  const {
    grupos,
    pacientes,
    intervalos,
    dataLoaded,
    setGrupos,
    setPacientes,
    setIntervalos,
    sampleName,
    setSampleName,
  } = useContext(GlobalContext);
  const [patientsWithIntervals, setPatientsWithIntervals] = useState([]);
  const [temporizadores, setTemporizadores] = useState({});

  // Utilizamos useReducer para forzar un re-render cada segundo.
  // Cada vez que se llama a forceUpdate() se actualiza un estado interno que no usamos,
  // lo que provoca que React vuelva a renderizar el componente.
  const [, forceUpdate] = useReducer(x => x + 1, 0);

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
    const paciente = patientsWithIntervals.find((p) => p.id === idPaciente);
    if (!paciente) return;
  
    // —————— 1) Loguear el inicio ——————
    const now = new Date().toISOString();
    console.log(`▶️ [${paciente.nombre}] Inicio a ${now}`);
  
    // —————— 2) Guardar el inicio en el paciente ——————
    setPatientsWithIntervals(prev =>
      prev.map(p =>
        p.id === idPaciente
          ? { 
              ...p, 
              inicio: now   // campo que luego usarás en exportarMatrices
            }
          : p
      )
    );
    
     // Persistir la hora de inicio
     AsyncStorage.setItem(`inicio-${idPaciente}`, now);

    // —————— 3) Lógica existente de temporizadores ——————
    if (intervalIndex >= paciente.intervalos.length) {
      setTemporizadores((prev) => ({
        ...prev,
        [idPaciente]: {
          activo: false,
          finished: true,
          allFinished: true,
          intervalIndex: paciente.intervalos.length,
          tiempo: 0,
        },
      }));
      return;
    }
  
    const intervaloActual = paciente.intervalos[intervalIndex];
    const { hours, minutes } = intervaloActual.tiempo;
    const totalSegundos = parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60;
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
      const endTime     = startTime + totalSegundos * 1000;
      const triggerDate = new Date(endTime -   59_000); // 59 s antes
    
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ ¡Esta por terminar el tiempo',
          body:  `Al paciente ${paciente.nombre} le falta poco para terminar.`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type:      Notifications.SchedulableTriggerInputTypes.DATE,
          date:      triggerDate,
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
    
    
  
    // Actualizamos la hora de inicio en el array de intervalos
    setPatientsWithIntervals((prev) =>
      prev.map((paciente) => {
        if (paciente.id === idPaciente) {
          return {
            ...paciente,
            intervalos: paciente.intervalos.map((intervalo, index) =>
              index === intervalIndex
                ? {
                    ...intervalo,
                    horaInicio,
                  }
                : intervalo
            ),
          };
        }
        return paciente;
      })
    );
  };
  
  const activarTemporizador = (idPaciente) => {
    const data = temporizadores[idPaciente];
    if (data?.activo && !data?.finished) return;
    iniciarIntervalo(idPaciente, 0);
  };

  const registrarResultadoIntervalo = (idPaciente, outcome, tiempoRespuesta) => {
    setPatientsWithIntervals((prev) => {
      const nuevosPacientes = prev.map((paciente) => {
        if (paciente.id === idPaciente) {
          const currentIndex = temporizadores[idPaciente]?.intervalIndex ?? 0;
          const nuevosIntervalos = paciente.intervalos.map((intervalo, index) =>
            index === currentIndex
            ? { ...intervalo, 
            outcome,
            tiempoRespuesta /* que ahora es "HH:MM:SS" */ }
            : intervalo
          );
  
          AsyncStorage.setItem(
            `intervalosTomados-${idPaciente}`,
            JSON.stringify(nuevosIntervalos)
          );
  
          return {
            ...paciente,
            intervalos: nuevosIntervalos,
          };
        }
        return paciente;
      });
      return nuevosPacientes;
    });
  };
  
  const iniciarSiguienteIntervalo = async (idPaciente, outcome) => {
    // 1️⃣ Calculamos la hora exacta de respuesta una sola vez
    const horaResp = new Date().toLocaleTimeString();
  
    // 2️⃣ Si ya llegó a cero, registramos el resultado de este intervalo
    const zeroTime = temporizadores[idPaciente]?.zeroReachedAt;
    if (zeroTime) {
      const nombre = patientsWithIntervals.find(p => p.id === idPaciente)?.nombre;
      const idx    = temporizadores[idPaciente].intervalIndex + 1;
      console.log(`⏰ [${nombre}] Intervalo ${idx} respuesta a ${horaResp}`);
      await registrarResultadoIntervalo(idPaciente, outcome, horaResp);
    }
  
    // 3️⃣ Traemos el estado actual del temporizador
    const data = temporizadores[idPaciente];
    if (!data) return;
  
    // 4️⃣ Preparamos el índice del siguiente intervalo
    const nextIndex = data.intervalIndex + 1;
    const paciente  = patientsWithIntervals.find(p => p.id === idPaciente);
  
    // 5️⃣ Si era el último intervalo, marcamos como finished y salimos
    if (!paciente || nextIndex >= paciente.intervalos.length) {
      // 5.1️⃣ Registramos de nuevo el resultado del último intervalo
      await registrarResultadoIntervalo(idPaciente, outcome, horaResp);
  
      // 5.2️⃣ Marcamos el temporizador como terminado en memoria
      setTemporizadores(prev => ({
        ...prev,
        [idPaciente]: {
          ...prev[idPaciente],
          activo:     false,
          tiempo:     0,
          finished:   true,
          allFinished:true,
        },
      }));
  
      // 5.3️⃣ Persistimos el estado "finished" del temporizador
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
  
    // 6️⃣ Si no era el último, arrancamos el siguiente
    iniciarIntervalo(idPaciente, nextIndex);
  };
  
  
  // const exportarMatriz = async () => {
  //   const cabecera = [
  //     "Nombre",
  //     "Edad",
  //     "Sexo",
  //     "Peso",
  //     "Descripción",
  //     "Grupo",
  //     ...intervalos.map((_, i) => `Intervalo ${i + 1}`)
  //   ];
  
  //   const filas = patientsWithIntervals.map((p) => {
  //     const fila = [
  //       p.nombre,
  //       p.edad,
  //       p.sexo,
  //       p.peso,
  //       p.descripcion,
  //       p.grupoName
  //     ];
    
  //     p.intervalos.forEach((i) => {
  //       const symbol = i.outcome === "1" ? "si" : "no";
  //       const suffix = i.tiempoRespuesta != null
  //         ? ` (${formatTiempo(i.tiempoRespuesta)})`
  //         : "";
  //       fila.push(`${symbol}${suffix}`);
  //     });
    
  //     return fila;
  //   });
    
  
  //   const matriz = [cabecera, ...filas];
  //   const csvString = matriz.map((fila) => fila.join(",")).join("\n");
  
  //   const baseName = sampleName.replace(/\s+/g, "");
  //   const fileUri  = FileSystem.documentDirectory + `${baseName}.csv`;
  
  //   await FileSystem.writeAsStringAsync(fileUri, csvString, { encoding: FileSystem.EncodingType.UTF8 });
  
  //   try {
  //     await Sharing.shareAsync(fileUri, {
  //       mimeType: "text/csv",
  //       dialogTitle: "Compartir matriz CSV",
  //     });
  //   } catch (error) {
  //     console.error("Error al compartir CSV:", error);
  //   }
  
  //   try {
  //     await AsyncStorage.multiRemove([
  //       "gruposData",
  //       "pacientesData",
  //       "intervalosData",
  //       "intervalosTomados",
  //       ...patientsWithIntervals.map((p) => `temporizador-${p.id}`),
  //     ]);
  //     setGrupos([]);
  //     setPacientes([]);
  //     setIntervalos([]);
  //     setSampleName("");    
  //     router.push("/");
  //   } catch (err) {
  //     console.error("Error al limpiar persistencia:", err);
  //   }
  // };
  const exportarMatrices = async () => {

    console.log("📋 exportarMatrices | patientsWithIntervals:", patientsWithIntervals);
    // ————————————————————————————
    // 1) CSV “Datos completos”
    // ————————————————————————————
  
    // 1.1) Cabecera y filas de datos
    const cabeceraDatos = ["Nombre","Edad","Sexo","Peso","Descripción","Grupo"];
    const filasDatos = patientsWithIntervals.map(p => [
      p.nombre,
      p.edad,
      p.sexo,
      p.peso,
      p.descripcion,
      p.grupoName
    ]);
  
    // 1.2) String CSV y URI
    const csvDatos = [ cabeceraDatos, ...filasDatos ]
      .map(f => f.join(","))
      .join("\n");
    const baseName = sampleName.replace(/\s+/g, "");
    const uriDatos = FileSystem.documentDirectory + `${baseName}_datos.csv`;
  
    // 1.3) Escribir y compartir “Datos completos”
    await FileSystem.writeAsStringAsync(uriDatos, csvDatos, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(uriDatos, {
      mimeType:   "text/csv",
      dialogTitle:"Compartir datos CSV"
    });
  
    // ————————————————————————————
    // 2) CSV “Muestreo” (solo outcomes)
    // ————————————————————————————
  
    // 2.1) Derivar el array de duraciones de cada intervalo
    //     asumo intervalos = [{ duration: 5 }, { duration: 10 }, …]
    const labels = intervalos.map(i => {
      const h = String(i.tiempo.hours).padStart(2, '0');
      const m = String(i.tiempo.minutes).padStart(2, '0');
      return `${h}:${m}`;            // por ejemplo "00:01"
    });
  
    // 2.2) Armar el encabezado
    //     ["identificador","inicio","t1 5 min","t2 10 min",…]
    const headerMuestreo = [
      "identificador",
      "inicio",
      ...labels.map((time, idx) => `t${idx+1} ${time}`)
    ];
  
    // 2.3) Construir las filas de muestreo
    //     Cada fila: [p.id, p.startTime, resultado1, resultado2, …]
    const filasMuestreo = patientsWithIntervals.map(p => {
      const identificador = p.nombre;             // o p.nombre, lo que prefieras
      const inicio = p.inicio
        ? new Date(p.inicio).toLocaleTimeString()
        : "";
  
      const outcomes = p.intervalos.map(i => {
        const symbol = i.outcome === "1" ? "si" : "no";
         // i.tiempoRespuesta ya es un string "HH:MM:SS"
        const suffix = i.tiempoRespuesta
         ? ` (${i.tiempoRespuesta})`
         : "";
        return `${symbol}${suffix}`;
      });
  
      return [ identificador, inicio, ...outcomes ];
    });
  
    // 2.4) Generar el CSV de muestreo y URI
    const matrizMuestreo = [ headerMuestreo, ...filasMuestreo ];
    const csvMuestreo = matrizMuestreo
      .map(fila => fila.join(","))
      .join("\n");
    const uriMuestreo = FileSystem.documentDirectory + `${baseName}_muestreo.csv`;
  
    // 2.5) Escribir y compartir “Muestreo”
    await FileSystem.writeAsStringAsync(uriMuestreo, csvMuestreo, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(uriMuestreo, {
      mimeType:   "text/csv",
      dialogTitle:"Compartir muestreo CSV"
    });
  
    // ————————————————————————————
    // 3) Limpiar persistencia y volver al Home
    // ————————————————————————————
    await AsyncStorage.multiRemove([
  "gruposData",
  "pacientesData",
  "intervalosData",
  // borramos cada key de intervalosTomados-<id>
  ...patientsWithIntervals.map(p => `intervalosTomados-${p.id}`),
  // borramos cada key de inicio-<id>
  ...patientsWithIntervals.map(p => `inicio-${p.id}`),
  // si seguís usando temporizador-(id) para otra cosa, lo dejás
  ...patientsWithIntervals.map(p => `temporizador-${p.id}`),
]);

    setGrupos([]);
    setPacientes([]);
    setIntervalos([]);
    setSampleName("");
    router.replace("/");
  };
  
  
  const renderPaciente = ({ item: paciente }) => {
    const temp = temporizadores[paciente.id];
    const tiempoRestante = temp ? temp.tiempo : 0;
    const minutosRestantes = Math.floor(tiempoRestante / 60);
    const segundosRestantes = tiempoRestante % 60;
    const currentIndex = temp?.intervalIndex ?? 0;
    const totalIntervals = paciente.intervalos.length;
    const safeDisplayedIndex = Math.min(currentIndex + 1, totalIntervals);
    const muestraTexto = `muestra: ${safeDisplayedIndex}/${totalIntervals}`;
    const grupo = grupos.find(g => g.name === paciente.grupoName);
    const bgColor = grupo?.color ?? "#EEE";

    // Índice del intervalo actual (0-based)
//const currentIndex = temporizadores[paciente.id]?.intervalIndex ?? 0;

// Label fijo “HH:MM” sacado de tu definición de intervalos
const intervaloActual = intervalos[currentIndex] || { tiempo: { hours: '00', minutes: '00' } };
const hh = String(intervaloActual.tiempo.hours).padStart(2, '0');
const mm = String(intervaloActual.tiempo.minutes).padStart(2, '0');
const labelTime = `${hh}:${mm}`;


    return (
      <View style={[styles.extraccionContainerE, { backgroundColor: bgColor }]}>
        <Text style={styles.muestraText}>{muestraTexto} – {labelTime}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
          <View style={styles.infoContainerE}>
            <Text style={styles.labelE}>Individuo</Text>
            <View style={styles.inputBoxE}>
              <Text style={styles.inputTextE}>{paciente.nombre || "Sin nombre"}</Text>
            </View>
          </View>
          <View style={styles.infoContainerE}>
            <Text style={styles.labelE}>Grupo</Text>
            <View style={styles.inputBoxE}>
              <Text style={styles.inputTextE}>{paciente.grupoName}</Text>
            </View>
          </View>
          {temp?.allFinished ? (
            <MaterialCommunityIcons name="check-circle-outline" size={32} color="#fff" />
          ) : (
            !temp?.activo &&
            !temp?.finished && (
              <TouchableOpacity onPress={() => iniciarIntervalo(paciente.id, 0)}>
                <MaterialCommunityIcons name="play-circle-outline" size={32} color="#fff" />
              </TouchableOpacity>
            )
          )}
        </View>

        {temp?.activo && !temp?.finished && (
         <View style={styles.timerContainer}>
 
            <Text style={styles.timerText}>
              tiempo restante: {minutosRestantes.toString().padStart(2, "0")}:
              {segundosRestantes.toString().padStart(2, "0")}
            </Text>
          </View>
        )}

        {temp?.finished && !temp?.allFinished && (
          <View style={styles.confirmContainerExtracciones}>
            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>
                tiempo de retardo: {formatRetardo(temp.zeroReachedAt)}
              </Text>
            </View>
            <View style={styles.buttonsRowExtracciones}>
              <TouchableOpacity
                  style={[
                    styles.confirmButtonExtracciones,
                    { backgroundColor: bgColor }
                  ]}
                onPress={() => iniciarSiguienteIntervalo(paciente.id, "1")}
              >
                 {/* Capa negra al 20% para oscurecer */}
              <View style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderRadius: 8
                }}
              />

                <MaterialCommunityIcons name="check" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                  style={[
                    styles.cancelButtonExtracciones,
                    { backgroundColor: bgColor }
                  ]}
                onPress={() => iniciarSiguienteIntervalo(paciente.id, "0")}
              >
                 {/* Capa negra al 20% para oscurecer */}
              <View style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderRadius: 8
                }}
              />

                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // const allPatientsFinished = patientsWithIntervals.length > 0 && patientsWithIntervals.every((p) => {
  //   const data = temporizadores[p.id];
  //   return data ? data.allFinished === true : true;
  // });
  const allPatientsFinished =
  pacientes.length > 0 &&
  pacientes.every((p) => temporizadores[p.id]?.allFinished === true);

  const sortedPatients = [...patientsWithIntervals].sort((a, b) => {
    const dataA = temporizadores[a.id];
    const dataB = temporizadores[b.id];
    const finishedA = dataA?.allFinished ? 1 : 0;
    const finishedB = dataB?.allFinished ? 1 : 0;
    if (finishedA !== finishedB) return finishedA - finishedB;
    const timeA = dataA?.tiempo ?? Infinity;
    const timeB = dataB?.tiempo ?? Infinity;
    return timeA - timeB;
  });

  return (
    <View style={styles.extraccionesScreenContainer}>
      <SafeAreaView >
        <View style={styles.headerContainerE}>
          <Text style={styles.headerText}>Próximas Extracciones : </Text>
          <Text style={styles.headerText}>{sampleName} </Text>
        </View>
      </SafeAreaView>

      <FlatList
        data={sortedPatients}
        keyExtractor={(item) => item.id}
        renderItem={renderPaciente}
        contentContainerStyle={{ padding: 16 }}
      />
  
      <View style={styles.botonesContainer}>
        <TouchableOpacity onPress={() => router.push("esquema")}>
          <Text style={styles.botonesI}>VOLVER</Text>
        </TouchableOpacity>
        
        {allPatientsFinished && (
        <TouchableOpacity style={buttonStyles.button} onPress={exportarMatrices}>
          <Text style={styles.botonesD}>Terminar</Text>
        </TouchableOpacity>
)}

      </View>
    </View>
    
  );
};

export default ExtraccionesScreen;
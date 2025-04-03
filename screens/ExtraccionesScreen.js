import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, SafeAreaView } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import styles from "../styles/globalStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlobalContext } from "../GlobalProvider";

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const formatTiempo = (segundos) => {
  if (segundos < 60) return `${segundos}s`;
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `${minutos}m`;
  const horas = Math.floor(minutos / 60);
  return `${horas}h`;
};


const ExtraccionesScreen = () => {
  const router = useRouter();
  const {
    pacientes,
    intervalos,
    dataLoaded,
    setGrupos,
    setPacientes,
    setIntervalos,
  } = useContext(GlobalContext);

  const [patientsWithIntervals, setPatientsWithIntervals] = useState([]);
  const [temporizadores, setTemporizadores] = useState({});
  

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
          // si no hay datos previos, armamos la estructura
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
            const { startTime, intervalIndex, duration, zeroReachedAt } = temporizadorGuardado;
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(duration - elapsed, 0);
  
            nuevosTimers[paciente.id] = {
              activo: remaining > 0,
              tiempo: remaining,
              finished: remaining === 0,
              allFinished: false,
              intervalIndex,
              zeroReachedAt,
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
            
              if (!data.zeroReachedAt) {
                data.zeroReachedAt = Date.now();
              
                // ✅ Guardar en AsyncStorage para persistir
                AsyncStorage.getItem(`temporizador-${id}`).then((savedStr) => {
                  if (savedStr) {
                    const saved = JSON.parse(savedStr);
                    saved.zeroReachedAt = data.zeroReachedAt;
                    AsyncStorage.setItem(`temporizador-${id}`, JSON.stringify(saved));
                  }
                });
              }
              
            }                       
          }
        });
        return nextState;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const convertirAHorasMinutos = (hours, minutes) =>
    parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60;

  const iniciarIntervalo = async (idPaciente, intervalIndex) => {
    const paciente = patientsWithIntervals.find((p) => p.id === idPaciente);
    if (!paciente) return;
  
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
    const horaInicio = new Date().toLocaleTimeString(); // ej: "14:32:51"
  
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
  
    setTemporizadores((prev) => ({
      ...prev,
      [idPaciente]: {
        activo: true,
        tiempo: totalSegundos,
        finished: false,
        allFinished: false,
        intervalIndex,
        horaInicio,
        zeroReachedAt: null,
      },
    }));
  
    // Guardamos también visualmente la hora legible dentro del array de intervalos
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
      const actualizados = prev.map((paciente) => {
        if (paciente.id === idPaciente) {
          const currentIndex = temporizadores[idPaciente]?.intervalIndex ?? 0;
          return {
            ...paciente,
            intervalos: paciente.intervalos.map((intervalo, index) =>
              index === currentIndex
                ? {
                    ...intervalo,
                    outcome,
                    tiempoRespuesta,
                  }
                : intervalo
            ),
          };
        }
        return paciente;
      });
  
      AsyncStorage.setItem('intervalosTomados', JSON.stringify(actualizados));
      return actualizados;
    });
  };
    
  const iniciarSiguienteIntervalo = (idPaciente, outcome) => {
    const zeroTime = temporizadores[idPaciente]?.zeroReachedAt;
    let tiempoRespuesta = null;
  
    if (zeroTime) {
      tiempoRespuesta = Math.floor((Date.now() - zeroTime) / 1000);
      console.log(`⏰ Paciente ${idPaciente} tardó ${tiempoRespuesta} segundos en responder`);
    }
  
    registrarResultadoIntervalo(idPaciente, outcome, tiempoRespuesta);
  
    const data = temporizadores[idPaciente];
    if (!data) return;
  
    const nextIndex = data.intervalIndex + 1;
    iniciarIntervalo(idPaciente, nextIndex);
  };
  
  const exportarMatriz = async () => {
    const cabecera = ["Paciente", ...intervalos.map((_, i) => `Intervalo ${i + 1}`)];
  
    const filas = patientsWithIntervals.map((p) => {
      const fila = [p.nombre];
      p.intervalos.forEach((i) => {
        if (i.outcome === "1") {
          const tiempo = i.tiempoRespuesta != null ? `✔ (${formatTiempo(i.tiempoRespuesta)})` : "✔";
          fila.push(tiempo);
        } else if (i.outcome === "0") {
          fila.push("❌");
        } else {
          fila.push("-");
        }
      });
      return fila;
    });
  
    const matriz = [cabecera, ...filas];
    const csvString = matriz.map((fila) => fila.join(",")).join("\n");
  
    const fileUri = FileSystem.documentDirectory + "matriz.csv";
    await FileSystem.writeAsStringAsync(fileUri, csvString, { encoding: FileSystem.EncodingType.UTF8 });
  
    try {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Compartir matriz CSV",
      });
    } catch (error) {
      console.error("Error al compartir CSV:", error);
    }
  
    try {
      await AsyncStorage.multiRemove([
        "gruposData",
        "pacientesData",
        "intervalosData",
        "intervalosTomados",
        ...patientsWithIntervals.map((p) => `temporizador-${p.id}`),
      ]);
      setGrupos([]);
      setPacientes([]);
      setIntervalos([]);
      router.push("/");
    } catch (err) {
      console.error("Error al limpiar persistencia:", err);
    }
  };
  
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
  
  

  const renderPaciente = ({ item: paciente }) => {
    const temp = temporizadores[paciente.id];
    const tiempoRestante = temp ? temp.tiempo : 0;
    const minutosRestantes = Math.floor(tiempoRestante / 60);
    const segundosRestantes = tiempoRestante % 60;
    const currentIndex = temp?.intervalIndex ?? 0;
    const totalIntervals = paciente.intervalos.length;
    const safeDisplayedIndex = Math.min(currentIndex + 1, totalIntervals);
    const muestraTexto = `muestra: ${safeDisplayedIndex}/${totalIntervals}`;

    return (
      <View style={styles.extraccionContainerE}>
        <Text style={styles.muestraText}>{muestraTexto}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
          <View style={styles.infoContainerE}>
            <Text style={styles.labelE}>Paciente</Text>
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
              <TouchableOpacity onPress={() => activarTemporizador(paciente.id)}>
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
    <Text style={styles.timerText}>
      tiempo de retardo: {formatRetardo(temp.zeroReachedAt)}
    </Text>
    <View style={styles.buttonsRowExtracciones}>
      <TouchableOpacity
        style={styles.confirmButtonExtracciones}
        onPress={() => iniciarSiguienteIntervalo(paciente.id, "1")}
      >
        <MaterialCommunityIcons name="check" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cancelButtonExtracciones}
        onPress={() => iniciarSiguienteIntervalo(paciente.id, "0")}
      >
        <MaterialCommunityIcons name="close" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>
)}

      </View>
    );
  };

  const allPatientsFinished =
    patientsWithIntervals.length > 0 &&
    patientsWithIntervals.every((p) => {
      const data = temporizadores[p.id];
      return data ? data.allFinished === true : true;
    });

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
      <SafeAreaView style={{ backgroundColor: "#873B8C" }}>
        <View style={styles.headerContainerE}>
          <Text style={styles.headerText}>Próximas Extracciones</Text>
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
        <TouchableOpacity onPress={exportarMatriz}>
          <Text style={styles.botonesD}>Terminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
};

export default ExtraccionesScreen;

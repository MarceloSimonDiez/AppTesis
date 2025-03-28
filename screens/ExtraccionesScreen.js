import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, SafeAreaView } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import styles from "../styles/globalStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlobalContext } from "../GlobalProvider";

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
      })),
    }));
    setPatientsWithIntervals(nuevosPacientes);
  }, [pacientes, intervalos]);

  useEffect(() => {
    const cargarTemporizadores = async () => {
      const nuevosTimers = {};

      for (const paciente of pacientes) {
        try {
          const dataStr = await AsyncStorage.getItem(`temporizador-${paciente.id}`);
          if (dataStr) {
            const { startTime, intervalIndex, duration } = JSON.parse(dataStr);
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(duration - elapsed, 0);

            nuevosTimers[paciente.id] = {
              activo: remaining > 0,
              tiempo: remaining,
              finished: remaining === 0,
              allFinished: false,
              intervalIndex,
            };
          }
        } catch (e) {
          console.warn("Error cargando temporizador:", e);
        }
      }

      setTemporizadores(nuevosTimers);
    };

    cargarTemporizadores();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTemporizadores((prev) => {
        const nextState = { ...prev };
        Object.keys(nextState).forEach((id) => {
          const data = nextState[id];
          if (data.activo && !data.finished && !data.allFinished) {
            if (data.tiempo > 0) {
              data.tiempo -= 1;
            } else {
              data.tiempo = 0;
              data.activo = false;
              data.finished = true;
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
    const totalSegundos = convertirAHorasMinutos(hours, minutes);
    const startTime = Date.now();

    await AsyncStorage.setItem(
      `temporizador-${idPaciente}`,
      JSON.stringify({ startTime, intervalIndex, duration: totalSegundos })
    );

    setTemporizadores((prev) => ({
      ...prev,
      [idPaciente]: {
        activo: true,
        tiempo: totalSegundos,
        finished: false,
        allFinished: false,
        intervalIndex,
      },
    }));
  };

  const activarTemporizador = (idPaciente) => {
    const data = temporizadores[idPaciente];
    if (data?.activo && !data?.finished) return;
    iniciarIntervalo(idPaciente, 0);
  };

  const registrarResultadoIntervalo = (idPaciente, outcome) => {
    setPatientsWithIntervals((prev) =>
      prev.map((paciente) => {
        if (paciente.id === idPaciente) {
          const currentIndex = temporizadores[idPaciente]?.intervalIndex ?? 0;
          return {
            ...paciente,
            intervalos: paciente.intervalos.map((intervalo, index) =>
              index === currentIndex ? { ...intervalo, outcome } : intervalo
            ),
          };
        }
        return paciente;
      })
    );
  };

  const iniciarSiguienteIntervalo = (idPaciente, outcome) => {
    registrarResultadoIntervalo(idPaciente, outcome);
    const data = temporizadores[idPaciente];
    if (!data) return;
    const nextIndex = data.intervalIndex + 1;
    iniciarIntervalo(idPaciente, nextIndex);
  };

  const exportarMatriz = async () => {
    const cabecera = ["Paciente", ...intervalos.map((i) => `${i.tiempo.hours}:${i.tiempo.minutes}`)];
    const filas = patientsWithIntervals.map((p) => {
      const fila = [p.nombre];
      p.intervalos.forEach((i) => {
        fila.push(i.outcome ?? `${i.tiempo.hours}:${i.tiempo.minutes}`);
      });
      return fila;
    });
    const matriz = [cabecera, ...filas];
    const texto = matriz.map((fila) => fila.join(" | ")).join("\n");

    Alert.alert("Matriz exportada", texto, [
      {
        text: "OK",
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove([
              "gruposData",
              "pacientesData",
              "intervalosData",
              ...patientsWithIntervals.map((p) => `temporizador-${p.id}`),
            ]);
            console.log("✔️ Todos los datos fueron eliminados");

            // Limpiar memoria
            setGrupos([]);
            setPacientes([]);
            setIntervalos([]);

            router.push("/");
          } catch (err) {
            console.error("Error al limpiar persistencia:", err);
          }
        },
      },
    ]);
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
            <Text style={styles.timerText}>tiempo restante: 00:00</Text>
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
  
      {allPatientsFinished && (
        <TouchableOpacity style={{ alignSelf: "center", marginBottom: 16 }} onPress={exportarMatriz}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Exportar Matriz</Text>
        </TouchableOpacity>
      )}
  
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

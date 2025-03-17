import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useRouter, useLocalSearchParams } from "expo-router";
import styles from "../styles/globalStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';


const ExtraccionesScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // 1) Parseamos los parámetros solo una vez
  const pacientes = params.pacientes ? JSON.parse(params.pacientes) : [];
  const intervalos = params.intervalos ? JSON.parse(params.intervalos) : [];

  // 2) Calculamos "patientsWithIntervals" UNA SOLA VEZ al iniciar el estado
  const [patientsWithIntervals, setPatientsWithIntervals] = useState(() => {
    return pacientes.map((p) => ({
      ...p,
      intervalos: intervalos.map((i) => ({
        ...i,
        tiempo: { ...i.tiempo },
        outcome: null,
      })),
    }));
  });

  const [temporizadores, setTemporizadores] = useState({});

  // 3) Manejo del conteo regresivo global (igual que antes)
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

  // --- Funciones para intervalos y exportar, igual que antes ---

  const convertirAHorasMinutos = (hours, minutes) =>
    parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60;

  const iniciarIntervalo = (idPaciente, intervalIndex) => {
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
            intervalos: paciente.intervalos.map((intervalo, index) => {
              if (index === currentIndex) {
                return { ...intervalo, outcome };
              }
              return intervalo;
            }),
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

  const exportarMatriz = () => {
    const cabecera = ["Paciente", ...intervalos.map((i) => `${i.tiempo.hours}:${i.tiempo.minutes}`)];
    const filas = patientsWithIntervals.map((paciente) => {
      const fila = [paciente.nombre];
      paciente.intervalos.forEach((intervalo) => {
        if (intervalo.outcome !== null && intervalo.outcome !== undefined) {
          fila.push(intervalo.outcome);
        } else {
          fila.push(`${intervalo.tiempo.hours}:${intervalo.tiempo.minutes}`);
        }
      });
      return fila;
    });
    const matriz = [cabecera, ...filas];
    console.log("Matriz exportada:", matriz);
    const filasComoTexto = matriz.map((fila) => fila.join(" | "));
    const mensaje = filasComoTexto.join("\n");
  
    Alert.alert("Matriz exportada", mensaje, [
      {
        text: "OK",
        onPress: async () => {
          // Limpia los datos persistidos: modifica las claves según corresponda
          try {
            await AsyncStorage.multiRemove(["@grupos", "@pacientes", "@intervalos"]);
            console.log("Datos persistentes borrados, se inicia un nuevo ciclo.");
          } catch (error) {
            console.error("Error al limpiar la persistencia:", error);
          }
        },
      },
    ]);
  };
  

  // 4) Renderizado
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
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={32}
              color="#fff"
              style={styles.iconStyleE}
            />
          ) : (
            !temp?.activo &&
            !temp?.finished && (
              <TouchableOpacity onPress={() => activarTemporizador(paciente.id)}>
                <MaterialCommunityIcons
                  name="play-circle-outline"
                  size={32}
                  color="#fff"
                  style={styles.iconStyleE}
                />
              </TouchableOpacity>
            )
          )}
        </View>
        {temp?.activo && !temp?.finished && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {`tiempo restante: ${minutosRestantes.toString().padStart(2, "0")}:${segundosRestantes
                .toString()
                .padStart(2, "0")}`}
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

  // Ordenamos a conveniencia (igual que antes)
  const sortedPatients = [...patientsWithIntervals].sort((a, b) => {
    const dataA = temporizadores[a.id];
    const dataB = temporizadores[b.id];
    const finishedA = dataA?.allFinished ? 1 : 0;
    const finishedB = dataB?.allFinished ? 1 : 0;
    if (finishedA !== finishedB) {
      return finishedA - finishedB;
    }
    const timeA = dataA?.tiempo ?? Infinity;
    const timeB = dataB?.tiempo ?? Infinity;
    return timeA - timeB;
  });

  return (
    <View style={styles.extraccionesScreenContainer}>
      <View style={styles.headerContainerE}>
        <Text style={styles.headerText}>Próximas Extracciones</Text>
      </View>
      <FlatList
        data={sortedPatients}
        keyExtractor={(item) => item.id}
        renderItem={renderPaciente}
        contentContainerStyle={{ padding: 16 }}
      />
      {allPatientsFinished && (
        <TouchableOpacity
          style={{ alignSelf: "center", marginBottom: 16 }}
          onPress={exportarMatriz}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Exportar Matriz</Text>
        </TouchableOpacity>
      )}
      <View style={styles.botonesContainer}>
        <TouchableOpacity onPress={() => router.push("esquema")}>
          <Text style={styles.botonesI}>VOLVER</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log("Ir a Exportar")}>
          <Text style={styles.botonesD}>Ir a Exportar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExtraccionesScreen;

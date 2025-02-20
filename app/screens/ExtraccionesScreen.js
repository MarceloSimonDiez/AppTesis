// ExtraccionesScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import styles from "../styles/globalStyles";

const ExtraccionesScreen = ({ route, navigation }) => {
  const { intervalos, pacientes } = route.params;

  const [patientsWithIntervals, setPatientsWithIntervals] = useState([]);
  const [temporizadores, setTemporizadores] = useState({});

  // Al montar, cada paciente recibe su propia copia de intervalos
  useEffect(() => {
    const newPatients = pacientes.map((p) => ({
      ...p,
      intervalos: intervalos.map((i) => ({
        ...i,
        tiempo: { ...i.tiempo },
        outcome: null, // Agregamos outcome, inicialmente null
      })),
    }));
    setPatientsWithIntervals(newPatients);
  }, [pacientes, intervalos]);

  // Maneja el conteo regresivo global
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
              // Tiempo terminado para el intervalo actual
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

  // Convierte horas y minutos a segundos
  const convertirAHorasMinutos = (hours, minutes) =>
    parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60;

  // Inicia un intervalo específico para un paciente
  const iniciarIntervalo = (idPaciente, intervalIndex) => {
    const paciente = patientsWithIntervals.find((p) => p.id === idPaciente);
    if (!paciente) return;
    if (intervalIndex >= paciente.intervalos.length) {
      // Si se han terminado todos los intervalos, marca al paciente como finalizado
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

  // Activa el temporizador para el primer intervalo
  const activarTemporizador = (idPaciente) => {
    const data = temporizadores[idPaciente];
    if (data?.activo && !data?.finished) return;
    iniciarIntervalo(idPaciente, 0);
  };

  // Función para registrar el resultado (outcome) del intervalo actual
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

  // Avanza al siguiente intervalo y registra el resultado
  const iniciarSiguienteIntervalo = (idPaciente, outcome) => {
    // Registra el resultado para el intervalo actual
    registrarResultadoIntervalo(idPaciente, outcome);
    const data = temporizadores[idPaciente];
    if (!data) return;
    const nextIndex = data.intervalIndex + 1;
    iniciarIntervalo(idPaciente, nextIndex);
  };

  // Función para exportar la matriz en formato tabular
  const exportarMatriz = () => {
    const cabecera = ["Paciente", ...intervalos.map((i) => `${i.tiempo.hours}:${i.tiempo.minutes}`)];
    const filas = patientsWithIntervals.map((paciente) => {
      const fila = [paciente.nombre];
      paciente.intervalos.forEach((intervalo) => {
        // Si outcome está definido, se muestra; si no, se muestra el tiempo original
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
    // Formatear cada fila y unir con saltos de línea
    const filasComoTexto = matriz.map((fila) => fila.join(" | "));
    const mensaje = filasComoTexto.join("\n");
    Alert.alert("Matriz exportada", mensaje);
  };

  // Renderiza cada paciente
  const renderPaciente = ({ item: paciente }) => {
    const temp = temporizadores[paciente.id];
    const tiempoRestante = temp ? temp.tiempo : 0;
    const minutosRestantes = Math.floor(tiempoRestante / 60);
    const segundosRestantes = tiempoRestante % 60;

    // Calcula el índice real (0-based) y evita que se muestre un valor mayor al total
    const currentIndex = temp?.intervalIndex ?? 0;
    const totalIntervals = paciente.intervalos.length;
    const safeDisplayedIndex = Math.min(currentIndex + 1, totalIntervals);
    const muestraTexto = `muestra: ${safeDisplayedIndex}/${totalIntervals}`;

    return (
      <View style={styles.extraccionContainerE}>
        {/* Mostrar el indicador de muestra */}
        <Text style={styles.muestraText}>{muestraTexto}</Text>

        {/* Fila con la información del paciente */}
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

  // Comprueba si todos los pacientes han terminado (considera a los que no iniciaron como finalizados)
  const allPatientsFinished =
    patientsWithIntervals.length > 0 &&
    patientsWithIntervals.every((p) => {
      const data = temporizadores[p.id];
      return data ? data.allFinished === true : true;
    });

  // Ordena los pacientes para que los que han terminado se muestren al final
  const sortedPatients = [...patientsWithIntervals].sort((a, b) => {
    const finishedA = temporizadores[a.id]?.allFinished ? 1 : 0;
    const finishedB = temporizadores[b.id]?.allFinished ? 1 : 0;
    return finishedA - finishedB;
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
          onPress={() => {
            console.log("Botón Exportar Matriz presionado");
            exportarMatriz();
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Exportar Matriz</Text>
        </TouchableOpacity>
      )}

      <View style={styles.botonesContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.botonesI}>VOLVER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExtraccionesScreen;

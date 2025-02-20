// ExtraccionesScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
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
              // Si se termina el tiempo del intervalo actual, marcar finished
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

  // Avanza al siguiente intervalo
  const iniciarSiguienteIntervalo = (idPaciente) => {
    const data = temporizadores[idPaciente];
    if (!data) return;
    const nextIndex = data.intervalIndex + 1;
    iniciarIntervalo(idPaciente, nextIndex);
  };

  // Renderiza cada paciente
    const renderPaciente = ({ item: paciente }) => {
    const temp = temporizadores[paciente.id];
    const tiempoRestante = temp ? temp.tiempo : 0;
    const minutosRestantes = Math.floor(tiempoRestante / 60);
    const segundosRestantes = tiempoRestante % 60;

    // Calcula el índice real (0-based) desde temp?.intervalIndex
    const currentIndex = temp?.intervalIndex ?? 0;
    const totalIntervals = paciente.intervalos.length;

    // Asegura que el número a mostrar (1-based) no exceda totalIntervals
    // Si currentIndex >= totalIntervals, mostramos totalIntervals
    const safeDisplayedIndex = Math.min(currentIndex + 1, totalIntervals);

// Formatea el texto
const muestraTexto = `muestra: ${safeDisplayedIndex}/${totalIntervals}`;
    return (
      <View style={styles.extraccionContainerE}>
        {/* Mostrar el indicador de muestra en la parte superior */}
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

          {/* Si el paciente ya terminó todos sus intervalos, muestra el tilde (check) */}
          {temp?.allFinished ? (
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={32}
              color="#fff"
              style={styles.iconStyleE}
            />
          ) : (
            // Si no está activo ni finalizado, muestra el botón de Play
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

        {/* Muestra el temporizador activo */}
        {temp?.activo && !temp?.finished && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {`tiempo restante: ${minutosRestantes.toString().padStart(2, "0")}:${segundosRestantes
                .toString()
                .padStart(2, "0")}`}
            </Text>
          </View>
        )}

        {/* Si terminó el intervalo actual, muestra los botones de confirmación */}
        {temp?.finished && !temp?.allFinished && (
          <View style={styles.confirmContainerExtracciones}>
            <Text style={styles.timerText}>tiempo restante: 00:00</Text>
            <View style={styles.buttonsRowExtracciones}>
              <TouchableOpacity
                style={styles.confirmButtonExtracciones}
                onPress={() => iniciarSiguienteIntervalo(paciente.id)}
              >
                <MaterialCommunityIcons name="check" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButtonExtracciones}
                onPress={() => iniciarSiguienteIntervalo(paciente.id)}
              >
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Ordena los pacientes para que los que han terminado todos sus intervalos se muestren al final
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

      <View style={styles.botonesContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.botonesI}>VOLVER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExtraccionesScreen;

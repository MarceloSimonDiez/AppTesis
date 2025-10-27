// Paciente.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  InteractionManager
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// Asegurate de exportar tus estilos desde ExtraccionesScreen.js:
//   export const styles = StyleSheet.create({ … })
// e importarlos aquí:
import styles from "../styles/globalStyles";

const formatRetardo = (zeroReachedAt) => {
  const diffMs = Date.now() - zeroReachedAt;
  const diff = Math.max(diffMs, 0);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${hours > 0 ? hours + ':' : ''}${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
};

export default function Paciente({
  paciente,
  temp,
  grupos,
  handlePlay,
  iniciarSiguienteIntervalo,
  highlightedId,
  setHighlightedId
}) {
  // 1) Datos básicos de temporizador
  const currentIndex    = temp?.intervalIndex ?? 0;
  const totalIntervals = paciente.intervalos.length;
  const currentInterval = paciente.intervalos[currentIndex] || {
    tiempo: { days: 0, hours: 0, minutes: 0 }
  };
  const isDayInterval   = currentInterval.tiempo.days > 0;

  // 2) Texto de muestra
  const displayedIndex = Math.min(currentIndex + 1, totalIntervals);
  let timeSuffix;
  if (isDayInterval) {
    const d = currentInterval.tiempo.days;
    timeSuffix = ` – ${d} día${d > 1 ? 's' : ''}`;
  } else {
    const hh = String(currentInterval.tiempo.hours).padStart(2, '0');
    const mm = String(currentInterval.tiempo.minutes).padStart(2, '0');
    timeSuffix = ` – ${hh}:${mm}`;
  }
  const muestraTexto = `muestra: ${displayedIndex}/${totalIntervals}${timeSuffix}`;

  // 3) Color de fondo según grupo
  const grupo  = grupos.find(g => g.name === paciente.grupoName);
  const bgColor = grupo?.color ?? "#EEE";

  // 4) Cálculo de tiempo restante
  const tiempoRestante   = temp?.tiempo ?? 0;
  const minutosRestantes = Math.floor(tiempoRestante / 60);
  const segundosRestantes= tiempoRestante % 60;

  // 5) Lógica de “urgencia” (< 60s y activo)
  const isUrgent = temp?.activo && tiempoRestante < 60;
  const blink    = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let anim;
    if (isUrgent) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(blink, {
            toValue: 0.3,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(blink, {
            toValue: 1,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
    } else {
      blink.stopAnimation();
      blink.setValue(1);
    }
    return () => {
      if (anim) anim.stop();
      blink.setValue(1);
    };
  }, [isUrgent, blink]);

  return (
    <Animated.View
      style={[
        styles.extraccionContainerE,
        { backgroundColor: highlightedId === paciente.id ? "#DDD" : bgColor, opacity: blink }
      ]}
    >
      <Text style={styles.muestraText}>{muestraTexto}</Text>

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

        {(isDayInterval || temp?.allFinished) ? (
          <MaterialCommunityIcons name="check-circle-outline" size={32} color="#fff" />
        ) : (!temp?.activo && !temp?.finished) && (
          <TouchableOpacity onPress={() => handlePlay(paciente.id, 0)}>
            <MaterialCommunityIcons name="play-circle-outline" size={32} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {temp?.activo && !temp?.finished && (
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, isUrgent && styles.textUrgent]}>
            tiempo restante: {String(minutosRestantes).padStart(2,'0')}:
            {String(segundosRestantes).padStart(2,'0')}
          </Text>
        </View>
      )}

      {temp?.finished && !temp?.allFinished && !isDayInterval && (
        <View style={styles.confirmContainerExtracciones}>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>
              tiempo de retardo: {formatRetardo(temp.zeroReachedAt)}
            </Text>
          </View>
          <View style={styles.buttonsRowExtracciones}>
            <TouchableOpacity
              style={[styles.confirmButtonExtracciones, { backgroundColor: bgColor }]}
              onPress={() => {
                setHighlightedId(paciente.id);
                iniciarSiguienteIntervalo(paciente.id, "1");
                InteractionManager.runAfterInteractions(() => setHighlightedId(null));
              }}
            >
              <View style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: 8
              }}/>
              <MaterialCommunityIcons name="check" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButtonExtracciones, { backgroundColor: bgColor }]}
              onPress={() => {
                setHighlightedId(paciente.id);
                iniciarSiguienteIntervalo(paciente.id, "0");
                InteractionManager.runAfterInteractions(() => setHighlightedId(null));
              }}
            >
              <View style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: 8
              }}/>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

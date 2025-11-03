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

import styles from "../styles/extraccionesStyles"; // Asumo que tus estilos están aquí

// --- Función formatRetardo (Sin cambios) ---
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
  // --- 1. Lógica de datos (Sin cambios) ---
  const currentIndex    = temp?.intervalIndex ?? 0;
  const totalIntervals = paciente.intervalos.length;
  const currentInterval = paciente.intervalos[currentIndex] || {
    tiempo: { days: 0, hours: 0, minutes: 0 }
  };
  const isDayInterval   = currentInterval.tiempo.days > 0;
  
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

  const grupo  = grupos.find(g => g.name === paciente.grupoName);
  const bgColor = grupo?.color ?? "#EEE";

  const tiempoRestante   = temp?.tiempo ?? 0;
  const minutosRestantes = Math.floor(tiempoRestante / 60);
  const segundosRestantes= tiempoRestante % 60;

  // --- 2. Lógica de animación (MODIFICADA) ---
  const isUrgent = temp?.activo && tiempoRestante < 60;
  const blink    = useRef(new Animated.Value(1)).current;

  
  const urgentBlinkColor = blink.interpolate({
    inputRange: [0.3, 1], // Mismos valores que tu 'toValue'
    outputRange: ['#FFEEEE', '#FFFFFF'] // Parpadea de Rojo Claro a Blanco
  });

  useEffect(() => {
    let anim;
    if (isUrgent) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(blink, {
            toValue: 0.3,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: false, // ¡CAMBIO! Requerido para animar color
          }),
          Animated.timing(blink, {
            toValue: 1,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: false, // ¡CAMBIO! Requerido para animar color
          }),
        ])
      );
      anim.start();
    } else {
      // Detenemos la animación y reseteamos el valor
      if (anim) anim.stop();
      blink.setValue(1);
    }
    return () => {
      if (anim) anim.stop();
      blink.setValue(1);
    };
  }, [isUrgent, blink]); // Dependencias correctas


  // --- 3. JSX (MODIFICADO) ---
  return (
    <Animated.View
      style={[
        styles.cardContainer,
      ]}
    >
      {/* Barra lateral (Sin cambios) */}
      <View style={[styles.sideBar, { backgroundColor: bgColor }]} />

      {/* ¡CAMBIO! <View> ahora es <Animated.View> y usa la nueva lógica de color */}
      <Animated.View style={[
          styles.contentContainer,
          { 
            backgroundColor: isUrgent 
                             ? urgentBlinkColor // Si es urgente, usa la animación de color
                             : (highlightedId === paciente.id ? "#DDD" : "#FFFFFF") // Si no, usa la lógica de destacado
          }
      ]}>
        
        {/* Contenido (Sin cambios) */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center' }}>
          <Text style={styles.muestraText}>{muestraTexto}</Text>
         
          <Text style={styles.muestraText}> 
            {paciente.esquemaName || "Sin Esquema"}
          </Text>

          {(isDayInterval || temp?.allFinished) ? (
            <MaterialCommunityIcons name="check-circle-outline" size={32} color="#28a745" />
          ) : (!temp?.activo && !temp?.finished) && (
            <TouchableOpacity onPress={() => handlePlay(paciente.id, 0)}>
              <MaterialCommunityIcons name="play-circle-outline" size={32} color={bgColor} /> 
            </TouchableOpacity>
          )}
        </View>

        {/* Contenido (Sin cambios) */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 12 }}>
          <View style={styles.infoContainerE}>
            <Text style={styles.labelE}>Individuo</Text>
            <View style={[styles.inputBoxE, { backgroundColor: bgColor }]}>
              <Text style={styles.inputTextE}>{paciente.nombre || "Sin nombre"}</Text>
            </View>
          </View>
          <View style={styles.infoContainerE}>
            <Text style={styles.labelE}>Grupo</Text>
            <View style={[styles.inputBoxE, { backgroundColor: bgColor }]}>
              <Text style={styles.inputTextE}>{paciente.grupoName}</Text>
            </View>
          </View>
        </View>


        {/* ¡CAMBIO! El Timer AHORA VA DENTRO de contentContainer */}
        {temp?.activo && !temp?.finished && (
          <View style={styles.timerContainer}>
            <Text style={[styles.timerText, isUrgent && styles.textUrgent]}>
              tiempo restante: {String(minutosRestantes).padStart(2,'0')}:
              {String(segundosRestantes).padStart(2,'0')}
            </Text>
          </View>
        )}

        {/* ¡CAMBIO! Los botones de confirmación AHORA VAN DENTRO de contentContainer */}
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
                  backgroundColor: "rgba(60, 239, 24, 0.72)",
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
                  backgroundColor: "rgba(242, 17, 17, 0.81)",
                  borderRadius: 8
                }}/>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
      </Animated.View> 
    </Animated.View>
    
  );
}
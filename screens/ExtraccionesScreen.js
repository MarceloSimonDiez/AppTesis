import React, { useContext, useEffect, useState, useReducer } from "react";
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, AppState, Platform, InteractionManager, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "../styles/globalStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlobalContext } from "../GlobalProvider";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Notifications from 'expo-notifications';
import Paciente from "../components/Paciente";
import extraccionesStyles from "../styles/extraccionesStyles";
import * as XLSX from 'xlsx';
import { RFValue } from "react-native-responsive-fontsize";
import grupoStyles from "../styles/grupoStyles";
import { useTranslation } from 'react-i18next';



/* ==========================================================================
   HELPER: ESTADO DERIVADO Y UTILIDADES MENORES
   ========================================================================== */

function getStatus(paciente, timer, esquemas = []) {
  if (!paciente.esquemaId) return 'SIN_INICIAR';
  const esquema = esquemas.find(e => e.id === paciente.esquemaId);
  if (!esquema || !esquema.intervalos || esquema.intervalos.length === 0) {
    return 'SIN_INICIAR';
  }
  const idx = timer?.intervalIndex ?? 0;
  const active = timer?.activo === true;
  const fin = timer?.finished === true;
  const done = timer?.allFinished === true;
  const curInt = esquema.intervalos?.[idx] || {};
  const isDay = curInt.tiempo?.days > 0;

  if (done) return 'FINALIZADO';
  if (active || (fin && !done)) return 'CURSO';
  if (!active && !fin && idx === 0) return 'SIN_INICIAR';
  if (isDay && fin) return 'FINALIZADO';
  return 'SIN_INICIAR';
}




const ExtraccionesScreen = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const {
    grupos, pacientes,
    esquemas,
    dataLoaded,
    setGrupos,
    setPacientes,
    sampleName,
    setEsquemas,
    setSampleName,
    temporizadores,
    setTemporizadores,
    setHideAddButtons // Desde GlobalContext para ocultar botones en el home al iniciar
  } = useContext(GlobalContext);

  const [patientsWithIntervals, setPatientsWithIntervals] = useState([]);
  const [filter, setFilter] = useState('SIN_INICIAR');
  const [isExporting, setIsExporting] = useState(false);
  const [basePacientesList, setBasePacientesList] = useState([]); // Pacientes con intervalos pre-calculados (sin outcomes)
  const [, forceUpdate] = useReducer(x => x + 1, 0); // Forzar re-renderizado
  const [highlightedId, setHighlightedId] = useState(null); // Para resaltar paciente

  // Preparamos basePacientesList a partir de pacientes y esquemas (solo una vez o cuando cambian)
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      const pacientesConEsquema = pacientes.filter(p => p.esquemaId);
      const nuevosPacientes = pacientesConEsquema.map((p) => {
        const esquemaDelPaciente = esquemas.find(e => e.id === p.esquemaId);
        const intervalosDelEsquema = esquemaDelPaciente ? esquemaDelPaciente.intervalos : [];
        const intervalosParaPaciente = intervalosDelEsquema.map((i) => ({
          ...i,
          tiempo: { ...i.tiempo },
          outcome: null,
          tiempoRespuesta: null,
        }));
        return {
          ...p,
          intervalos: intervalosParaPaciente,
        };
      });
      setBasePacientesList(nuevosPacientes);
    });

    return () => task.cancel();
  }, [pacientes, esquemas]);

  // Cargar temporizadores e intervalos guardados desde AsyncStorage
  useEffect(() => {
    const cargarTemporizadores = async () => {
      if (basePacientesList.length === 0) {
        setTemporizadores({});
        setPatientsWithIntervals([]);
        return;
      }

      const nuevosTimers = {};
      const nuevosPatientsWithIntervals = [];

      for (const paciente of basePacientesList) {
        try {
          // Carga paralela de datos de AsyncStorage
          const [dataStr, intervalosTomadosStr, inicioStr] = await Promise.all([
            AsyncStorage.getItem(`temporizador-${paciente.id}`),
            AsyncStorage.getItem(`intervalosTomados-${paciente.id}`),
            AsyncStorage.getItem(`inicio-${paciente.id}`) // Se usó inicio-id en handlePlay original
          ]);

          let temporizadorGuardado = null;
          let intervalosGuardados = null;

          if (dataStr) temporizadorGuardado = JSON.parse(dataStr);
          if (intervalosTomadosStr) intervalosGuardados = JSON.parse(intervalosTomadosStr);

          // Recalculo del timer para corrección en caso de cierre/apertura
          if (temporizadorGuardado) {
            const data = temporizadorGuardado;
            // Cálculo del tiempo restante y si llegó a cero
            const elapsed = Math.floor((Date.now() - (data.startTime ?? Date.now())) / 1000);
            const remaining = Math.max(data.duration - elapsed, 0);
            const calculadoZero = data.zeroReachedAt ?? (remaining === 0 ? data.startTime + data.duration * 1000 : null);

            // Corrección si el timer estaba activo pero llegó a cero mientras estaba en background
            if (data.activo && !data.finished && remaining === 0) {
              data.activo = false;
              data.finished = true;
              data.zeroReachedAt = calculadoZero || (data.startTime + data.duration * 1000);
              // Guardamos la corrección
              await AsyncStorage.mergeItem(
                `temporizador-${paciente.id}`,
                JSON.stringify({ finished: true, zeroReachedAt: data.zeroReachedAt })
              );
            }

            nuevosTimers[paciente.id] = {
              ...data,
              tiempo: remaining,
              activo: data.activo,
              finished: data.finished,
              zeroReachedAt: calculadoZero,
              notificationId: data.notificationId ?? null,
            };
          }

          // Merge de intervalos guardados con los intervalos base del esquema
          nuevosPatientsWithIntervals.push({
            ...paciente,
            // inicio-id (originalmente guardado en handlePlay)
            inicio: inicioStr ? JSON.parse(inicioStr) : null,
            intervalos: (paciente.intervalos || []).map((i, idx) => {
              const existente = intervalosGuardados?.[idx];
              return {
                ...i,
                tiempo: { ...i.tiempo }, // Clonar por precaución
                outcome: existente?.outcome ?? null,
                horaRespuesta: existente?.horaRespuesta ?? null,
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
  }, [basePacientesList]);


  // Recalcular timers cuando la app vuelve al foreground (AppState)
  useEffect(() => {
    if (!dataLoaded) return;

    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active") {
        console.log("🔙 Volvimos al primer plano. Recalculando temporizadores...");
        setTemporizadores((prevTemporizadores) => {
          const nuevosTimers = { ...prevTemporizadores };

          for (const paciente of patientsWithIntervals) {
            try {
              const data = nuevosTimers[paciente.id];
              if (!data) continue;
              if (data.allFinished || !data.startTime) continue; // Si ya finalizó o no ha iniciado, saltar

              const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
              const remaining = Math.max(data.duration - elapsed, 0);
              const calculadoZero = data.zeroReachedAt ?? (remaining === 0 ? data.startTime + data.duration * 1000 : null);

              // Corrección si el timer estaba activo pero llegó a cero
              if (data.activo && !data.finished && remaining === 0) {
                data.activo = false;
                data.finished = true;
                data.zeroReachedAt = calculadoZero || (data.startTime + data.duration * 1000);

                AsyncStorage.mergeItem(
                  `temporizador-${paciente.id}`,
                  JSON.stringify({ finished: true, zeroReachedAt: data.zeroReachedAt })
                );
              }

              nuevosTimers[paciente.id] = {
                ...data,
                tiempo: remaining,
                activo: data.activo,
                finished: data.finished,
                zeroReachedAt: calculadoZero,
              };
            } catch (e) {
              console.warn("⛔ Error al recalcular desde segundo plano:", e);
            }
          }

          return nuevosTimers;
        });
      }
    });

    return () => subscription.remove();
  }, [dataLoaded, patientsWithIntervals]);


  // Interval visual (forceUpdate) ha sido removido porque setTemporizadores ya dispara re-renders

  // Interval logic: actualizar temporizadores cada segundo (UI state)
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTemporizadores((prev) => {
        const nextState = { ...prev };
        Object.keys(nextState).forEach((id) => {
          const data = { ...nextState[id] };
          if (!data.startTime || data.allFinished) return;

          // Se actualiza el tiempo restante localmente cada segundo
          const elapsed = Math.floor((Date.now() - (data.startTime ?? Date.now())) / 1000);
          const restante = Math.max((data.duration ?? data.tiempo) - elapsed, 0);
          data.tiempo = restante;
          data.animacionActiva = restante <= 60; // Animación del último minuto

          // Lógica de finalización si llegó a cero
          if (data.activo && !data.finished) {
            if (restante === 0) {
              data.activo = false;
              data.finished = true;
              data.zeroReachedAt = data.startTime + (data.duration * 1000);

              // Cancelar la notificación de "último minuto" si ya terminó
              if (data.notificationId) {
                Notifications.cancelScheduledNotificationAsync(data.notificationId).catch(() => { });
              }

              // Guardar el estado de finalizado en AsyncStorage
              AsyncStorage.mergeItem(
                `temporizador-${id}`,
                JSON.stringify({ finished: true, zeroReachedAt: data.zeroReachedAt })
              );
            }
          }
          nextState[id] = data;
        });
        return nextState;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Acciones: handlePlay (primer intervalo)
  const handlePlay = async (pacienteId, accion) => {
    // La lógica original solo iniciaba en accion === 0
    if (accion === 0) {
      const now = Date.now();
      const nowStr = JSON.stringify(now);
      setHideAddButtons(true); // Oculta botones en la pantalla anterior

      try {
        await AsyncStorage.setItem(`inicio-${pacienteId}`, nowStr);
      } catch (e) {
        console.warn("Error guardando inicio:", e);
      }
      await iniciarIntervalo(pacienteId, 0, { inicioTime: nowStr });
    }
  };

  // iniciarIntervalo: Inicia un nuevo intervalo (0, 1, 2,...)
  const iniciarIntervalo = async (idPaciente, intervalIndex, extra = {}) => {
    const idKey = String(idPaciente);
    const paciente = basePacientesList.find(p => String(p.id) === idKey) || patientsWithIntervals.find(p => String(p.id) === idKey);
    if (!paciente) return;
    const esquema = esquemas.find(e => e.id === paciente.esquemaId);
    if (!esquema) return;
    if (intervalIndex >= esquema.intervalos.length) return;

    const now = Date.now();
    const intervalo = esquema.intervalos[intervalIndex];

    // Guardar inicio del paciente si es primer intervalo (Diferente del 'inicio-' guardado en handlePlay)
    if (intervalIndex === 0) {
      try {
        await AsyncStorage.setItem(`paciente-inicio-${idKey}`, JSON.stringify(now));
      } catch (e) {
        console.warn("Error guardando hora de inicio:", e);
      }
    }

    const diasIntervalo = Number(intervalo.tiempo.days) || 0;

    // 1. Lógica para intervalos por días (se marcan como finalizados inmediatamente)
    if (diasIntervalo > 0) {
      const newTimer = {
        startTime: now,
        intervalIndex,
        duration: 0,
        zeroReachedAt: now,
        activo: false,
        tiempo: 0,
        finished: true,
        allFinished: false,
        notificationId: null,
        animacionActiva: false,
        pacienteNombre: paciente.nombre,
      };

      setTemporizadores(prev => ({ ...prev, [idKey]: newTimer }));
      await AsyncStorage.setItem(`temporizador-${idKey}`, JSON.stringify(newTimer));
    }
    // 2. Lógica para intervalos por horas/minutos
    else {
      const totalSegundos = (Number(intervalo.tiempo.hours) || 0) * 3600 + (Number(intervalo.tiempo.minutes) || 0) * 60;

      let notifId = null;

      // Cancelar notif previa si existe (del intervalo anterior si lo hubiere)
      const currentTimer = temporizadores[idKey];
      if (currentTimer && currentTimer.notificationId) {
        await cancelNotificationIfExists(currentTimer.notificationId);
      }

      // Programar notificación (Último minuto)
      if (totalSegundos > 60) {
        notifId = await scheduleMinuteNotification({
          pacienteNombre: paciente.nombre,
          idPaciente: idKey,
          startTimestamp: now,
          durationSeconds: totalSegundos
        });
      }

      const newTimer = {
        startTime: now,
        intervalIndex,
        duration: totalSegundos,
        zeroReachedAt: null,
        activo: true,
        tiempo: totalSegundos,
        finished: false,
        allFinished: false,
        notificationId: notifId,
        animacionActiva: totalSegundos <= 60 ? true : false,
        pacienteNombre: paciente.nombre,
      };

      setTemporizadores(prev => ({ ...prev, [idKey]: newTimer }));
      await AsyncStorage.setItem(`temporizador-${idKey}`, JSON.stringify(newTimer));
    }

    // Actualizar patientsWithIntervals: registrar horaInicio del intervalo
    setPatientsWithIntervals(prev => prev.map(p => {
      if (String(p.id) !== idKey) return p;
      const updatedPaciente = {
        ...p,
        intervalos: p.intervalos.map((intv, i) => i === intervalIndex ? { ...intv, horaInicio: Date.now() } : intv)
      };
      if (intervalIndex === 0) {
        updatedPaciente.inicio = Date.now(); // Sobrescribe el 'inicio-'
      }
      return updatedPaciente;
    }));
  };

  // iniciarSiguienteIntervalo: Guarda outcome, cancela notificaciones y avanza
  const iniciarSiguienteIntervalo = async (idPaciente, outcome) => {
    const timer = temporizadores[idPaciente];
    const paciente = patientsWithIntervals.find(p => p.id === idPaciente);
    if (!timer || !paciente) return;

    const currentIndex = timer.intervalIndex;
    const horaResp = Date.now();

    // Evitar duplicados si ya tiene outcome
    if (paciente.intervalos[currentIndex] && paciente.intervalos[currentIndex].outcome !== null) {
      return;
    }

    // Guardar resultado en array local y AsyncStorage
    const nuevosIntervalos = paciente.intervalos.map((intv, i) => {
      if (i === currentIndex) {
        return { ...intv, outcome, horaRespuesta: horaResp };
      }
      return intv;
    });

    try {
      await AsyncStorage.setItem(`intervalosTomados-${idPaciente}`, JSON.stringify(nuevosIntervalos));
    } catch (e) {
      console.error("Fallo crítico al guardar intervalos:", e);
      return;
    }

    setPatientsWithIntervals(prev =>
      prev.map(p => {
        if (p.id === idPaciente) {
          return { ...p, intervalos: nuevosIntervalos };
        }
        return p;
      })
    );

    // Cancelar la notificación del intervalo actual si existe
    if (timer.notificationId) {
      await cancelNotificationIfExists(timer.notificationId);
    }

    // Avanzar al siguiente intervalo o finalizar
    const esquema = esquemas.find(e => e.id === paciente.esquemaId);
    if (!esquema) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex >= esquema.intervalos.length) {
      // Estado de finalización total
      const finalTimerState = {
        ...timer,
        activo: false,
        tiempo: 0,
        finished: true,
        allFinished: true,
        intervalIndex: nextIndex,
        notificationId: null,
      };
      setTemporizadores(prev => ({ ...prev, [idPaciente]: finalTimerState }));
      await AsyncStorage.setItem(`temporizador-${idPaciente}`, JSON.stringify(finalTimerState));
    } else {
      // Iniciamos siguiente intervalo y programamos su notificación
      await iniciarIntervalo(idPaciente, nextIndex);
    }
  };


  // Lógica de filtrado y orden
  const sinIniciar = [];
  const enCurso = [];
  const finalizados = [];

  patientsWithIntervals.forEach(p => {
    const temp = temporizadores[p.id] || {};
    const status = getStatus(p, temp, esquemas);
    if (status === 'SIN_INICIAR') sinIniciar.push(p);
    else if (status === 'CURSO') enCurso.push(p);
    else if (status === 'FINALIZADO') finalizados.push(p);
  });

  let dataToShow = [];
  if (filter === 'SIN_INICIAR') dataToShow = sinIniciar;
  else if (filter === 'CURSO') {
    // Separamos los pacientes con retardo (tiempo=0, finished=true, allFinished=false)
    const retardo = enCurso.filter(p => {
      const t = temporizadores[p.id] || {};
      const isDayInterval = p.intervalos[t.intervalIndex]?.days > 0;
      return t.finished && !t.allFinished && !isDayInterval;
    });
    const restante = enCurso.filter(p => !retardo.includes(p));

    // Ordenar por más tiempo en retardo (descendente)
    retardo.sort((a, b) => {
      const waitedA = (Date.now() - (temporizadores[a.id].zeroReachedAt || 0)) / 1000;
      const waitedB = (Date.now() - (temporizadores[b.id].zeroReachedAt || 0)) / 1000;
      return waitedB - waitedA;
    });

    // Ordenar por menos tiempo restante (ascendente)
    restante.sort((a, b) => {
      const tA = temporizadores[a.id]?.tiempo ?? 0;
      const tB = temporizadores[b.id]?.tiempo ?? 0;
      return tA - tB;
    });

    dataToShow = [...retardo, ...restante];
  } else if (filter === 'FINALIZADO') dataToShow = finalizados;

  const showTerminar = finalizados.length === patientsWithIntervals.length;


  /* ==========================================================================
     3) NOTIFICACIONES (Permisos, Canal, Handler, Schedule/Cancel)
     ========================================================================== */

  // Pedir permisos, configurar canal Android y handler (solo al montar)
  useEffect(() => {
    (async () => {
      try {
        await Notifications.requestPermissionsAsync();
      } catch (e) {
        console.warn("Error pidiendo permisos:", e);
      }

      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('alarm-channel', {
            name: t('extracciones.channelName'),
            importance: Notifications.AndroidImportance.MAX,
            sound: 'default',
            vibrationPattern: [0, 800, 500, 800],
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          });
        } catch (e) {
          console.warn("Error creando canal:", e);
        }
      }

      // Handler para decidir cómo se muestra la notificación en foreground
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    })();
  }, []);

  // Programación de notificación de "Último minuto" (60s antes de terminar)
  const scheduleMinuteNotification = async ({ pacienteNombre, idPaciente, startTimestamp, durationSeconds }) => {
    try {
      if (!durationSeconds || durationSeconds <= 60) return null;

      // Programar la notificación en: Tiempo de inicio + (Duración total - 60 segundos)
      const triggerTs = startTimestamp + (durationSeconds - 60) * 1000;
      const bodyMessage = pacienteNombre
        ? t('extracciones.notif_body_con_nombre', { name: pacienteNombre })
        : t('extracciones.notif_body_sin_nombre');

      const nid = await Notifications.scheduleNotificationAsync({
        content: {
          title: t('extracciones.notif_titulo'),
          body: bodyMessage,
          sound: 'default',
          channelId: 'alarm-channel',
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(triggerTs),
          allowWhileIdle: true, // Permite que se dispare aunque el dispositivo esté inactivo/dormido
        },
      });
      return nid;
    } catch (e) {
      console.error("Error programando notificación persistente:", e);
      return null;
    }
  };

  // Cancelación de notificación
  const cancelNotificationIfExists = async (notificationId) => {
    if (!notificationId) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.warn("No se pudo cancelar notificación:", e);
    }
  };


  /* ==========================================================================
     4) EXPORTAR MATRICES (XLSX): Generación, Guardar/Compartir y Limpieza
     ========================================================================== */

  // Diálogo de confirmación para terminar/cerrar la muestra
  const confirmarFin = () => {
    Alert.alert(
      t('extracciones.alerta_titulo'),
      t('extracciones.alerta_mensaje'),
      [
        {
          text: t('common.cancelar'),
          style: "cancel"
        },
        {
          text: t('extracciones.alerta_exportar'),
          onPress: exportarMatrices,
          style: "default"
        },
      ],
      { cancelable: false }
    );
  };

  const exportarMatrices = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const wb = XLSX.utils.book_new();

      // --- HOJA 1: Datos generales ---
      const cabeceraDatos = [
        t('exportar.cabecera_nombre'),
        t('exportar.cabecera_sexo'),
        t('exportar.cabecera_edad'),
        t('exportar.cabecera_peso'),
        t('exportar.cabecera_descripcion'),
        t('exportar.cabecera_grupo'),
        t('exportar.cabecera_esquema')
      ];
      const filasDatos = patientsWithIntervals.map(p => [
        p.nombre, p.sexo, p.edad, p.peso, p.descripcion, p.grupoName, p.esquemaName || "N/A"
      ]);
      const ws_datos = XLSX.utils.aoa_to_sheet([cabeceraDatos, ...filasDatos]);
      XLSX.utils.book_append_sheet(wb, ws_datos, t('exportar.hoja_datos_generales'));


      // --- HOJAS POR ESQUEMA (Matrices de resultados) ---
      const esquemasEnUso = esquemas.filter(e =>
        patientsWithIntervals.some(p => p.esquemaId === e.id)
      );

      for (const esquema of esquemasEnUso) {
        const cabeceraEsquema = [t('exportar.cabecera_nombre'), t('exportar.cabecera_hora_inicio')];

        // Cabecera de intervalos (t1, t2,...)
        (esquema.intervalos || []).forEach((i, idx) => {
          if (i.tiempo.days > 0) {
            cabeceraEsquema.push(`t${idx + 1} ${i.tiempo.days}d`);
          } else {
            const hh = String(i.tiempo.hours).padStart(2, "0");
            const mm = String(i.tiempo.minutes).padStart(2, "0");
            cabeceraEsquema.push(`t${idx + 1} ${hh}:${mm}`);
          }
        });

        const filasEsquema = [];
        const pacientesDelEsquema = patientsWithIntervals.filter(p => p.esquemaId === esquema.id);

        for (const paciente of pacientesDelEsquema) {
          // Formato de hora de inicio (paciente.inicio)
          const horaInicio = paciente.inicio
            ? new Date(Number(paciente.inicio)).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            : "N/A";

          const filaPaciente = [paciente.nombre, horaInicio];

          // Resultados de cada intervalo
          (esquema.intervalos || []).forEach((intervalo, idx) => {
            const pIntervalo = paciente.intervalos[idx];
            const outcome = pIntervalo?.outcome;
            const horaRespTimestamp = pIntervalo?.horaRespuesta;

            if (outcome == null) {
              filaPaciente.push(""); // Dato faltante
            } else {
              // 1. Traducir los símbolos "si" / "no"
              const symbol = outcome === "1" ? t('extracciones.si') : t('extracciones.no');

              let suffix = "";
              if (horaRespTimestamp) {
                // 2. Usar el idioma actual para el formato de hora
                // i18n.language suele devolver 'en' o 'es'
                const currentLang = i18n.language === 'es' ? 'es-ES' : 'en-US';

                const hora = new Date(Number(horaRespTimestamp)).toLocaleString(currentLang, {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: i18n.language !== 'es' // AM/PM para inglés, 24h para español
                });
                suffix = ` (${hora})`;
              }
              filaPaciente.push(symbol + suffix);
            }
          });
          filasEsquema.push(filaPaciente);
        }

        const ws_esquema = XLSX.utils.aoa_to_sheet([cabeceraEsquema, ...filasEsquema]);
        const nombreHoja = esquema.nombre.replace(/[\\\/\?\*\[\]\:]/g, "").substring(0, 31);
        XLSX.utils.book_append_sheet(wb, ws_esquema, nombreHoja || `Esquema ${esquemasEnUso.indexOf(esquema) + 1}`);
      }

      // --- GENERAR archivo Base64 y Metadata ---
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const defaultName = t('exportar.nombre_por_defecto');
      const baseName = (sampleName || defaultName).replace(/\s+/g, "");
      const nombreArchivo = `${baseName}_${t('exportar.sufijo_archivo1')}.xlsx`;
      const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      // --- Limpieza y Navegación ---
      const limpiarDatosYNavegar = async () => {
        try {
          // Cancelar todas las notificaciones pendientes
          await Notifications.cancelAllScheduledNotificationsAsync();

          const allKeys = await AsyncStorage.getAllKeys();
          // Keys dinámicas de temporizadores y resultados
          const dynamicKeysToRemove = allKeys.filter(key =>
            key.startsWith('temporizador-') ||
            key.startsWith('intervalosTomados-') ||
            key.startsWith('inicio-') || // 'inicio-' (original)
            key.startsWith('paciente-inicio-') // 'paciente-inicio-' (iniciarIntervalo)
          );

          // Keys estáticas de configuración global
          const staticKeysToRemove = [
            'grupos', 'pacientes', 'esquemas', 'sampleName'
          ];

          await AsyncStorage.multiRemove([...dynamicKeysToRemove, ...staticKeysToRemove]);

          // Limpiar estado local y global
          setGrupos([]);
          setPacientes([]);
          setEsquemas([]);
          setSampleName("");
          setHideAddButtons(false);

          // Navegar a la pantalla de inicio después de que las interacciones pendientes terminen
          InteractionManager.runAfterInteractions(() => {
            router.replace("/");
          });
        } catch (e) {
          console.error("Error limpiando datos:", e);
        }
      };

      // --- Compartir Archivo ---
      const compartirArchivo = async () => {
        try {
          const uri_cache = FileSystem.cacheDirectory + nombreArchivo;
          // Escribir el Base64 en un archivo temporal en caché
          await FileSystem.writeAsStringAsync(uri_cache, wbout, {
            encoding: FileSystem.EncodingType.Base64
          });
          // Abrir diálogo de compartir nativo
          await Sharing.shareAsync(uri_cache, { mimeType, dialogTitle: t('exportar.dialogo_compartir') });
          return true; // Éxito en compartir
        } catch (shareError) {
          Alert.alert(t('common.error'), t('exportar.error_compartir'));
          return false;
        }
      };

      // --- Guardar en Almacenamiento (Android SAF) ---
      const guardarEnAlmacenamiento = async () => {
        if (Platform.OS !== 'android') return await compartirArchivo(); // Fallback si no es Android
        try {
          // Pedir permiso para acceder a un directorio (Storage Access Framework)
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            const directoryUri = permissions.directoryUri;
            // Crear el archivo
            const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, nombreArchivo, mimeType);
            // Escribir el contenido
            await FileSystem.writeAsStringAsync(fileUri, wbout, {
              encoding: FileSystem.EncodingType.Base64
            });
            Alert.alert(t('exportar.exito_titulo'), t('exportar.exito_mensaje', { nombre: nombreArchivo }));
            return true; // Éxito en guardar
          } else {
            Alert.alert(t('exportar.cancelado_titulo'), t('exportar.cancelado_mensaje'));
            return false;
          }
        } catch (safError) {
          console.warn("Error SAF, intentando compartir:", safError);
          Alert.alert(t('exportar.error_guardado_titulo'), t('exportar.error_guardado_mensaje'));
          return await compartirArchivo(); // Fallback a compartir
        }
      };

      // --- Flujo de Diálogo de Exportación (Android) ---
      if (Platform.OS === 'android') {
        Alert.alert(
          t('exportar.opciones_titulo'),
          t('exportar.opciones_mensaje'),
          [
            { text: t('common.cancelar'), style: "cancel", onPress: () => setIsExporting(false) },
            {
              text: t('exportar.opcion_compartir'),
              onPress: async () => {
                const completado = await compartirArchivo();
                if (completado) await limpiarDatosYNavegar();
                setIsExporting(false);
              }
            },
            {
              text: t('exportar.opcion_guardar'),
              onPress: async () => {
                const completado = await guardarEnAlmacenamiento();
                if (completado) await limpiarDatosYNavegar();
                setIsExporting(false);
              }
            }
          ],
          { cancelable: false }
        );
      }
      // --- Flujo de Exportación (iOS/Web) ---
      else {
        const completado = await compartirArchivo();
        if (completado) await limpiarDatosYNavegar();
        setIsExporting(false);
      }
    } catch (e) {
      console.error("Error al exportar:", e);
      Alert.alert(t('common.error'), t('exportar.error_generar'));
      setIsExporting(false);
    }
  };


  /* ==========================================================================
     5) RENDER
     ========================================================================== */

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={grupoStyles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={grupoStyles.backButton}>
          <MaterialIcons name="arrow-back" size={RFValue(24)} color="#333" />
        </TouchableOpacity>
        <Text style={grupoStyles.headerTitle}>{sampleName || t('extracciones.muestra_por_defecto')}</Text>
        <TouchableOpacity
          onPress={() => { confirmarFin(); }}
          style={{
            position: 'absolute',
            right: RFValue(15),
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
        <View style={extraccionesStyles.filterRow}>
          {[
            ['SIN_INICIAR', t('extracciones.filtro_sin_iniciar')],
            ['CURSO', t('extracciones.filtro_curso')],
            ['FINALIZADO', t('extracciones.filtro_finalizado')],
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
              {filter === key && <View style={extraccionesStyles.filterUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={dataToShow}
          keyExtractor={item => String(item.id)}
          extraData={{ highlightedId, grupos, temporizadores }}
          renderItem={({ item }) => (
            <Paciente
              paciente={item}
              temp={temporizadores[item.id] || {}}
              grupos={grupos}
              handlePlay={handlePlay}
              iniciarSiguienteIntervalo={iniciarSiguienteIntervalo}
              highlightedId={highlightedId}
              setHighlightedId={setHighlightedId}
              currentFilter={filter}
            />
          )}
        />
      </View>

      <View style={styles.bottomButtonContainer}>
        {showTerminar && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={exportarMatrices}
            disabled={isExporting}
          >
            <Text style={styles.primaryButtonText}>
              {isExporting ? t('Exportar Datos') : t('Export Data')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ExtraccionesScreen;
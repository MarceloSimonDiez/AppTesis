// EsquemaScreen.js
import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, Alert, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import styles from "../styles/globalStyles";
import TimePicker from "../components/TimePicker";
import { GlobalContext } from "../GlobalProvider";
import * as Calendar from 'expo-calendar';
import { MaterialIcons } from "@expo/vector-icons";
import buttonStyles from '../styles/buttonStyles';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import esquemaStyles from "../styles/esquemaStyles";
import grupoStyles from "../styles/grupoStyles";

async function crearEventoLocalEnDias(dias, summary) {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') throw new Error('Permiso de calendario denegado');

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const calendar = calendars.find(c => c.allowsModifications) || calendars[0];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + dias);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  const eventId = await Calendar.createEventAsync(calendar.id, {
    title:    summary,
    startDate,
    endDate,
    allDay:   true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notes:    'Creado desde AppTesis'
  });

  return eventId;
}

const EsquemaScreen = () => {
  const router = useRouter();
  const { pacientes, intervalos, setIntervalos,  temporizadores, setTemporizadores  } = useContext(GlobalContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const { sampleName } = useContext(GlobalContext);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [pendingTime, setPendingTime] = useState({ days: 0, hours: 0, minutes: 0 });
  const { hideAddButtons } = useContext(GlobalContext);

  // Manejo de cambio de picker
  const handleTimeChange = ({ days = 0, hours = 0, minutes = 0 }) => {
    setPendingTime({ days, hours, minutes });``
  };

  const abrirModal = (id) => {
    if (id) {
      const existing = intervalos.find(item => item.id === id);
      setPendingTime(existing.tiempo);
    } else {
      setPendingTime({ days: 0, hours: 0, minutes: 0 });
    }
    setSelectedId(id);
    setModalVisible(true);
  };

  const eliminarIntervalo = (id) => {
    setIntervalos(prev => prev.filter(item => item.id !== id));
  };

  const actualizarTiempo = (id, nuevoTiempo) => {
    setIntervalos(prev => prev.map(item => item.id === id ? { ...item, tiempo: nuevoTiempo } : item));
  };

const renderItem = ({ item }) => {
  const timeString =
    item.tiempo.days > 0
      ? `${item.tiempo.days} día${item.tiempo.days > 1 ? 's' : ''}`
      : `${String(item.tiempo.hours).padStart(2, '0')}:${String(
          item.tiempo.minutes
        ).padStart(2, '0')}`;

  const isDisabled = hideAddButtons;

  return (
    <TouchableOpacity
      style={[
        esquemaStyles.cardContainer,
        isDisabled && esquemaStyles.cardDisabled,
      ]}
      activeOpacity={0.8}
      onPress={() => !isDisabled && abrirModal(item.id)}
      disabled={isDisabled}
    >
      {/* 1. Barra lateral roja, directamente */}
      <View style={[esquemaStyles.sideBar, { backgroundColor: '#663399' }]} />

      {/* 2. Contenedor principal (que tiene flexDirection: 'row' en los estilos) */}
      <View style={esquemaStyles.contentContainer}>
        
        {/* Contenedor del Texto */}
        <View style={esquemaStyles.textContainer}>
          <Text style={esquemaStyles.cardTitle}>{timeString}</Text>
          <Text style={esquemaStyles.cardSubtitle}>Intervalo de tiempo</Text>
        </View>

        {/* Botón de Borrar */}
        <TouchableOpacity
          onPress={() => eliminarIntervalo(item.id)}
          style={esquemaStyles.deleteButton}
          disabled={isDisabled}
        >
          {/* 3. Ícono rojo, directamente */}
          <MaterialIcons name="delete-outline" size={24} color="#C83C3C" />
        </TouchableOpacity>
        
      </View>
    </TouchableOpacity>
  );
};


  // Al confirmar el primer picker
  const onPressConfirmar = async () => {
    const dias = Number(pendingTime.days);
    if (dias === 0) {
      if (selectedId) actualizarTiempo(selectedId, pendingTime);
      else {
        const newId = Date.now().toString();
        setIntervalos(prev => [...prev, { id: newId, tiempo: pendingTime }]);
      }
      setModalVisible(false);
      return;
    }

    // Calcular fecha de evento
    const hoy = new Date();
    const fechaEvento = new Date(hoy);
    fechaEvento.setDate(hoy.getDate() + dias);
    const dd = String(fechaEvento.getDate()).padStart(2, '0');
    const mm = String(fechaEvento.getMonth() + 1).padStart(2, '0');
    const yyyy = fechaEvento.getFullYear();
    setEventDate(`${dd}/${mm}/${yyyy}`);

    setModalVisible(false);
    setEventModalVisible(true);
  };


const onConfirmarFecha = async () => {
  try {
    const dias = Number(pendingTime.days);
    const resumen = `Realizar Extracciones ${sampleName}`;
    const idEvento = await crearEventoLocalEnDias(dias, resumen);

    // Reemplazá `idPacienteSeleccionado` por tu variable real, ej. `selectedId`
    setTemporizadores(prev => {
      const prevData = prev[selectedId] || {};
      const nextIdx = (prevData.intervalIndex ?? 0) + 1;
      const updated = {
        ...prev,
        [selectedId]: {
          finished:    true,                       // el timer de días venció
          allFinished: true,                       // lo marcamos como finalizado
          intervalIndex: prevData.intervalIndex + 1 // avanzamos al “siguiente” índice
        }
      };
      console.log('✅ [EsquemaScreen] allFinished para', selectedId, updated[selectedId]);
      return updated;
    });

    const newId = Date.now().toString();
    setIntervalos(prev => [...prev, { id: newId, tiempo: pendingTime }]);

    Alert.alert('✅ Evento creado', `ID local: ${idEvento}`);
  } catch (e) {
    console.error('Error calendario nativo:', e);
    Alert.alert('❌ Error', e.message);
  } finally {
    setEventModalVisible(false);
  }
};


return (
    // 2. Usamos SafeAreaView (de globalStyles)
    <SafeAreaView style={styles.safeArea}>
      
      {/* 3. Header blanco (de globalStyles) */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => router.push("paciente")} // Mantenemos tu navegación
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={RFValue(24)} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sampleName || "Esquema"}</Text>
      </View>

      {/* 4. Contenedor principal (fondo gris, de globalStyles) */}
      <View style={styles.container}>

        {/* 5. Título de sección (de globalStyles) */}
        <Text style={styles.sectionTitle}>ESQUEMA DE MUESTREO</Text>

        <FlatList
          data={intervalos}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          style={{ width: "100%", flex: 1 }}
          // 6. Padding para los botones y estado vacío
          contentContainerStyle={{ paddingBottom: RFValue(150) }} 
          ListEmptyComponent={(
            // 7. Estado vacío (de globalStyles)
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No hay intervalos creados</Text>
              <Text style={styles.emptyStateText}>Presiona "AGREGAR" para comenzar</Text>
            </View>
          )}
        />
      </View>
         
      {/* 8. Contenedor de botones (de globalStyles) */}
       <View style={grupoStyles.bottomButtonContainer}>
          {/* Botón AGREGAR (con estilo flex: 1) */}
          <TouchableOpacity
            style={[
              grupoStyles.primaryButton,
              { flex: 1, marginRight: RFValue(5) }, // <-- Estilo de layout
              hideAddButtons && { backgroundColor: '#A9A9A9' }, 
              hideAddButtons && { opacity: 0.6 }                
            ]}
            onPress={() => {
              if (!hideAddButtons) {
                abrirModal(null);
              }
            }}
            disabled={hideAddButtons}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="add"
              size={RFValue(20)}
              color="#FFFFFF"
              style={{ marginRight: RFValue(8) }}
            />
            <Text style={grupoStyles.primaryButtonText}>AGREGAR</Text>
          </TouchableOpacity>
          {/* Botón CONTINUAR (con estilo flex: 1) */}
          <TouchableOpacity
            style={grupoStyles.secondaryButton}
            onPress={() => router.push({ pathname: "extracciones" })}
            activeOpacity={0.7}
          >
            <Text style={grupoStyles.secondaryButtonText}>CONTINUAR</Text>
            <MaterialIcons
              name="arrow-forward-ios"
              size={RFValue(18)} // Ligeramente más pequeño
              color="#FFFFFF"
              style={{ marginLeft: RFValue(8) }}
            />
          </TouchableOpacity>
      </View>

      {/* 9. Modales (movidos fuera del 'container' principal) */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={esquemaStyles.modalOverlay}>
          <View style={esquemaStyles.modalContainer}>
            <Text style={esquemaStyles.modalTitle}>SELECCIONAR TIEMPO</Text>
            <TimePicker onTimeChange={handleTimeChange} />
            <TouchableOpacity style={esquemaStyles.modalButton} onPress={onPressConfirmar}>
              <Text style={esquemaStyles.modalButtonText}>CONFIRMAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={eventModalVisible} transparent animationType="fade">
        <View style={esquemaStyles.modalOverlay}>
          <View style={esquemaStyles.modalContainer}>
            <Text style={esquemaStyles.modalTitle}>Se agregará un evento en Calendar el día:</Text>
            <Text style={[esquemaStyles.modalSubtitle, { marginVertical: 16 }]}>{eventDate}</Text>
            <TouchableOpacity style={esquemaStyles.modalButton} onPress={onConfirmarFecha}>
              <Text style={styles.esquemaStyles}>CONFIRMAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default EsquemaScreen;

// EsquemaScreen.js
import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, Alert } from "react-native";
import { useRouter } from "expo-router";
import styles from "../styles/globalStyles";
import TimePicker from "../components/TimePicker";
import { GlobalContext } from "../GlobalProvider";
import * as Calendar from 'expo-calendar';
import { MaterialIcons } from "@expo/vector-icons";
import buttonStyles from '../styles/buttonStyles';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import esquemaStyles from "../styles/esquemaStyles";


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
  return (
      <TouchableOpacity
        style={[
          esquemaStyles.intervalTimeContainer,
          hideAddButtons && { opacity: 0.5 }   
        ]}
        activeOpacity={0.7}
        onPress={() => {
          if (!hideAddButtons) {
            abrirModal(item.id);
          }
        }}
        disabled={hideAddButtons}              
      >
      <View style={esquemaStyles.intervalRow}>
        <Text style={esquemaStyles.intervalLabel}>Intervalos de tiempo:</Text>
        <View style={esquemaStyles.intervalTimeButton}>
          <Text style={esquemaStyles.intervalTimeText}>
            {item.tiempo.days > 0
              ? `${item.tiempo.days} día${item.tiempo.days > 1 ? 's' : ''}`
              : `${String(item.tiempo.hours).padStart(2,'0')}:${String(item.tiempo.minutes).padStart(2,'0')}`}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => eliminarIntervalo(item.id)}
        style={esquemaStyles.closeButton} // para ampliar la zona táctil de la X
      >
        <MaterialIcons name="close" size={20} color="#fff" />
      </TouchableOpacity>
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
<View style={styles.container}>
<View
  style={[
    styles.header,
    {
      flexDirection: 'row',        // eje principal horizontal
      justifyContent: 'flex-start',// pega todo al inicio
      alignItems: 'center',        // centra verticalmente
      paddingHorizontal: 16        // opcional, margen lateral
    }
  ]}
>
  <TouchableOpacity
    style={{ flexDirection: 'row', alignItems: 'center' }}
    onPress={() => router.push("paciente")}
  >
    <MaterialIcons name="arrow-back" size={24} color="#000" />
    <Text style={[styles.headerText, { marginLeft: 8 }]}>
      {sampleName}
    </Text>
  </TouchableOpacity>
</View>
      <View style={styles.fondoApp}>
        <Text style={styles.main}>ESQUEMA DE MUESTREO </Text>
        <FlatList
          data={intervalos}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80, paddingTop: 20,paddingHorizontal: 16 }}
        />
        {/* Modal primer flujo */}
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

        {/* Modal creación evento */}
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

        <TouchableOpacity
          style={[
            buttonStyles.buttonAgregar,
            hideAddButtons && { backgroundColor: '#A9A9A9' }, // gris si está deshabilitado
            hideAddButtons && { opacity: 0.6 }                // opcional: se ve “apagado”
          ]}
          onPress={() => {
            if (!hideAddButtons) {
              abrirModal(null);
            }
          }}
          disabled={hideAddButtons}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons
              name="add"
              size={RFValue(20)}
              color="#FFFFFF"
              style={{ marginRight: RFValue(8) }}
            />
            <Text style={buttonStyles.text}>AGREGAR</Text>
          </View>
        </TouchableOpacity>

            <TouchableOpacity
              style={buttonStyles.buttonContinuar}
              onPress={() => router.push({ pathname: "extracciones" })}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                
                <Text style={buttonStyles.text}>CONTINUAR</Text>
              
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={RFValue(20)}
                  color="#FFFFFF"                
                  style={{ marginLeft: RFValue(8) }}
                />
              </View>
            </TouchableOpacity>
      </View>
    </View>
  );
};

export default EsquemaScreen;

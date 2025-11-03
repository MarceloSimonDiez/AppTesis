import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router'; // Lo guardamos para la navegación futura (ej: Pacientes)
import { GlobalContext } from '../GlobalProvider';
import styles from '../styles/globalStyles';
import esquemaStyles from '../styles/esquemaStyles';
import grupoStyles from '../styles/grupoStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';

// --- LÓGICA DEL EDITOR DE INTERVALOS (Fusionada) ---
import TimePicker from "../components/TimePicker";
import * as Calendar from "expo-calendar";

async function crearEventoLocalEnDias(dias, summary) {
  // (Tu función de calendario original)
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') throw new Error('Permiso de calendario denegado');
  // ... (resto de la función de calendario)
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
// --- FIN DE LÓGICA DEL EDITOR ---


// --- COMPONENTE PRINCIPAL (Ahora maneja ambas vistas) ---
const EsquemasScreen = () => {
  const router = useRouter();
  const { 
    esquemas, 
    saveEsquemas, 
    hideAddButtons,
    sampleName, // (Necesario para el calendario)
    setTemporizadores // (Necesario para el calendario)
  } = useContext(GlobalContext);

  // --- ESTADO GENERAL ---
  // Estado para saber qué vista mostrar: 'lista' o 'editor'
  const [esquemaSeleccionado, setEsquemaSeleccionado] = useState(null); // <-- ¡CLAVE!

  // --- ESTADOS DE LA VISTA "LISTA" ---
  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [nombreEsquemaNuevo, setNombreEsquemaNuevo] = useState('');

  // --- ESTADOS DE LA VISTA "EDITOR" ---
  const [nombreEsquemaEdit, setNombreEsquemaEdit] = useState("");
  const [intervalosLocales, setIntervalosLocales] = useState([]);
  const [modalIntervaloVisible, setModalIntervaloVisible] = useState(false);
  const [selectedIntervaloId, setSelectedIntervaloId] = useState(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [pendingTime, setPendingTime] = useState({ days: 0, hours: 0, minutes: 0 });

  // Cargar datos en el editor cuando un esquema es seleccionado
  useEffect(() => {
    if (esquemaSeleccionado) {
      // Estamos en modo "Editor"
      setNombreEsquemaEdit(esquemaSeleccionado.nombre);
      setIntervalosLocales(esquemaSeleccionado.intervalos || []);
    }
  }, [esquemaSeleccionado]);


  // --- FUNCIONES DE LA VISTA "LISTA" ---

  const handleAbrirModalCrear = () => {
    setNombreEsquemaNuevo('');
    setModalCrearVisible(true);
  };

  const handleConfirmarCrear = () => {
    if (!nombreEsquemaNuevo.trim()) {
      Alert.alert('Error', 'El nombre del esquema no puede estar vacío.');
      return;
    }

    const nuevoEsquema = {
      id: Date.now().toString(),
      nombre: nombreEsquemaNuevo.trim(),
      intervalos: [],
    };

    const nuevaListaEsquemas = [...esquemas, nuevoEsquema];
    saveEsquemas(nuevaListaEsquemas);

    setModalCrearVisible(false);
    
    // --- CAMBIO CLAVE: En lugar de navegar, seleccionamos el esquema ---
    setEsquemaSeleccionado(nuevoEsquema);
    // ---
  };

  const handleEditar = (esquema) => {
    // --- CAMBIO CLAVE: En lugar de navegar, seleccionamos el esquema ---
    setEsquemaSeleccionado(esquema);
    // ---
  };

  const handleEliminar = (esquemaId, nombreEsquema) => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar el esquema "${nombreEsquema}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const nuevaListaEsquemas = esquemas.filter((e) => e.id !== esquemaId);
            saveEsquemas(nuevaListaEsquemas);
          },
        },
      ]
    );
  };

  const renderItemEsquema = ({ item }) => {
    const numIntervalos = item.intervalos ? item.intervalos.length : 0;
    const subtitulo = `${numIntervalos} intervalo${numIntervalos === 1 ? '' : 's'}`;
    const isDisabled = hideAddButtons;

    return (
      <View style={[esquemaStyles.cardContainer, isDisabled && esquemaStyles.cardDisabled]}>
        <View style={[esquemaStyles.sideBar, { backgroundColor: '#663399' }]} />
        <View style={esquemaStyles.contentContainer}>
          <View style={esquemaStyles.textContainer}>
            <Text style={esquemaStyles.cardTitle}>{item.nombre}</Text>
            <Text style={esquemaStyles.cardSubtitle}>{subtitulo}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleEditar(item)} // Pasa el objeto completo
            style={esquemaStyles.deleteButton}
            disabled={isDisabled}
          >
            <MaterialIcons name="edit" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleEliminar(item.id, item.nombre)}
            style={esquemaStyles.deleteButton}
            disabled={isDisabled}
          >
            <MaterialIcons name="delete-outline" size={24} color="#C83C3C" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };


  // --- FUNCIONES DE LA VISTA "EDITOR" ---

  const handleTimeChange = ({ days = 0, hours = 0, minutes = 0 }) => {
    setPendingTime({ days, hours, minutes });
  };

  const abrirModalIntervalo = (id) => {
    if (id) {
      const existing = intervalosLocales.find(item => item.id === id);
      setPendingTime(existing.tiempo);
    } else {
      setPendingTime({ days: 0, hours: 0, minutes: 0 });
    }
    setSelectedIntervaloId(id);
    setModalIntervaloVisible(true);
  };

  const eliminarIntervalo = (id) => {
    setIntervalosLocales(prev => prev.filter(item => item.id !== id));
  };

  const actualizarTiempo = (id, nuevoTiempo) => {
    setIntervalosLocales(prev => prev.map(item => item.id === id ? { ...item, tiempo: nuevoTiempo } : item));
  };

  const onPressConfirmarIntervalo = async () => {
    const dias = Number(pendingTime.days);
    if (dias === 0) {
      if (selectedIntervaloId) {
        actualizarTiempo(selectedIntervaloId, pendingTime);
      } else {
        const newId = Date.now().toString();
        setIntervalosLocales(prev => [...prev, { id: newId, tiempo: pendingTime }]);
      }
      setModalIntervaloVisible(false);
      return;
    }
    // Lógica del calendario...
    const hoy = new Date();
    const fechaEvento = new Date(hoy);
    fechaEvento.setDate(hoy.getDate() + dias);
    const dd = String(fechaEvento.getDate()).padStart(2, '0');
    const mm = String(fechaEvento.getMonth() + 1).padStart(2, '0');
    const yyyy = fechaEvento.getFullYear();
    setEventDate(`${dd}/${mm}/${yyyy}`);
    setModalIntervaloVisible(false);
    setEventModalVisible(true);
  };

  const onConfirmarFecha = async () => {
    try {
      const dias = Number(pendingTime.days);
      const resumen = `Realizar Extracciones ${sampleName}`;
      const idEvento = await crearEventoLocalEnDias(dias, resumen);
      setTemporizadores(prev => ({ ...prev, [idEvento]: true }));
      const newId = Date.now().toString();
      setIntervalosLocales(prev => [...prev, { id: newId, tiempo: pendingTime }]);
      Alert.alert('✅ Evento creado', `ID local: ${idEvento}`);
    } catch (e) {
      console.error('Error calendario nativo:', e);
      Alert.alert('❌ Error', e.message);
    } finally {
      setEventModalVisible(false);
    }
  };

  const renderItemIntervalo = ({ item, index }) => {
    const timeString =
    item.tiempo.days > 0
      ? `${item.tiempo.days} día${item.tiempo.days > 1 ? 's' : ''}`
      : `${String(item.tiempo.hours).padStart(2, '0')}:${String(
          item.tiempo.minutes
        ).padStart(2, '0')}`;
    const isDisabled = hideAddButtons;
    const titulo = `Toma ${index + 1}`;
    const subtitulo = `Tiempo: ${timeString}`;

    return (
      <TouchableOpacity
        style={[ esquemaStyles.cardContainer, isDisabled && esquemaStyles.cardDisabled ]}
        activeOpacity={0.8}
        onPress={() => !isDisabled && abrirModalIntervalo(item.id)}
        disabled={isDisabled}
      >
        <View style={[esquemaStyles.sideBar, { backgroundColor: '#663399' }]} />
        <View style={esquemaStyles.contentContainer}>
          <View style={esquemaStyles.textContainer}>
            <Text style={esquemaStyles.cardTitle}>{titulo}</Text>
            <Text style={esquemaStyles.cardSubtitle}>{subtitulo}</Text>
          </View>
          <TouchableOpacity
            onPress={() => eliminarIntervalo(item.id)}
            style={esquemaStyles.deleteButton}
            disabled={isDisabled}
          >
            <MaterialIcons name="delete-outline" size={24} color="#C83C3C" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Función para guardar el esquema editado y VOLVER A LA LISTA
  const handleGuardarEsquemaEditado = () => {
    if (!nombreEsquemaEdit.trim()) {
      Alert.alert("Error", "El nombre del esquema no puede estar vacío.");
      return;
    }
    
    const esquemaActualizado = {
      ...esquemaSeleccionado,
      nombre: nombreEsquemaEdit,
      intervalos: intervalosLocales
    };

    const nuevaListaGlobal = esquemas.map(e => 
      e.id === esquemaActualizado.id ? esquemaActualizado : e
    );
    
    saveEsquemas(nuevaListaGlobal);
    
    // --- CAMBIO CLAVE: Volvemos a la vista de lista ---
    setEsquemaSeleccionado(null);
    // ---
  };


  // --- RENDERIZADO CONDICIONAL ---

  // VISTA 2: Si hay un esquema seleccionado, mostramos el EDITOR
  if (esquemaSeleccionado) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={() => setEsquemaSeleccionado(null)} // Botón para volver a la lista
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={RFValue(24)} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Esquema</Text>
        </View>

        <View style={styles.container}>
          <Text style={styles.sectionTitle}>NOMBRE DEL ESQUEMA</Text>
          <TextInput
            style={[styles.textInput, {borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 10}]} // Estilo inline para text input
            value={nombreEsquemaEdit}
            onChangeText={setNombreEsquemaEdit}
            placeholder="Ej: Esquema Diurno"
            placeholderTextColor="#999"
            editable={!hideAddButtons}
          />

          <Text style={[styles.sectionTitle, { marginTop: RFValue(20) }]}>INTERVALOS DE TIEMPO</Text>
          <FlatList
            data={intervalosLocales}
            keyExtractor={item => item.id}
            renderItem={renderItemIntervalo} // Usa el render de intervalos
            style={{ width: "100%", flex: 1 }}
            contentContainerStyle={{ paddingBottom: RFValue(150) }}
            ListEmptyComponent={(
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No hay intervalos creados</Text>
                <Text style={styles.emptyStateText}>Presiona "AGREGAR" para comenzar</Text>
              </View>
            )}
          />
        </View>

        {/* Botones del EDITOR */}
        <View style={grupoStyles.bottomButtonContainer}>
          <TouchableOpacity
            style={[ grupoStyles.primaryButton, { flex: 1, marginRight: RFValue(5) }, hideAddButtons && { backgroundColor: '#A9A9A9', opacity: 0.6 } ]}
            onPress={() => !hideAddButtons && abrirModalIntervalo(null)}
            disabled={hideAddButtons}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={RFValue(20)} color="#FFFFFF" style={{ marginRight: RFValue(8) }} />
            <Text style={grupoStyles.primaryButtonText}>AGREGAR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[grupoStyles.secondaryButton, { flex: 1, marginLeft: RFValue(5) }]}
            onPress={handleGuardarEsquemaEditado} // Llama a la función de guardar y volver
            activeOpacity={0.7}
          >
            <Text style={grupoStyles.secondaryButtonText}>GUARDAR</Text>
            <MaterialIcons name="save" size={RFValue(18)} color="#FFFFFF" style={{ marginLeft: RFValue(8) }} />
          </TouchableOpacity>
        </View>

        {/* Modales del EDITOR */}
        <Modal visible={modalIntervaloVisible} transparent animationType="fade">
          <View style={esquemaStyles.modalOverlay}>
            <View style={esquemaStyles.modalContainer}>
              <Text style={esquemaStyles.modalTitle}>SELECCIONAR TIEMPO</Text>
              <TimePicker onTimeChange={handleTimeChange} />
              <TouchableOpacity style={esquemaStyles.modalButton} onPress={onPressConfirmarIntervalo}>
                <Text style={esquemaStyles.modalButtonText}>CONFIRMAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={eventModalVisible} transparent animationType="fade">
          {/* ... (Tu modal de evento de calendario) ... */}
        </Modal>
      </SafeAreaView>
    );
  }

  // VISTA 1: Si no hay esquema seleccionado, mostramos la LISTA
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        {/* Este botón 'back' es por si esta pantalla NO es el index.js */}
        <TouchableOpacity onPress={() => router.push("grupo")} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={RFValue(24)} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Esquemas</Text>
      </View>

      <View style={styles.container}>
        <FlatList
          data={esquemas}
          keyExtractor={(item) => item.id}
          renderItem={renderItemEsquema} // Usa el render de esquemas
          style={{ width: '100%', flex: 1 }}
          contentContainerStyle={{ paddingBottom: RFValue(150) }}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No hay esquemas creados</Text>
              <Text style={styles.emptyStateText}>
                Presiona "CREAR ESQUEMA" para comenzar
              </Text>
            </View>
          }
        />
      </View>

      {/* Botón de la LISTA */}
      <View style={grupoStyles.bottomButtonContainer}>
        {/* Botón CREAR ESQUEMA (Izquierda) */}
        <TouchableOpacity
          style={[
            grupoStyles.primaryButton,
            { flex: 1, marginRight: RFValue(5) }, // Estilo ajustado
            hideAddButtons && { backgroundColor: '#A9A9A9', opacity: 0.6 },
          ]}
          onPress={handleAbrirModalCrear}
          disabled={hideAddButtons}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="add"
            size={RFValue(20)}
            color="#FFFFFF"
            style={{ marginRight: RFValue(8) }}
          />
          <Text style={grupoStyles.primaryButtonText}>CREAR ESQUEMA</Text>
        </TouchableOpacity>

        {/* Botón CONTINUAR (Derecha) */}
          <TouchableOpacity
            style={grupoStyles.secondaryButton} // <-- Nuevo estilo
            onPress={() => router.push({ pathname: "paciente" })}
            activeOpacity={0.7}
          >
          <Text style={grupoStyles.secondaryButtonText}>CONTINUAR</Text>
          <MaterialIcons
            name="arrow-forward"
            size={RFValue(18)}
            color="#FFFFFF"
            style={{ marginLeft: RFValue(8) }}
          />
        </TouchableOpacity>
      </View>
      

      {/* Modal de la LISTA (para crear) */}
      <Modal
        visible={modalCrearVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalCrearVisible(false)}
      >
        <View style={esquemaStyles.modalOverlay}>
          <View style={esquemaStyles.modalContainer}>
            <Text style={esquemaStyles.modalTitle}>Crear Nuevo Esquema</Text>
            <TextInput
              style={[styles.textInput, { width: '100%', marginVertical: 20, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 12 }]} // Estilo inline
              placeholder="Nombre del esquema (Ej: Diurno)"
              placeholderTextColor="#999"
              value={nombreEsquemaNuevo}
              onChangeText={setNombreEsquemaNuevo}
            />
            <TouchableOpacity
              style={esquemaStyles.modalButton}
              onPress={handleConfirmarCrear}
            >
              <Text style={esquemaStyles.modalButtonText}>CONFIRMAR Y EDITAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default EsquemasScreen;

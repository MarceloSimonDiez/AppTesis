import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  SafeAreaView, // <-- 1. IMPORTAR SafeAreaView
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { GlobalContext } from "../GlobalProvider";
import styles from "../styles/globalStyles"; // Usamos 100% los estilos globales
import ModalPaciente from "../components/ModalIndividuo";
import { MaterialIcons } from "@expo/vector-icons";
import { responsiveFontSize as rf } from "react-native-responsive-dimensions"; // <-- Usamos 'rf'
import grupoStyles from "../styles/grupoStyles";
import { RFValue } from "react-native-responsive-fontsize";
import { useTranslation } from 'react-i18next';


const PacienteScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    dataLoaded,
    grupos = [],
    pacientes = [],
    setPacientes,
    esquemas = [],
    sampleName
  } = useContext(GlobalContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [isViewingMode, setIsViewingMode] = useState(false);
  const [esquemaModalVisible, setEsquemaModalVisible] = useState(false);
  const [pacienteParaEsquema, setPacienteParaEsquema] = useState(null);
  const [selectedEsquemaId, setSelectedEsquemaId] = useState(null);

  useEffect(() => {
    // Si la data no está cargada, no hacemos nada
    if (!dataLoaded) {
      return;
    }
    // --- LÓGICA DE BORRADO TOTAL ---
    if (grupos.length === 0) {
      setPacientes([]);
      return;
    }
    // --- LÓGICA DE CREACIÓN/ACTUALIZACIÓN ---
    // 1. Genera la lista "maestra" de pacientes SIEMPRE desde los grupos
    const pacientesGenerados = grupos.flatMap((grupo) =>
      Array.from({ length: parseInt(grupo.cantidadPacientes, 10) || 0 }).map((_, i) => ({
        id: `${grupo.id}-paciente-${i}`,
        nombre: "", // <-- Valor por defecto
        grupoName: grupo.name,
        grupoColor: grupo.color,
        sexo: "", // <-- Valor por defecto
        edad: "", // <-- Valor por defecto
        peso: "", // <-- Valor por defecto
        descripcion: "", // <-- Valor por defecto
        esquemaId: null, // <-- Valor por defecto
        esquemaName: null, // <-- Valor por defecto
      }))
    );

    // 2. Actualizamos el estado global
    setPacientes((pacientesAnteriores) => {

      // Creamos un "mapa" de los pacientes antiguos para buscar
      // sus datos guardados (nombre, sexo, esquema, etc.) de forma eficiente.
      const mapaPacientesAnteriores = new Map(
        pacientesAnteriores.map(p => [p.id, p])
      );

      // 3. Creamos la nueva lista de pacientes
      const nuevaListaActualizada = pacientesGenerados.map(pacienteGenerado => {

        // Buscamos si este paciente (por su ID) ya existía en la lista anterior
        const pacienteAntiguo = mapaPacientesAnteriores.get(pacienteGenerado.id);

        if (pacienteAntiguo) {
          return {
            ...pacienteAntiguo, // Base: todos los datos guardados
            grupoName: pacienteGenerado.grupoName, // Actualiza por si el grupo cambió
            grupoColor: pacienteGenerado.grupoColor, // Actualiza por si el grupo cambió
          };
        } else {
          return pacienteGenerado;
        }
      });

      // 4. Devolvemos la nueva lista completa.
      return nuevaListaActualizada;
    });

    // Añadimos setPacientes por buenas prácticas, aunque venga de un context
  }, [dataLoaded, grupos, setPacientes]);

  // --- Lógica de Modales (Sin cambios funcionales) ---
  const handleAddDetalles = (pacienteId, detalles) => {
    setPacientes(prev =>
      prev.map(p => (p.id === pacienteId ? { ...p, ...detalles } : p))
    );
    setModalVisible(false);
  };

  const handleViewDetalles = (paciente) => {
    setSelectedPaciente(paciente);
    setIsViewingMode(true);
    setModalVisible(true);
  };

  const handleOpenEsquemaModal = (paciente) => {
    setPacienteParaEsquema(paciente);
    setSelectedEsquemaId(paciente.esquemaAsignado || null);
    setEsquemaModalVisible(true);
  };

  const handleAssignEsquema = () => {
    // 1. Busca el esquema completo usando el ID
    const esquemaCompleto = esquemas.find(e => e.id === selectedEsquemaId);
    if (!esquemaCompleto) {
      // (Si no se seleccionó nada o hay error, solo cierra)
      setEsquemaModalVisible(false);
      return;
    }
    // 2. Actualiza el paciente guardando ID y Nombre
    setPacientes(prev =>
      prev.map(p =>
        p.id === pacienteParaEsquema.id
          ? {
            ...p,
            esquemaId: esquemaCompleto.id,     // <-- Guardas el ID
            esquemaName: esquemaCompleto.nombre // <-- Guardas el Nombre
          }
          : p
      )
    );
    setEsquemaModalVisible(false);
    setPacienteParaEsquema(null);
    setSelectedEsquemaId(null);
  };
  const handleContinuar = () => {
    router.push({ pathname: "extracciones" });
  };

  // --- Renderizado de la tarjeta de Paciente (Sin cambios) ---
  const renderPaciente = ({ item }) => {
    const color = item.grupoColor || '#CCC';
    const detallesCompletos = item.nombre && item.sexo && item.edad && item.peso;

    return (
      <View style={styles.cardContainer}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />
        <View style={styles.cardInfoWrapper}>
          <Text style={styles.cardTitle}>{item.nombre || t('individuos.sin_nombre')}</Text>
          <Text style={styles.cardSubtitle}>{item.grupoName}</Text>

          <TouchableOpacity
            style={styles.cardInfoRow}
            onPress={() => handleViewDetalles(item)}
          >
            <MaterialIcons
              name={detallesCompletos ? "check-circle" : "edit"}
              size={rf(2.2)}
              color={detallesCompletos ? "#4CAF50" : "#663399"}
            />
            <Text style={[styles.cardInfoText, { color: detallesCompletos ? '#333' : '#663399' }]}>
              {detallesCompletos ? t('individuos.detalles_ok') : t('individuos.editar_detalles')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardInfoRow}
            onPress={() => handleOpenEsquemaModal(item)}
          >
            <MaterialIcons
              name={item.esquemaId ? "label" : "label-outline"}
              size={rf(2.2)}
              color={item.esquemaId ? "#333" : "#663399"}
            />
            <Text style={[styles.cardInfoText, { color: item.esquemaAsignado ? '#333' : '#663399' }]}>
              {item.esquemaName || t('individuos.asignar_esquema')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>

      <View style={grupoStyles.headerContainer}>


        <TouchableOpacity onPress={() => router.push("esquema")} style={grupoStyles.backButton}>
          <MaterialIcons name="arrow-back" size={RFValue(24)} color="#333" />
        </TouchableOpacity>
        <Text style={grupoStyles.headerTitle}>{sampleName || t('home.placeholder')}</Text>
      </View>


      {/* --- 4. CONTENIDO DE LA PANTALLA --- */}
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>{t('individuos.titulo_seccion')}</Text>

        {pacientes.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>{t('grupos.emptyState.titulo')}</Text>
            <Text style={styles.emptyStateText}>{t('individuos.vuelve_atras')}</Text>
          </View>
        ) : (
          <FlatList
            data={pacientes}
            keyExtractor={(item) => item.id}
            renderItem={renderPaciente}
            style={{ width: '100%', flex: 1 }}
            contentContainerStyle={{ paddingBottom: 100 }} // <-- Espacio para el botón
          />
        )}
      </View>

      {/* --- Botón Inferior (Flotante) --- */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleContinuar}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>{t('common.continuar')}</Text>
          <MaterialIcons
            name="arrow-forward-ios"
            size={RFValue(18)} // 
            color="#fff"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      {/* --- Modales (Sin cambios) --- */}
      <ModalPaciente
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(detalles) => handleAddDetalles(selectedPaciente.id, detalles)}
        paciente={selectedPaciente}
        isViewingMode={isViewingMode}
        onEdit={() => setIsViewingMode(false)}
      />

      <Modal
        transparent={true}
        visible={esquemaModalVisible}
        animationType="fade"
        onRequestClose={() => setEsquemaModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{t('individuos.asignar_esquema')}</Text>
            <Text style={styles.modalPacienteName}>{pacienteParaEsquema?.nombre || t('individuos.sin_nombre')}</Text>
            <ScrollView style={styles.modalScrollView}>
              {esquemas.map((esquema) => (
                <TouchableOpacity
                  key={esquema.id}
                  style={[
                    styles.esquemaOption,
                    selectedEsquemaId === esquema.id && styles.esquemaOptionSelected // <-- Compara IDs
                  ]}
                  onPress={() => setSelectedEsquemaId(esquema.id)}
                >
                  <Text style={[
                    styles.esquemaOption,
                    selectedEsquemaId === esquema.id && styles.esquemaOptionSelected // <-- Compara IDs
                  ]}>
                    {esquema.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.primaryButton, { width: '100%', marginTop: 15 }]}
              onPress={handleAssignEsquema}
            >
              <Text style={styles.primaryButtonText}>{t('common.guardar')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


    </SafeAreaView>
  );
};

export default PacienteScreen;




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
import { useRouter, Stack } from "expo-router";
import { GlobalContext } from "../GlobalProvider";
import styles from "../styles/globalStyles"; // Usamos 100% los estilos globales
import ModalPaciente from "../components/ModalIndividuo";
import { MaterialIcons } from "@expo/vector-icons";
import { responsiveFontSize as rf } from "react-native-responsive-dimensions"; // <-- Usamos 'rf'
import grupoStyles from "../styles/grupoStyles";
import {  RFValue } from "react-native-responsive-fontsize";
const PacienteScreen = () => {
  const router = useRouter();
  
  // --- 2. ASEGURAR VALORES POR DEFECTO ---
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
  const [selectedEsquema, setSelectedEsquema] = useState(null);

  useEffect(() => {
    if (dataLoaded && grupos.length > 0) {
      const pacientesGenerados = grupos.flatMap((grupo) =>
        Array.from({ length: parseInt(grupo.cantidadPacientes, 10) || 0 }).map((_, i) => ({
          id: `${grupo.id}-paciente-${i}`,
          nombre: "",
          grupoName: grupo.name,
          grupoColor: grupo.color, // Traemos el color del grupo
          sexo: "",
          edad: "",
          peso: "",
          descripcion: "",
          esquemaAsignado: "",
        }))
      );

      setPacientes((prev) => {
        const pacientesMap = new Map(prev.map(p => [p.id, p]));
        pacientesGenerados.forEach(p => {
          if (!pacientesMap.has(p.id)) {
            pacientesMap.set(p.id, p);
          } else {
            // Arreglo del typo: debe ser 'pacientesMap'
            const existente = pacientesMap.get(p.id);
            pacientesMap.set(p.id, { ...existente, ...p, ...existente }); 
          }
        });
        return Array.from(pacientesMap.values());
      });
    }
  }, [dataLoaded, grupos]);

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
    setSelectedEsquema(paciente.esquemaAsignado || null);
    setEsquemaModalVisible(true);
  };

  const handleAssignEsquema = () => {
    if (!pacienteParaEsquema) return;
    setPacientes(prev => 
      prev.map(p => 
        p.id === pacienteParaEsquema.id ? { ...p, esquemaAsignado: selectedEsquema } : p
      )
    );
    setEsquemaModalVisible(false);
    setPacienteParaEsquema(null);
    setSelectedEsquema(null);
  };

  const handleContinuar = () => {
      router.push({ pathname: "esquema" });
  };

  // --- Renderizado de la tarjeta de Paciente (Sin cambios) ---
  const renderPaciente = ({ item }) => {
    const color = item.grupoColor || '#CCC';
    const detallesCompletos = item.nombre && item.sexo && item.edad && item.peso;

    return (
      <View style={styles.cardContainer}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />
        <View style={styles.cardInfoWrapper}>
          <Text style={styles.cardTitle}>{item.nombre || `Individuo ${item.id.split('-').pop()}`}</Text>
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
              {detallesCompletos ? "Detalles Completos" : "Editar Detalles"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cardInfoRow}
            onPress={() => handleOpenEsquemaModal(item)}
          >
            <MaterialIcons 
              name={item.esquemaAsignado ? "label" : "label-outline"} 
              size={rf(2.2)} 
              color={item.esquemaAsignado ? "#333" : "#663399"} 
            />
            <Text style={[styles.cardInfoText, { color: item.esquemaAsignado ? '#333' : '#663399' }]}>
              {item.esquemaAsignado || "Asignar Esquema"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

return (
    <SafeAreaView style={styles.safeArea}>
      
  <View style={grupoStyles.headerContainer}>


        <TouchableOpacity onPress={() => router.push("grupo")} style={grupoStyles.backButton}>
          <MaterialIcons name="arrow-back" size={RFValue(24)} color="#333" />
        </TouchableOpacity>
        <Text style={grupoStyles.headerTitle}>{sampleName || "Muestra Farmacológica"}</Text>
      </View>  
      
  
      {/* --- 4. CONTENIDO DE LA PANTALLA --- */}
      <View style={styles.container}> 
        <Text style={styles.sectionTitle}>INDIVIDUOS</Text>

        {pacientes.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No hay individuos.</Text>
            <Text style={styles.emptyStateText}>Vuelve atrás y agrega grupos primero.</Text>
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
          <Text style={styles.primaryButtonText}>CONTINUAR</Text>
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
        onAdd={(detalles) => handleAddDetalles(selectedPaciente.id, detalles)}
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
            {/* ... Contenido del modal sin cambios ... */}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default PacienteScreen;
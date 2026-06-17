import React, { useContext, useState, useEffect } from "react";
// Importamos SafeAreaView para manejar los 'notches' del teléfono
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert } from "react-native";
import { GlobalContext } from "../GlobalProvider"; // Importamos el contexto
import { useRouter } from "expo-router";
import styles from "../styles/globalStyles";
import ModalForm from "../components/ModalGrupo";
import { MaterialIcons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import grupoStyles from "../styles/grupoStyles";
import { useTranslation } from 'react-i18next';

const GROUP_COLORS = [
  "rgba(89, 10, 131, 0.94)",
  "rgba(181, 18, 18, 0.94)",
  "rgba(30, 10, 131, 0.94)",
  "rgba(10, 131, 71, 0.94)",
  "rgba(180, 12, 146, 0.94)",
  "rgba(24, 171, 184, 0.94)",
  "rgba(231, 216, 6, 0.97)",
  "rgba(243, 86, 18, 0.94)",
  "rgba(15, 201, 186, 0.94)",
  "rgb(14, 100, 227)",
  "rgb(10, 177, 60)",         // Verde brillante
  "rgb(255, 128, 0)",        // Naranja puro
  "rgb(130, 50, 220)",       // Violeta
  "rgb(0, 130, 130)",        // Verde azulado (Teal)
  "rgb(220, 50, 50)",        // Rojo claro
  "rgb(150, 100, 50)",       // Marrón (Tierra)
  "rgb(50, 150, 220)",       // Azul cielo
  "rgb(200, 180, 0)",        // Dorado / Mostaza
  "rgb(200, 80, 200)",       // Rosa / Lavanda
  "rgb(110, 110, 110)",      // Gris oscuro
];


const GrupoScreen = () => {
  const { t } = useTranslation();
  const { grupos, setGrupos, hideAddButtons, sampleName } = useContext(GlobalContext); // Traemos sampleName
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState(null);

  // --- FUNCIÓN handleAddGroup (CORREGIDA) ---
  //    (Para guardar el color en el objeto)
  const handleAddGroup = (grupoData) => {
    if (grupoEditando) {
      // Lógica de Edición:
      // Combina los datos del modal (nombre, etc.) con el grupo existente (que ya tiene ID y color)
      setGrupos(grupos.map((g) => (g.id === grupoData.id ? { ...g, ...grupoData } : g)));
    } else {
      // Lógica de Agregar:
      // Asigna un color de la lista basado en la cantidad de grupos
      const newColor = GROUP_COLORS[grupos.length % GROUP_COLORS.length];

      const newGroup = {
        ...grupoData, // Los datos del modal
        id: Date.now().toString() + '-' + Math.floor(Math.random() * 1000), // ID único
        color: newColor, // <-- ¡AQUÍ GUARDAMOS EL COLOR!
      };
      setGrupos([...grupos, newGroup]);
    }
    setGrupoEditando(null);
  };

  const handleEdit = (grupo) => {
    setGrupoEditando(grupo);
    setModalVisible(true);
  };

  const handleRemove = (id) => {
    Alert.alert(
      "Eliminar Grupo",
      "¿Está seguro que desea eliminar este grupo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: () => setGrupos(grupos.filter((g) => g.id !== id)),
          style: "destructive",
        },
      ]
    );
  };
  // --- FIN DE LÓGICA FUNCIONAL ---

  // --- RENDER ITEM (Modificado estéticamente) ---
  //    (Para mostrar la barra de color)
  const renderItem = ({ item }) => {
    // El color ahora viene de 'item.color'
    // Añadimos un color de "fallback" por si un grupo viejo no lo tiene
    const grupoColor = item.color || GROUP_COLORS[0];

    return (
      // Aplicamos el estilo de tarjeta blanca (sin cambios)
      <View style={grupoStyles.grupoContainer}>

        {/* --- AÑADIDO: La barra de color --- */}
        <View style={[grupoStyles.colorBar, { backgroundColor: grupoColor }]} />

        {/* --- AÑADIDO: Un 'wrapper' para el contenido --- */}
        <View style={grupoStyles.grupoContentWrapper}>
          <Text style={grupoStyles.grupoName}>{item.name}</Text>

          {/* Iconos (sin cambios) */}
          <TouchableOpacity onPress={() => handleEdit(item)}>
            <MaterialIcons
              name="edit"
              size={RFValue(24)}
              color="#663399"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleRemove(item.id)} style={{ marginLeft: 15 }}>
            <MaterialIcons name="delete-outline" size={30} color="#C83C3C" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    // Usamos SafeAreaView para el header
    <SafeAreaView style={grupoStyles.safeArea}>
      <View style={grupoStyles.headerContainer}>
        <Text style={grupoStyles.headerTitle}>{sampleName || "Muestra Farmacológica"}</Text>
      </View>
      <View style={[styles.fondoApp, { flex: 1, alignItems: 'center', paddingHorizontal: RFValue(15) }]}>

        <Text style={grupoStyles.sectionTitle}>{t('grupos.seccion_experimental')}</Text>

        {grupos.length === 0 ? (
          // --- NUEVO: Estado vacío ---
          <View style={grupoStyles.emptyStateContainer}>
            <Text style={grupoStyles.emptyStateText}>{t('grupos.emptyState.titulo')}</Text>
            <Text style={grupoStyles.emptyStateText}>{t('grupos.emptyState.subtitulo')}</Text>
          </View>
        ) : (
          // --- Tu FlatList (sin cambios funcionales) ---
          <FlatList
            data={grupos}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={{ width: "100%", flex: 1 }}
            contentContainerStyle={{ paddingBottom: RFValue(150) }} // Espacio para los botones
          />
        )}

        {/* --- NUEVO: Contenedor de botones fijos abajo --- */}
        <View style={grupoStyles.bottomButtonContainer}>
          {/* Botón AGREGAR (Estilo modificado) */}
          <TouchableOpacity
            style={[
              grupoStyles.primaryButton,
              { flex: 1, marginRight: RFValue(5) }, // <-- Estilo de layout
              hideAddButtons && { backgroundColor: '#A9A9A9' },
              hideAddButtons && { opacity: 0.6 }
            ]}
            onPress={() => {
              setGrupoEditando(null);
              setModalVisible(true);
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
            <Text style={grupoStyles.primaryButtonText}>{t('common.agregar')}</Text>
          </TouchableOpacity>

          {/* Botón CONTINUAR (Estilo modificado) */}
          <TouchableOpacity
            style={grupoStyles.secondaryButton} // <-- Nuevo estilo
            onPress={() => router.push({ pathname: "esquema" })}
            activeOpacity={0.7}
          >
            <Text style={grupoStyles.secondaryButtonText}>{t('common.continuar')}</Text>
            <MaterialIcons
              name="arrow-forward-ios"
              size={RFValue(18)} // Ligeramente más pequeño
              color="#FFFFFF"
              style={{ marginLeft: RFValue(8) }}
            />
          </TouchableOpacity>
        </View>

        {/* --- Modal (Sin cambios) --- */}
        <ModalForm
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onAdd={handleAddGroup}
          grupoEditando={grupoEditando}
        />
      </View>
    </SafeAreaView>
  );
};

export default GrupoScreen;
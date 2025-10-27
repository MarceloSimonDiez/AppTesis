import React, { useContext, useState, useEffect} from "react";
import { View, Text, TouchableOpacity, FlatList , } from "react-native";
import { GlobalContext } from "../GlobalProvider"; // Importamos el contexto
import { useRouter } from "expo-router";
import styles from "../styles/globalStyles";
import ModalForm from "../components/ModalGrupo";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import buttonStyles from '../styles/buttonStyles';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import grupoStyles from "../styles/grupoStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";


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
];

const GrupoScreen = () => {
  const router = useRouter();
  const {
    sampleName,
    grupos,
    addGroup,
    updateGroup,
    deleteGroup,
    colorIndex,
    setColorIndex,
  } = useContext(GlobalContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState(null);
  const { hideAddButtons } = useContext(GlobalContext);
  
    useEffect(() => {
    const cargarColorIndex = async () => {
      try {
        const savedColorIndex = await AsyncStorage.getItem("colorIndex");
        if (savedColorIndex !== null) {
          setColorIndex(parseInt(savedColorIndex));
        }
      } catch (error) {
        console.log("❌ Error al leer colorIndex:", error);
      }
    };

    cargarColorIndex();
  }, []);

  const handleAddGroup = (name, description, cantidadPacientes) => {
    if (name.trim() === "" || isNaN(cantidadPacientes)) {
      console.error("La cantidad de pacientes debe ser un número válido");
      return;
    }

if (grupoEditando) {
  // Edición: mantiene color original
  updateGroup(grupoEditando.id, name, description, cantidadPacientes);
  setGrupoEditando(null);
} else {
  const color = GROUP_COLORS[(colorIndex ?? 0) % GROUP_COLORS.length];
  addGroup(name, description, cantidadPacientes, color);

  // Guardar y actualizar el colorIndex
  setColorIndex((prev) => {
    const nuevo = prev + 1;
    AsyncStorage.setItem("colorIndex", nuevo.toString());
    return nuevo;
  });
}


    setModalVisible(false);
  };

  const handleEditGroup = (grupo) => {
    setGrupoEditando(grupo);
    setModalVisible(true);
  };

  const handleDeleteGroup = (id) => {
    deleteGroup(id);
  };

  const renderGrupo = ({ item, index }) => {
    // usa el color guardado en el grupo (item.color)
    const color = item.color ?? GROUP_COLORS[index % GROUP_COLORS.length];
    return (
      <View style={[grupoStyles.grupoContainer, { backgroundColor: color }]}>
        <Text style={[grupoStyles.grupoLabel, { color: "#FFF" }]}>Grupos</Text>
        <View style={grupoStyles.grupoContent}>
          <Text style={[grupoStyles.grupoName, { color: "#000" }]}>{item.name}</Text>
         <View style={{ flexDirection: "row", alignItems: "center" }}>
           {!hideAddButtons && 
            <TouchableOpacity
              onPress={() => handleEditGroup(item)}
            >
              <MaterialIcons name="mode-edit-outline" size={24} color={'#000'} />
            </TouchableOpacity>
          }
            {!hideAddButtons && 
            <TouchableOpacity
              style={{
                marginLeft: 8,
                padding: 4,
                borderRadius: 4,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => handleDeleteGroup(item.id)}
            >  
              <MaterialCommunityIcons name="trash-can" size={24} color="#000" />
            </TouchableOpacity>
             }
          </View>
        </View>
      </View>
    );
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
        onPress={() => router.push("/")}
      >
        <MaterialIcons name="arrow-back" size={24} color="#000" />
        <Text style={[styles.headerText, { marginLeft: 8 }]}>
          {sampleName}
        </Text>
      </TouchableOpacity>
    </View>


      <View style={styles.fondoApp}>
         <Text style={styles.main}>GRUPO EXPERIMENTAL </Text>
        <FlatList
          data={grupos}
          keyExtractor={(item) => item.id}
          renderItem={renderGrupo}
          contentContainerStyle={{ padding: 16,paddingHorizontal: 16 }}
        />
        <TouchableOpacity
          style={[
            buttonStyles.buttonAgregar,
            hideAddButtons && { backgroundColor: '#A9A9A9' }, // gris cuando esté deshabilitado
            hideAddButtons && { opacity: 0.6 }                 // opcional: bajamos opacidad
          ]}
          onPress={() => {
            if (!hideAddButtons) {
              setGrupoEditando(null);
              setModalVisible(true);
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
              onPress={() => router.push({ pathname: "paciente" })}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>      
                <Text style={buttonStyles.text}>CONTINUAR</Text>
              
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={RFValue(20)}
                  color="#FFFFFF"                    // normalmente el texto es blanco, ajustá si querés otro color
                  style={{ marginLeft: RFValue(8) }}
                />
              </View>
            </TouchableOpacity>

        <ModalForm
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onAdd={handleAddGroup}
          grupoEditando={grupoEditando}
          
        />
      </View>
    </View>
  );
};

export default GrupoScreen;

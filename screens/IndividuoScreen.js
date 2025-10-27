// PacienteScreen.js (MODIFICADO para fusionar en lugar de sobrescribir)
import React, { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, BackHandler,  Platform } from "react-native";
import { useRouter } from "expo-router";
import { GlobalContext } from "../GlobalProvider"; // Importamos el contexto global
import styles from "../styles/globalStyles";
import ModalPaciente from "../components/ModalIndividuo";
//import Icon from "react-native-vector-icons/MaterialIcons";
import { MaterialIcons } from "@expo/vector-icons";
import buttonStyles from '../styles/buttonStyles';
import { responsiveFontSize as rf, responsiveWidth as rw, responsiveHeight as rh } from "react-native-responsive-dimensions";


const PacienteScreen = () => {
  const router = useRouter();
  const { dataLoaded, grupos, pacientes, setPacientes } = useContext(GlobalContext);
  const { sampleName } = useContext(GlobalContext);


//   useEffect(() => {
//   if (Platform.OS === 'android') {
//     const onBackPress = () => true;  // consume siempre el evento
//     BackHandler.addEventListener('hardwareBackPress', onBackPress);
//     return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
//   }
// }, []);

useEffect(() => {
  if (dataLoaded && grupos.length > 0) {
    const pacientesGenerados = grupos.flatMap((grupo) =>
      Array.from({ length: parseInt(grupo.cantidadPacientes, 10) || 0 }).map((_, i) => ({
        id: `${grupo.id}-paciente-${i}`,
        nombre: "",
        grupoName: grupo.name,
        sexo: "",
        edad: "",
        peso: "",
        descripcion: "",
      }))
    );

    setPacientes((prev) => {
      const pacientesActualizados = pacientesGenerados.map((p) => {
        const existente = prev.find((x) => x.id === p.id);
        return existente ? existente : p;
      });

      return pacientesActualizados;
    });
  }
}, [dataLoaded, grupos]);

  
  // useEffect(() => {
  //   console.log("👀 Estado actual de pacientes:", JSON.stringify(pacientes, null, 2));
  // }, [pacientes]);
  

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [isViewingMode, setIsViewingMode] = useState(true);

  const handleAddDetalles = (pacienteId, detalles) => {
    setPacientes((prev) =>
      prev.map((paciente) => {
        if (paciente.id === pacienteId) {
          // Si se está modificando el nombre y es distinto al anterior, logueamos el paciente modificado
          if (detalles.nombre && detalles.nombre !== paciente.nombre) {
           // console.log("Paciente modificado (nombre actualizado):", { ...paciente, ...detalles });
          }
          return { ...paciente, ...detalles };
        }
        return paciente;
      })
    );
    setModalVisible(true);
  };
  

  const renderPaciente = ({ item }) => {
    //console.log("Renderizando paciente:", item);
    const grupo = grupos.find(g => g.name === item.grupoName);
    const bgColor = grupo?.color ?? "#BB86FC";

    return (
      <TouchableOpacity
        style={{
          marginBottom: 12,
          backgroundColor: bgColor,
          borderRadius: 12,
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        onPress={() => {
          setSelectedPaciente(item);
          setIsViewingMode(true);
          setModalVisible(true);
        }}
      >
  
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={{  fontSize: rf(2), color: "white", fontWeight: "600", marginBottom: 4 }}>
          Identificador
        </Text>
        <View style={{ backgroundColor: "white", borderRadius: 8, padding: 8,  }}>
          <Text style={{ color: "#333",fontSize: rf(1.5) }}>{item.nombre || "Sin identificador"}</Text>
        </View>
      </View>
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={{ fontSize: rf(2), color: "white", fontWeight: "600", marginBottom: 4 }}>
          Grupo
        </Text>
        <View style={{ backgroundColor: "white", borderRadius: 8, padding: 8 }}>
          <Text style={{  color: "#333",fontSize: rf(1.5) }}>{item.grupoName}</Text>
        </View>
      </View>
    </TouchableOpacity>
   );
};
  return (
<View style={styles.container}>
<View
  style={[
    styles.header,
    {flexDirection: 'row',        // eje principal horizontal
      justifyContent: 'flex-start',// pega todo al inicio
      alignItems: 'center',        // centra verticalmente
      paddingHorizontal: 16        // opcional, margen lateral
    }
  ]}
>
  <TouchableOpacity
    style={{ flexDirection: 'row', alignItems: 'center' }}
    onPress={() => router.push("grupo")}
  >
    <MaterialIcons name="arrow-back" size={24} color="#000" />
    <Text style={[styles.headerText, { marginLeft: 8 }]}>
      {sampleName}
    </Text>
  </TouchableOpacity>
</View>
    <View style={styles.fondoApp}>
      <Text style={styles.main}>INDIVIDUOS </Text>
      <FlatList
        data={pacientes}
        keyExtractor={(item) => item.id}
        renderItem={renderPaciente}
          style={{ flex: 1 }}                  // que ocupe todo el espacio
          contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 16, }}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
      <ModalPaciente
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={(detalles) => handleAddDetalles(selectedPaciente.id, detalles)}
        paciente={selectedPaciente}
        isViewingMode={isViewingMode}
        onEdit={() => setIsViewingMode(false)}
      />
      <View style={styles.botonesContainer}>
              <TouchableOpacity
              style={buttonStyles.buttonIndividuo}
              onPress={() => router.push({ pathname: "esquema" })}
              activeOpacity={0.7}
            >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={buttonStyles.text}>CONTINUAR</Text>
            <MaterialIcons name="arrow-forward-ios" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
     </View>
  );
};

export default PacienteScreen;

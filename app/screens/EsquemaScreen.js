// import React, { useState } from "react";
// import { View, Text, TouchableOpacity, FlatList } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import styles from "../styles/globalStyles";
// import CustomButton from "../components/ButtonAgregar";
// import TimePicker from "../components/TimePicker"; // Importamos el componente

// const EsquemaScreen = ({ route, navigation }) => {
//     const { pacientes = [] } = route.params || [];
//     const [intervalos, setIntervalos] = useState([]);

//     const agregarIntervalo = () => {
//         setIntervalos([...intervalos, { id: Date.now().toString(), tiempo: { hours: "00", minutes: "00", seconds: "00" } }]);
//     };

//     const eliminarIntervalo = (id) => {
//         setIntervalos(intervalos.filter((item) => item.id !== id));
//     };

//     const actualizarTiempo = (id, nuevoTiempo) => {
//         setIntervalos(intervalos.map((item) =>
//             item.id === id ? { ...item, tiempo: nuevoTiempo } : item
//         ));
//     };

//     const renderItem = ({ item }) => (
//         <View style={styles.intervaloContainer}>
//             <View style={styles.headerContainer}>
//                 <Text style={{ color: "white" }}>Intervalos de tiempo:</Text>
//                 <TouchableOpacity onPress={() => eliminarIntervalo(item.id)}>
//                     <Icon name="close" size={20} color="#fff" />
//                 </TouchableOpacity>
//             </View>
            
//             {/* Reemplazamos TextInput por TimePicker */}
//             <TimePicker onTimeChange={(nuevoTiempo) => actualizarTiempo(item.id, nuevoTiempo)} />
//         </View>
//     );

//     return (
//         <View style={styles.fondoApp}>
//             <Text style={styles.main}>ESQUEMA</Text>

//             <FlatList
//                 data={intervalos}
//                 keyExtractor={(item) => item.id}
//                 renderItem={renderItem}
//                 contentContainerStyle={{ paddingBottom: 80 }}
//             />

//             <CustomButton title="AGREGAR" onPress={agregarIntervalo} />

//             <View style={styles.botonesContainer}>
//                 <TouchableOpacity onPress={() => navigation.goBack()}>
//                     <Text style={styles.botonesI}>VOLVER</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity onPress={() => navigation.navigate("Extracciones", { pacientes, intervalos })}>
//                     <View style={{ flexDirection: "row", alignItems: "center" }}>
//                         <Text style={styles.botonesD}>CONTINUAR</Text>
//                         <Icon name="arrow-forward-ios" size={20} color="#fff" />
//                     </View>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };

// export default EsquemaScreen;


import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "../styles/globalStyles";
import CustomButton from "../components/ButtonAgregar";
import TimePicker from "../components/TimePicker"; // Importamos el selector de tiempo

const EsquemaScreen = ({ route, navigation }) => {
    const { pacientes = [] } = route.params || [];
    const [intervalos, setIntervalos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const agregarIntervalo = () => {
        setIntervalos([...intervalos, { id: Date.now().toString(), tiempo: { hours: "00", minutes: "00" } }]);
    };

    const eliminarIntervalo = (id) => {
        setIntervalos(intervalos.filter((item) => item.id !== id));
    };

    const actualizarTiempo = (id, nuevoTiempo) => {
        setIntervalos(intervalos.map((item) =>
            item.id === id ? { ...item, tiempo: nuevoTiempo } : item
        ));
    };

    const abrirModal = (id) => {
        setSelectedId(id);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
    };
    const renderItem = ({ item }) => (
        <View style={styles.intervalTimeContainer}>
          {/* Izquierda: etiqueta + botón de hora */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.intervalLabelE}>intervalos de tiempo:</Text>
            <TouchableOpacity
              style={styles.intervalTimeButton}
              onPress={() => abrirModal(item.id)}
            >
              <Text style={styles.intervalTimeText}>
                {`${item.tiempo.hours}:${item.tiempo.minutes}`}
              </Text>
            </TouchableOpacity>
          </View>
      
          {/* Derecha: Botón de cerrar (X) */}
          <TouchableOpacity onPress={() => eliminarIntervalo(item.id)}>
            <Icon name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      );
      

    return (
        <View style={styles.fondoApp}>
            <Text style={styles.main}>ESQUEMA</Text>

            {/* Lista de intervalos */}
            <FlatList
                data={intervalos}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            {/* Botón para agregar nuevos intervalos */}
            <CustomButton title="AGREGAR" onPress={agregarIntervalo} />

           {/* Modal para seleccionar tiempo */}
                <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>SELECCIONAR TIEMPO</Text>

                    {/* Aquí se muestra tu TimePicker, arriba del botón */}
                    <TimePicker
                        onTimeChange={(nuevoTiempo) => {
                        if (selectedId) {
                            actualizarTiempo(selectedId, nuevoTiempo);
                        }
                        }}
                    />

                    {/* Botón de confirmar, queda debajo del TimePicker */}
                    <TouchableOpacity style={styles.modalButton} onPress={cerrarModal}>
                        <Text style={styles.modalButtonText}>CONFIRMAR</Text>
                    </TouchableOpacity>
                    </View>
                </View>
                </Modal>

            {/* Botones de navegación */}
            <View style={styles.botonesContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.botonesI}>VOLVER</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Extracciones", { pacientes, intervalos })}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={styles.botonesD}>CONTINUAR</Text>
                        <Icon name="arrow-forward-ios" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default EsquemaScreen;

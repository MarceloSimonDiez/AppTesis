//"../styles/globalStyles"
import { StyleSheet, } from 'react-native';
import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  
    main: {
      fontFamily: 'Roboto_400Regular',
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 20, // Añadir espacio superior si es necesario
      textAlign: 'center',
    },
    fondoApp: {
      backgroundColor: "#873B8C",
      flex: 1,
      marginTop: 50,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      padding: 20,
    },
    intervalContainer: {
      marginBottom: 16,
    },
  //estilos de los container de los intervalos de tiempo de los esquemas
    intervaloContainer: {
      backgroundColor: "#D09CFA", // Fondo rosado
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
  },

  headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
  },

    intervalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    intervalLabel: {
        fontSize: 16,
        color: "#fff",
        fontWeight: '600',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    customInput: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
  
  intervaloContent: {
      backgroundColor: "#FFFFFF", // Fondo blanco para el contenido interno
      borderRadius: 8,
      padding: 10,
  },
  
  innerContent: {
      flexDirection: "row",
      alignItems: "center",
  },
  
  
    //esto es por el momento, deja los botones volver y siguiente en 
    // parte inferior 
    botonesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between', // Alinea los botones a los extremos
      alignItems: 'center', // Asegura la alineación vertical
      position: 'absolute',
      bottom: 20, // Posición en la parte inferior
      left: 16,
      right: 16,
    },
    botonesD: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white', // Si quieres poner un color
    },
    // Estilos para los rectángulos de los grupos
    grupoContainer: {
      backgroundColor: "#D09CFA", // Color morado claro
      borderRadius: 12,          // Bordes redondeados
      padding: 12,               // Espaciado interno
      marginBottom: 16,          // Espacio entre grupos
      flexDirection: "row",      // Para alinear "Grupo" y el contenido en fila
      alignItems: "center",      // Centrar verticalmente
    },
    grupoLabel: {
      fontSize: 14,
      color: "#FFFFFF",
      marginRight: 8,            // Separación del texto "Grupo"
    },
    grupoContent: {
      flex: 1,
      flexDirection: "row",      // Contenedor en fila para nombre y botón
      alignItems: "center",
      backgroundColor: "#FFFFFF", // Fondo blanco
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,           // Bordes redondeados para el contenido
    },
    grupoName: {
      flex: 1,
      fontSize: 16,
      fontWeight: "bold",
      color: "#000000",
    }, 
    input: {
      height: 40,
      fontSize: 16,
      paddingLeft: 8,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      marginTop: 10,
      backgroundColor: "white",
    },
    fullScreen: {
      flex: 1,
      backgroundColor: "#4E3350",
  },
    safeAreaFull: {
      flex: 1,
      backgroundColor: "#4E3350", // Fondo violeta oscuro para toda el área
  },

  extraccionesScreenContainer: {
    flex: 1,
    backgroundColor: '#F2D7FF', // Fondo rosa claro
},

headerContainerE: {
    backgroundColor: '#873B8C', // Fondo violeta oscuro
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
},

headerText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
},

extraccionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#7E3C97', // Color violeta oscuro
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
},

pacienteGrupoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
},

label: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    marginBottom: 4,
},

inputContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
},

inputText: {
    color: '#333',
    fontWeight: '500',
},

iconStyle: {
    marginLeft: 8,
},

triangleRight: {
  width: 0,
  height: 0,
  borderTopWidth: 12,
  borderBottomWidth: 12,
  borderLeftWidth: 20,
  borderStyle: 'solid',
  backgroundColor: 'transparent',
  borderTopColor: 'transparent',
  borderBottomColor: 'transparent',
  borderLeftColor: '#fff', // Color blanco del triángulo
  marginLeft: 8,
  marginTop: 20,
},

//CONTAINER EXTRACCIONES
extraccionContainerE: {
  backgroundColor: '#873B8C',
  borderRadius: 20,
  padding: 15,
  marginBottom: 14,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 10,
  elevation: 4,
},

infoContainerE: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
},


labelE: {
  fontSize: 14,
  color: 'white',
  fontWeight: 'bold',
  marginBottom: 6,
  textAlign: 'center',
},

inputBoxE: {
  backgroundColor: '#fff',
  borderRadius: 10,
  paddingVertical: 10,
  justifyContent: 'center',
  alignItems: 'center',
  width: '90%',
},

inputTextE: {
  color: '#333',
  textAlign: 'center',
  fontWeight: '600',
  fontSize: 16,
},

//TIMER
timerContainer: {
  marginTop: 12,
  backgroundColor: "#fff",
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  alignSelf: "center", // Centra el temporizador
  width: '70%', // Ajusta el ancho del temporizador
},

timerText: {
  color: "#6A008A",
  fontWeight: "bold",
  fontSize: 16,
},

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
},
modalContainer: {
  backgroundColor: "#F2D7FF",
  borderRadius: 20,
  padding: 20,
  alignItems: "center",      // Alinea el contenido en el centro
  justifyContent: "center",  // Opcional si quieres centrar verticalmente
  width: "80%",              // O un ancho que desees
},
modalTitle: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#873B8C", //lo cambie
  marginBottom: 20,
},
modalButton: {
  backgroundColor: "#873B8C",
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 20,
  marginTop: 20,
},
modalButtonText: {
  fontSize: 16,
  color: "#fff",
},
  // Contenedor principal para el intervalo
  intervalTimeContainer: {
    backgroundColor: "#D09CFA", // Lila claro
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    
    // Para alinear la etiqueta+hora a la izquierda y la X a la derecha
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Texto "intervalos de tiempo:"
  intervalLabelE: {
    color: "#fff",      // Texto en blanco
    fontSize: 16,
    fontWeight: "bold",
  },

  // Botón blanco donde se muestra la hora
  intervalTimeButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 40,
    marginLeft: 10,     // Espacio entre la etiqueta y el botón
  },

  // Texto morado que muestra la hora dentro del botón
  intervalTimeText: {
    color: "#873B8C",
    fontSize: 16,
    fontWeight: "bold",
  },
  // globalStyles.js (fragmento)
confirmContainerExtracciones: {
  backgroundColor: "#873B8C",
  borderRadius: 12,
  padding: 12,
  marginTop: 8,
  alignItems: "center",
},

buttonsRowExtracciones: {
  flexDirection: "row",
  justifyContent: "space-around",
  width: "100%",
  marginTop: 10,
},

confirmButtonExtracciones: {
  backgroundColor: "#54055A", // Verde
  padding: 10,
  borderRadius: 8,
  marginHorizontal: 10,
},

cancelButtonExtracciones: {
  backgroundColor: "#54055A", // Rojo
  padding: 10,
  borderRadius: 8,
  marginHorizontal: 10,
},
muestraText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 8,
},


}
);

export default styles;
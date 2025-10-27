"../styles/globalStyles"
import { StyleSheet, } from 'react-native';
import { Dimensions} from 'react-native';
import {
  responsiveWidth as rw,
  responsiveHeight as rh,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';
//const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({

      // 1) Contenedor del “+ GRUPO”
  addGrupoContainer: {
    flexDirection: "row",
    alignItems: "center",            
  },

  // 2) Círculo con el “+”
  addGrupoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#873B8C",
    alignItems: "center",
    justifyContent: "center",
  },

  // 3) Texto “GRUPO”
  addGrupoText: {
    marginLeft: 8,             // un número fijo
    fontSize: 18,
    fontWeight: "bold",
    color: "#873B8C",
  },

    // estilos genéricos para cada pantalla
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    header: {
      height: 60,
      justifyContent: "space-between",   // empuja el título a la izquierda y el +GRUPO a la derecha
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#fff",
      paddingHorizontal: 16, 
    },

    main: {
      fontFamily: 'Roboto_400Bold',
      color: '#333333',
      fontSize: rf(2.6),         
      lineHeight: rf(3.8),       
      letterSpacing: 1,
      marginBottom: rh(2),       
      textAlign: 'center',
    },
    fondoApp: {
      backgroundColor: "#0000",
      flex: 1,
      marginTop: 0,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      padding: 2,
    },
    intervalContainer: {
      marginBottom: 16,
    },
      headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
  },

  //estilos de los container de los intervalos de tiempo de los esquemas
    intervaloContainer: {
      backgroundColor: "#D09CFA", // Fondo rosado
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
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

    botonesD: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000', // Si quieres poner un color
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



headerContainerE: {
 
  paddingVertical: 16,
  alignItems: "center",
  borderBottomColor: "#EEE",
},
headerContainerEX: {
  paddingTop: 32,         
  paddingBottom: 12,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#873B8C",
},


headerText: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#000",
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
  color: "#000",
  fontWeight: "bold",
  fontSize: 16,
},

timerBadge: {
  backgroundColor: "#fff",
  paddingHorizontal: 30,
  paddingVertical: 6,
  borderRadius: 8,
  alignSelf: "center",    // para que quede centrado dentro del contenedor
  marginVertical: 8,      // espaciado arriba/abajo
},

  // globalStyles.js (fragmento)
confirmContainerExtracciones: {
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

  // // --- Tarjeta superior ---
  // topBarCard: {
  //   backgroundColor: "rgb(57, 0, 118)",      // púrpura
  //   borderBottomLeftRadius: 24,
  //   borderBottomRightRadius: 24,
  //   paddingVertical: 16,
  //   paddingHorizontal: 20,
  //   elevation: 4,
  // },
  // title: {
  //   color: '#FFF',
  //   fontSize: 20,
  //   fontWeight: '700',
  //   textAlign: 'center',
  // },
  // subtitle: {
  //   color: '#FFF',
  //   fontSize: 16,
  //   textAlign: 'center',
  //   marginTop: 4,
  // },

  // // --- Fila de filtros ---
  // filterRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
 
  // },
  // filterButton: {
  //   flex: 1,  // 🔑 todos ocupan el mismo espacio
  //   alignItems: 'center',
  //   paddingVertical: rh(1.2),
  //   paddingHorizontal: rw(2),
  // },
  // filterText: {
  //   fontSize: rf(2),  // 2% del alto de pantalla
  //   color: '#aaa',
  //   fontWeight: '600',
  // },
  // filterTextActive: {
  //   color: '#FFF',
  //   fontWeight: '600',
  // },
  // filterUnderline: {
  //   marginTop: rh(0.3),
  //   height: rh(0.4),
  //   width: '60%',                    // más proporcional al texto
  //   backgroundColor: '#fff',
  //   borderRadius: 999,
  // },
  // abortButton: {
  //   position: 'absolute',
  //   top: 16,                   // ajustá según tu safe area/status bar
  //   right: 16,
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   backgroundColor: 'rgba(255, 255, 255, 0.96)',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   zIndex: 100,
  //   elevation: 10,             // Android
  // },
  // extraccionesScreenContainer: {
  //   flex: 1,
  //   backgroundColor: "white",
  // },
// botonesContainer: {
//   flexDirection: 'row',
//   justifyContent: 'space-between', // Alinea los botones a los extremos
//   alignItems: 'center', // Asegura la alineación vertical
//   position: 'absolute',
//   bottom: 20, // Posición en la parte inferior
//   left: 16,
//   right: 16,
// },
// // Estilos para los rectángulos de los grupos
// grupoContainer: {
//   backgroundColor: "transparent",
//   borderRadius: 12,          // Bordes redondeados
//   padding: 12,               // Espaciado interno
//   marginBottom: 16,          // Espacio entre grupos
//   flexDirection: "row",      // Para alinear "Grupo" y el contenido en fila
//   alignItems: "center",
//   width: "100%",       // por ejemplo 90% del padre
//   alignSelf: "center",      // Centrar verticalmente 
//   elevation: 8,
// },
// grupoLabel: {
//   fontSize: 14,
//   color: "#FFFFFF",
//   marginRight: 8,            // Separación del texto "Grupo"
// },
// grupoContent: {
//   flex: 1,
//   flexDirection: "row",      // Contenedor en fila para nombre y botón
//   alignItems: "center",
//   backgroundColor: "#FFFFFF", // Fondo blanco
//   paddingVertical: 6,
//   paddingHorizontal: 12,
//   borderRadius: 8,           // Bordes redondeados para el contenido
// },
// grupoName: {
//   flex: 1,
//   fontSize: 16,
//   fontWeight: "bold",
//   color: "#000000",
// }, 

// modalOverlay: {
//   flex: 1,
//   backgroundColor: "rgba(0,0,0,0.5)",
//   justifyContent: "center",
//   alignItems: "center",
// },
// modalContainer: {
//   backgroundColor: "#F2D7FF",
//   borderRadius: 20,
//   padding: 20,
//   alignItems: "center",      // Alinea el contenido en el centro
//   justifyContent: "center",  // Opcional si quieres centrar verticalmente
//   width: "90%",              // O un ancho que desees
// },
// modalTitle: {
//   fontSize: 18,
//   fontWeight: "bold",
//   color: "#873B8C", //lo cambie
//   marginBottom: 20,
// },
// modalButton: {
//   backgroundColor: "#873B8C",
//   borderRadius: 10,
//   paddingVertical: 10,
//   paddingHorizontal: 20,
//   marginTop: 20,
// },
// modalButtonText: {
//   fontSize: 16,
//   color: "#fff",
// },
//   // Contenedor principal para el intervalo
//   intervalTimeContainer: {
//     backgroundColor:  "rgba(89, 10, 131, 0.94)",
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//     // Botón blanco donde se muestra la hora
//   intervalTimeButton: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     paddingVertical: 6,
//     paddingHorizontal: 55,
//     marginLeft: 10,     // Espacio entre la etiqueta y el botón
//   },
//   // Texto morado que muestra la hora dentro del botón
//   intervalTimeText: {
//     color: "#873B8C",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   // Texto "intervalos de tiempo:"
//   intervalLabelE: {
//     color: "#fff",      // Texto en blanco
//     fontSize: 16,
//     fontWeight: "bold",
//   },

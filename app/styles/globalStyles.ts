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
}
);

export default styles;
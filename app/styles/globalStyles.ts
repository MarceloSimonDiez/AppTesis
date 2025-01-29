import { StyleSheet, } from 'react-native';
import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#4E3350', // Asegúrate de aplicar el color de fondo aquí
      
    },
    button: {
      backgroundColor: '#A153A7',
      padding: 10,
      borderRadius: 30,
      position: 'absolute',
      alignSelf: 'center',
      bottom: 20,
      left: '5%', 
      right: '5%', 
      height: 50, // Altura fija para mejor diseño
      justifyContent: 'center', 
    },
    buttonText: {
      color: '#FFFCFF',
      fontSize: 20,
      textAlign: 'center',
      fontWeight: 'bold',
    },
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
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Alinea los botones a los extremos
    alignItems: 'center', // Asegura la alineación vertical
    position: 'absolute',
    bottom: 20, // Posición en la parte inferior
    left: 16,
    right: 16,
  },
  botonesI: {
    fontSize: 16,
    color: '#000',
  },
  botonesD: {
    fontSize: 16,
    color: '#000',
  },
}
);

export default styles;
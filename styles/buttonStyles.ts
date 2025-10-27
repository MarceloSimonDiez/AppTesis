// styles/buttonStyles.ts
import { StyleSheet } from 'react-native';
import {
  responsiveWidth as rw,
  responsiveHeight as rh,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';


const buttonStyles = StyleSheet.create({
  buttonAgregar: {
    backgroundColor: 'rgb(68, 0, 107)',
    paddingVertical: rh(2.5),
    paddingHorizontal: rw(6),
    borderTopLeftRadius: rw(8),
    borderTopRightRadius: 0,
    borderBottomLeftRadius: rw(8),
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: rh(6),
    left: rw(5),
    right: rw(55),  
    elevation: 8,
  },

  buttonContinuar: {
    backgroundColor: 'rgb(140, 25, 138)',
    paddingVertical: rh(2.5),
    paddingHorizontal: rw(6),
    borderTopLeftRadius: 0,
    borderTopRightRadius: rw(8),
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: rw(8),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: rh(6),
    left: rw(55),
    right: rw(5),
    elevation: 8,
  },

  button: {
    backgroundColor: "rgb(57, 0, 118)",
    paddingVertical: rh(2),
    paddingHorizontal: rw(6),
    borderRadius: rw(8),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: rh(6),
    left: rw(5),
    right: rw(5),
  },

  buttonIndividuo: {
    backgroundColor: 'rgb(140, 25, 138)',
    paddingVertical: rh(2),
    paddingHorizontal: rw(6),
    borderRadius: rw(8),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: rh(2),
    left: rw(5),
    right: rw(5),
    elevation: 8,
  },

  backButton: {
    position: 'absolute',
    top: rh(2),
    left: rw(4),
    width: rw(10),
    height: rh(5),
    borderRadius: rw(4),
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    color: '#FFFFFF',
    fontSize: rf(1.5), // esto sí es un porcentaje (ej: 2.2% del alto de pantalla)
    fontWeight: 'bold',
  },
});

export default buttonStyles;
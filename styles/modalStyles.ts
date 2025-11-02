import { StyleSheet, Platform, Dimensions } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  responsiveWidth as rw,
  responsiveHeight as rh,
} from 'react-native-responsive-dimensions';

const { height } = Dimensions.get('window');

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  kavWrapper: {
    width: '100%',
    alignItems: 'center',
    // --- AÑADIDO ---
    // Hacemos que el wrapper también sea flexible y se centre
    flex: 1,
    justifyContent: 'center', 
  },
  modalContainer: {
    // --- AÑADIDO ---
    flex: 1, // <--- CAMBIO CLAVE: Permite que el modal se encoja
    
    margin: 20,
    backgroundColor: 'white',
    borderRadius: RFValue(12),
    padding: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: height * 0.85, // Mantenemos la altura máxima
    overflow: 'hidden',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: RFValue(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    width: '100%',
    flex: 1, // <--- CAMBIO CLAVE: Asegura que el scroll llene el espacio
  },
  scrollContainer: {
    padding: RFValue(20),
    paddingBottom: RFValue(20),
  },
  label: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    color: '#663399',
    marginBottom: RFValue(8),
    marginTop: RFValue(15),
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: RFValue(8),
    padding: RFValue(12),
    fontSize: RFValue(16),
    color: '#333',
    width: '100%',
  },
  modalFooter: {
    width: '100%',
    paddingTop: RFValue(20),
    // Quitamos el paddingHorizontal de aquí
  },
  primaryButton: {
    backgroundColor: '#663399',
    borderRadius: RFValue(10),
    paddingVertical: RFValue(10),
    paddingHorizontal: RFValue(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: 'bold',
  },
});

export default modalStyles;
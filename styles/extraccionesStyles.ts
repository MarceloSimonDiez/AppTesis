// styles/extraccionesStyles.ts
import { StyleSheet, Platform } from "react-native";
import {
  responsiveFontSize as rf,
  responsiveWidth as rw,
  responsiveHeight as rh,
} from "react-native-responsive-dimensions";

const extraccionesStyles = StyleSheet.create({
  
  // --- Estilos de Filtros ---
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%', 
    marginTop: rh(1),
    marginBottom: rh(2),
    backgroundColor: '#FFFFFF', 
    borderRadius: rw(3),
    paddingVertical: rh(0.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: rh(1.2),
    paddingHorizontal: rw(2),
  },
  filterButtonActive: {},
  filterText: {
    fontSize: rf(1.8), 
    color: '#666', 
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#663399', 
    fontWeight: '600',
  },
  filterUnderline: {
    marginTop: rh(0.3),
    height: rh(0.4),
    width: '60%',
    backgroundColor: '#663399', 
    borderRadius: rh(1),
  },

  // --- ESTILOS PARA Paciente.js ---

  cardContainer: {
    flexDirection: 'row',
    marginHorizontal: rw(1), // <-- ¡ASEGÚRATE DE TENER ESTO!
    marginVertical: rh(1),    // <-- ¡Y ESTO!
    borderRadius: rw(4),
    backgroundColor: '#FFFFFF', // El fondo base es blanco
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  sideBar: {
    width: rw(4), // O rw(3)
    borderTopLeftRadius: rh(2),
    borderBottomLeftRadius: rh(2),
    // El color se aplica en el componente
  },
  contentContainer: {
    flex: 1,
    paddingVertical: rh(2),   // (Ej: 2% de la altura)
    paddingHorizontal: rw(4), // (Ej: 4% del ancho)
    borderTopRightRadius: rh(2),
    borderBottomRightRadius: rh(2),
  },

  muestraText: {
    fontSize: rf(1.9),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: rh(1.5),
  },

  infoContainerE: {
    flex: 1, 
    marginHorizontal: rw(1), 
  },

  labelE: {
    fontSize: rf(1.6),
    color: '#6A778B',
    opacity: 0.8,
    marginBottom: rh(0.5),
  },

  inputBoxE: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: rw(2),
    paddingVertical: rh(0.8),
    paddingHorizontal: rw(2.5),
  },

  inputTextE: {
    fontSize: rf(1.8),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  timerContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: rw(2),
    paddingVertical: rh(1),
    alignItems: 'center',
    marginTop: rh(1.5),
  },

  timerText: {
    fontSize: rf(1.9),
    color: '#FFFFFF',
    fontWeight: '600',
  },

  textUrgent: {
    color: '#0e0d08ff', 
    fontWeight: 'bold',
  },

  confirmContainerExtracciones: {
    marginTop: rh(2),
    paddingTop: rh(2),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },

  timerBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: rw(2),
    paddingVertical: rh(1),
    alignItems: 'center',
    marginBottom: rh(1.5),
  },

  buttonsRowExtracciones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  confirmButtonExtracciones: {
    padding: rw(2.5),
    borderRadius: rw(2),
    marginLeft: rw(3),
  },

  cancelButtonExtracciones: {
    padding: rw(2.5),
    borderRadius: rw(2),
    marginLeft: rw(3),
  },

});

export default extraccionesStyles;
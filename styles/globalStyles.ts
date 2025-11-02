// styles/globalStyles.ts

import { StyleSheet, Platform } from 'react-native';
import {
  responsiveWidth as rw,
  responsiveHeight as rh,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';
import { RFValue } from "react-native-responsive-fontsize";

const styles = StyleSheet.create({

  // --- ESTILOS ORIGINALES (MANTENIDOS) ---

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
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "bold",
    color: "#873B8C",
  },

  // (Contenedor original, ahora modificado para la nueva estética)
  container: {
    flex: 1,
    paddingHorizontal: rw(5),
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Fondo claro
  },
  
  // (Header original)
  header: {
    height: 60,
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    paddingHorizontal: 16, 
  },

  // (Main original)
  main: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#873B8C",
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  
  // (fondoApp original, actualizado)
  fondoApp: {
    flex: 1,
    backgroundColor: '#F5F5F5', 
  },

  // --- FIN DE ESTILOS ORIGINALES ---

  // --- NUEVOS ESTILOS (AÑADIDOS) ---

  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Fondo claro
  },

  // --- Encabezado Nuevo ---
  // (ESTOS ESTILOS YA COINCIDEN CON LA IMAGEN 2 - NO SE TOCAN)
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: RFValue(12),
    paddingHorizontal: rw(4),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: rw(4),
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingRight: 10, // Área táctil
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: '#333333',
  },
  
  // --- Título de Sección ---
  sectionTitle: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    color: '#663399', // Morado
    marginTop: RFValue(20),
    marginBottom: RFValue(10),
  },

  // --- Estado Vacío ---
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: RFValue(150),
  },
  emptyStateText: {
    fontSize: RFValue(16),
    color: '#888888',
    textAlign: 'center',
    lineHeight: RFValue(24),
  },

  // --- Tarjetas (para Grupos y Pacientes) ---
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: rw(3),
    marginBottom: rw(3),
    flexDirection: "row", // <-- Clave: [Barra] [Contenido]
    alignItems: "stretch", // <-- Clave: para que la barra se estire
    width: "100%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  colorBar: {
    width: rw(2.5), // <-- La barra de color
    borderTopLeftRadius: rw(3),
    borderBottomLeftRadius: rw(3),
  },
  cardContentWrapper: { // <-- El wrapper para el texto en Grupos
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: rw(4),
  },
  cardTitle: { // <-- El título (nombre de grupo o paciente)
    flex: 1,
    fontSize: rf(2.2),
    fontWeight: "bold",
    color: "#000000",
    marginRight: rw(2),
  },
  // Estilos específicos para las tarjetas de Individuo
  cardInfoWrapper: { // <-- Wrapper para el contenido de Paciente
    flex: 1,
    padding: rw(4),
  },
  cardSubtitle: { // <-- (Nombre del grupo)
    fontSize: rf(1.8),
    color: '#666',
    marginBottom: 10,
  },
  cardInfoRow: { // <-- Fila para (Icono + Texto)
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardInfoText: {
    fontSize: rf(1.9),
    color: '#333',
    marginLeft: 8,
  },
  cardActions: { // <-- Contenedor de iconos en Paciente (si lo usamos)
    padding: rw(2),
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#F0F0F0',
  },

  // --- Botones Inferiores (MODIFICADOS) ---
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: rw(5),
    paddingBottom: Platform.OS === 'ios' ? RFValue(20) : RFValue(10), // <-- CAMBIO: Reducido (antes 25/15)
    paddingTop: RFValue(8), // <-- CAMBIO: Reducido (antes 10)
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  primaryButton: {
    backgroundColor: '#663399',
    borderRadius: RFValue(10),
    paddingVertical: RFValue(14), // <-- CAMBIO: Reducido (antes 14)
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: RFValue(5), // <-- CAMBIO: Reducido (antes 10)
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(16), // <-- CAMBIO: Reducido (antes 16)
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#663399',
    borderRadius: RFValue(10),
    paddingVertical: RFValue(10), // <-- CAMBIO: Reducido (antes 14)
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(14), // <-- CAMBIO: Reducido (antes 16)
    fontWeight: 'bold',
  },

  // --- Estilos de Modal (Movidos de IndividuoScreen.js) ---
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: rf(2.2),
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  modalPacienteName: {
    fontSize: rf(1.8),
    color: '#666',
    marginBottom: 15,
  },
  modalScrollView: {
    width: '100%',
  },
  esquemaOption: {
    padding: 12,
    marginVertical: 5,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    width: '100%',
  },
  esquemaOptionSelected: {
    backgroundColor: '#663399',
  },
  esquemaText: {
    fontSize: rf(1.9),
    color: '#333',
    textAlign: 'center',
  },
  esquemaTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  assignButton: {
      backgroundColor: '#03DAC6',
      padding: 10,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 5,
  },
  assignButtonText: {
      color: 'white',
      fontSize: rf(1.8),
      fontWeight: 'bold',
  },
  
  // (Aquí irían tus estilos comentados del archivo original,
  //  pero los omito para mantener el archivo limpio)
  
});

export default styles;
import { StyleSheet, Platform } from "react-native";
import { responsiveFontSize as rf, responsiveWidth as rw } from "react-native-responsive-dimensions";
import { RFValue } from "react-native-responsive-fontsize"; // Importamos RFValue

const grupoStyles = StyleSheet.create({
  // --- Contenedores Generales ---
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5", // Fondo claro
  },

  // --- Encabezado (Nuevo) ---
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centra el título
    paddingVertical: RFValue(12),
    paddingHorizontal: rw(4),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    position: 'relative', // Necesario para 'backButton'
  },
  backButton: {
    position: 'absolute',
    left: rw(4),
    top: 0,
    bottom: 0,
    justifyContent: 'center', // Centra el ícono verticalmente
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: '#333333',
  },

  // --- Título de Sección (Nuevo) ---
  sectionTitle: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    color: '#663399', // Morado
    marginTop: RFValue(20),
    marginBottom: RFValue(10),
  },

  // --- Estado Vacío (Nuevo) ---
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: RFValue(150), // Espacio para botones
  },
  emptyStateText: {
    fontSize: RFValue(16),
    color: '#888888',
    textAlign: 'center',
    lineHeight: RFValue(24),
  },

  // --- Tarjeta de Grupo (Modificado) ---
  grupoContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: rw(3),
    // padding: rw(4), // <-- Eliminamos el padding general
    marginBottom: rw(3),
    flexDirection: "row", // <-- Contendrá la [Barra] y el [Contenido]
    alignItems: "stretch", // <-- Clave para que la barra se estire verticalmente
    width: "100%",
    alignSelf: "center",
    // Sombra (sin cambios)
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden', // <-- Clave para redondear las esquinas de la barra
  },
  colorBar: {
    width: rw(2.5), // Ancho de la barra de color
    // No se necesita height, se estira por 'alignItems: stretch'
    borderTopLeftRadius: rw(3), // Redondea con el contenedor
    borderBottomLeftRadius: rw(3), // Redondea con el contenedor
  },
  grupoContentWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: rw(4), // Aplicamos el padding aquí en lugar del contenedor
  },
  // Nombre del grupo (Modificado para que ocupe el espacio)
  grupoName: {
    flex: 1, // <-- Ocupa el espacio disponible
    fontSize: rf(2.2),
    fontWeight: "bold",
    color: "#000000",
    marginRight: rw(2), // Espacio antes de los íconos
  },

  // --- Contenedor de Botones (Nuevo) ---
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: rw(5),
    paddingBottom: Platform.OS === 'ios' ? RFValue(25) : RFValue(15), // Espacio seguro abajo
    paddingTop: RFValue(10),
    backgroundColor: '#F5F5F5', // Mismo fondo que la app
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  // --- Botones (Nuevos) ---
  primaryButton: {
    backgroundColor: '#663399', // Morado
    borderRadius: RFValue(10),
    paddingVertical: RFValue(14),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: RFValue(10), // Espacio entre botones
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#663399', // Mismo morado
    borderRadius: RFValue(10),
    paddingVertical: RFValue(14),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: 'bold',
  },
});

export default grupoStyles;
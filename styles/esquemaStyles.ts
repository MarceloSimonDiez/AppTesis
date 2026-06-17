// styles/esquemaStyles.ts
import { StyleSheet } from "react-native";
import {
  responsiveFontSize as rf,
  responsiveWidth as rw,
  responsiveHeight as rh,
} from "react-native-responsive-dimensions";

// --- Definimos los colores para mantener la consistencia ---
const colors = {
  primary: "#663399",
  white: "#FFFFFF",
  black: "#000",
  text: "#333333",
  textSubdued: "#6A778B", // Gris para subtítulos
  danger: "#C83C3C", // Rojo para borrar
};

const esquemaStyles = StyleSheet.create({
  // --- (INICIO) NUEVOS ESTILOS DE TARJETA ---
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: rw(4), // 16px
    flexDirection: "row",
    marginHorizontal: rw(1), // 20px
    marginVertical: rh(1), // 8px
    // Sombra
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  sideBar: {
    width: rw(3), // 12px
    backgroundColor: colors.primary,
    borderTopLeftRadius: rw(4),
    borderBottomLeftRadius: rw(4),
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: rw(4), // 16px
  },
  textContainer: {
    flex: 1,
    marginRight: rw(2.5), // 10px
  },
  cardTitle: {
    fontSize: rf(2.2), // 18px
    fontWeight: "bold",
    color: colors.text,
    marginBottom: rh(0.3), // 2px
  },
  cardSubtitle: {
    fontSize: rf(1.8), // 14px
    color: colors.textSubdued,
  },
  deleteButton: {
    padding: rw(2), // 8px (área de toque)
  },
  // --- (FIN) NUEVOS ESTILOS DE TARJETA ---

  // --- (INICIO) ESTILOS DEL MODAL (SIN CAMBIOS) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#ffffffff",
    borderRadius: rw(5),
    alignItems: "center",
    justifyContent: "center",
    width: "95%",
    paddingVertical: rh(2.5),
    paddingHorizontal: rw(2),
  },
  modalTitle: {
    fontSize: rf(2.4),
    fontWeight: "bold",
    color: "#663399",
    marginBottom: rh(2),
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: rf(2),
    color: "#000000ff",
    textAlign: "center",
    fontWeight: "500",
  },
  modalButton: {
    backgroundColor: "#663399",
    borderRadius: rw(3),
    paddingVertical: rh(1.5),
    marginTop: rh(1),
    width: "90%",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: rf(2),
    color: "#fff",
  },
  // --- (FIN) ESTILOS DEL MODAL ---
});

export default esquemaStyles;
// styles/grupoStyles.ts
import { StyleSheet } from "react-native";
import { responsiveFontSize as rf, responsiveWidth as rw } from "react-native-responsive-dimensions";

const grupoStyles = StyleSheet.create({
  // Estilo del rectángulo general del grupo
  grupoContainer: {
    backgroundColor: "transparent",
    borderRadius: rw(3), // proporcional al ancho de pantalla
    padding: rw(3),
    marginBottom: rw(4),
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
    elevation: 8,
  },

  // Texto “Grupos”
  grupoLabel: {
    fontSize: rf(1.8),
    color: "#FFFFF",
    marginRight: rw(2),
  },

  // Contenedor blanco del nombre y los íconos
  grupoContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: rw(1.5),
    paddingHorizontal: rw(3),
    borderRadius: rw(2),
  },

  // Nombre del grupo
  grupoName: {
    flex: 1,
    fontSize: rf(2.2),
    fontWeight: "bold",
    color: "#000000",
  },
});

export default grupoStyles;

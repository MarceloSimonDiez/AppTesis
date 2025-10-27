// styles/esquemaStyles.ts
import { StyleSheet } from "react-native";
import { responsiveFontSize as rf, responsiveWidth as rw, responsiveHeight as rh } from "react-native-responsive-dimensions";

const esquemaStyles = StyleSheet.create({
 intervalRow:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: rw(5),
 },
  // Contenedor del intervalo
  intervalTimeContainer: {
    backgroundColor: "rgba(89, 10, 131, 0.94)",
    borderRadius: rw(3),
    padding: rw(3),
    marginBottom: rh(2),
    flexDirection: "row",
    alignItems: "center",
    position: 'relative',
  },

  // Botón con hora dentro del intervalo
  intervalTimeButton: {
    backgroundColor: "#fff",
    borderRadius: rw(3),
    paddingVertical: rh(1),
    paddingHorizontal: rw(5), 
    marginLeft: rw(3.5),
    marginRight: rw(5),
  },

  intervalTimeText: {
    color: "#873B8C",
    fontSize: rf(2),
    fontWeight: "bold",
  },

  // Texto: “Intervalos de tiempo:”
  intervalLabel: {
    color: "#fff",
    fontSize: rf(1.5),
    fontWeight: "bold",
  },

  // Fondo semitransparente del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Caja del modal
  modalContainer: {
    backgroundColor: "#F2D7FF",
    borderRadius: rw(5),
    padding: rw(5),
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
  },

  modalTitle: {
    fontSize: rf(2.4),
    fontWeight: "bold",
    color: "#873B8C",
    marginBottom: rh(2),
    textAlign: "center",
  },

  modalSubtitle: {
    fontSize: rf(2),
    color: "#fff",
    textAlign: "center",
    fontWeight: "500",
  },

  modalButton: {
    backgroundColor: "#873B8C",
    borderRadius: rw(3),
    paddingVertical: rh(1.5),
    paddingHorizontal: rw(5),
    marginTop: rh(2),
  },

  modalButtonText: {
    fontSize: rf(2),
    color: "#fff",
  },
  closeButton: {
    position: 'absolute',
    top: rh(2.3),
    right: rw(1),
    padding: rw(2), // agranda zona táctil
    zIndex: 1,
},
});

export default esquemaStyles;

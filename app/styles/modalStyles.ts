//"../styles/modalStyles"
import { StyleSheet } from "react-native";

const modalStyles = StyleSheet.create({
  modalBackground: {
    backgroundColor: "#873B8C",
    flex: 1,
    marginTop: 120,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
  },
  modalContainer: {
    flex: 0.60,
    backgroundColor: "#873B8C",
    borderRadius: 30,
    padding: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#873B8C",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 100,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  modalFooter: {
    width: "100%",
    paddingVertical: 60,
    backgroundColor: "transparent", // Fondo transparente para mayor estilo
  },
  label: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 5,
    marginBottom: 15,
    height: 40,
    width: "100%",
  },
  input: {
    flex: 1,
    color: "#000",
  },
});

export default modalStyles;
//"../styles/modalStyles"
import { StyleSheet } from "react-native";

const modalStyles = StyleSheet.create({
  modalBackground: {
    backgroundColor: "#873B8C",
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    marginTop: 120,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#873B8C",
    borderRadius: 30,
    padding: 20,
    width: "100%",
    shadowColor: "#873B8C",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 100,
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
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  modalFooter: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: "center",
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
  fixedButton: {
  backgroundColor: '#46004B',
  padding: 12,
  borderRadius: 30,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  bottom: 20,
  left: 20,
  right: 20,
},
});


export default modalStyles;
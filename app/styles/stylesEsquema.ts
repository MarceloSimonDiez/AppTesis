import { StyleSheet } from "react-native";

const stylesEsquema = StyleSheet.create({
    modalContent: {
        backgroundColor: "#873B8C",
        padding: 25,
        borderRadius: 12,
        alignItems: "center",
        width: "90%",
        alignSelf: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#fff",
        textAlign: "center",
    },
    wheelContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10,
    },
    timeSeparator: {
        fontSize: 24,
        fontWeight: "bold",
        marginHorizontal: 15,
        color: "#fff",
    },
    confirmButton: {
        marginTop: 20,
        backgroundColor: "#46004B",
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 15,
        alignItems: "center",
        width: "80%",
    },
    confirmButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    timePickerButton: {
        backgroundColor: "#fff",
        paddingVertical: 1,
        paddingHorizontal: 1,
        borderRadius: 8,
        alignItems: "center",
        width: 70,
        height: 30,
    },
    timePickerText: {
        color: "#333",
        fontSize: 18,
        textAlign: "center",
    },
});

export default stylesEsquema;
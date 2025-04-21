import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 30,
    },

    input: {
        width: "100%",
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
    },

    button: {
        backgroundColor: "#007bff",
        padding: 15,
        borderRadius: 5,
        width: "100%",
        alignItems: "center",
        marginBottom: 10,
    },

    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },

    registerText: {
        color: "#007bff",
        fontSize: 16,
    },
})
// screens/HomeScreen.js
import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import styles from "../styles/globalStyles";
import CustomButton from '../components/ButtonAgregar';

const HomeScreen = () => {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', marginTop: 1 }}>
      <CustomButton
        title="INICIAR"
        onPress={() => router.push("grupo")}
        style={{ backgroundColor: '#A153A7' }}
      />
    </View>
  );
};

export default HomeScreen;

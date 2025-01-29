//Navigation.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

//screnn
import HomeScreen from "./screens/HomeScreen";
import GruopoScreen from "./screens/GruposScreen";
import PacienteScreen from "./screens/PacienteScreen";
import EsquemaScreen from  "./screens/EsquemaScreen";
import ExtraccionesScreen from  "./screens/ExtraccionesScreen";



const Tab = createStackNavigator();

function MyTabs() {
    return(

        <Tab.Navigator 
        screenOptions={{ headerShown: false,
          cardStyle: { backgroundColor: "#FBC2FF" },
        }}>

            <Tab.Screen name="Home" component={HomeScreen}/>
            <Tab.Screen name="Grupo" component={GruopoScreen}/>
            <Tab.Screen name="Paciente" component={PacienteScreen}/>
            <Tab.Screen name="Esquema" component={EsquemaScreen}/>
            <Tab.Screen name="Extracciones" component={ExtraccionesScreen}/>
        </Tab.Navigator>
    );
}

export default function Navigation(){
    return(     
            <MyTabs /> 
     );
}


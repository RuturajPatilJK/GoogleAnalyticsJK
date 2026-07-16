import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Signika_400Regular,
  Signika_600SemiBold,
  Signika_700Bold,
} from '@expo-google-fonts/signika';

import { C } from './src/theme';
import SplashOverlay from './src/components/SplashOverlay';

import LoginScreen         from './src/screens/LoginScreen';
import DashboardHomeScreen from './src/screens/DashboardHomeScreen';
import EBuySugarScreen     from './src/screens/EBuySugarScreen';
import ChiniMandiScreen    from './src/screens/ChiniMandiScreen';
import BioEnergyScreen     from './src/screens/BioEnergyScreen';
import AgriInsightsScreen  from './src/screens/AgriInsightsScreen';
import SEICScreen          from './src/screens/SEICScreen';

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Signika_400Regular,
    Signika_600SemiBold,
    Signika_700Bold,
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <StatusBar style="dark" backgroundColor={C.bg} />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: C.bg },
              animationEnabled: true,
              gestureEnabled: true,
            }}
          >
            <Stack.Screen name="Login"          component={LoginScreen} />
            <Stack.Screen name="DashboardHome"  component={DashboardHomeScreen} />
            <Stack.Screen name="EBuySugar"      component={EBuySugarScreen} />
            <Stack.Screen name="ChiniMandi"     component={ChiniMandiScreen} />
            <Stack.Screen name="BioEnergy"      component={BioEnergyScreen} />
            <Stack.Screen name="AgriInsights"   component={AgriInsightsScreen} />
            <Stack.Screen name="SEIC"           component={SEICScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        {showSplash && <SplashOverlay onFinish={() => setShowSplash(false)} />}
      </View>
    </SafeAreaProvider>
  );
}

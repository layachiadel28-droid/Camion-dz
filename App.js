import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [accountType, setAccountType] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [cargoType, setCargoType] = useState("");

  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const getLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status!== "granted") {
        Alert.alert("صلاحية الموقع", "اسمح للتطبيق باستعمال موقعك");
        setLoadingLocation(false);
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ latitude: current.coords.latitude, longitude: current.coords.longitude });
    } catch (e) { Alert.alert("خطأ", "ما قدرناش نجيبو موقعك"); }
    setLoadingLocation(false);
  };

  useEffect(() => { if (screen === "map") getLocation(); }, [screen]);

  const register = () => {
    if (!name ||!phone ||!password ||!accountType) {
      Alert.alert("معلومات ناقصة", "عمر جميع الخانات");
      return;
    }
    setScreen("map");
  };

  if (screen === "welcome") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.logo}>🚛 Camion-dz</Text>
          <Text style={styles.title}>النقل بالشاحنات في الجزائر</Text>
          <Text style={styles.subtitle}>اربط بين أصحاب السلع والسائقين</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen("register")}>
            <Text style={styles.buttonText}>إنشاء حساب</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen("login")}>
            <Text style={styles.secondaryText}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "register") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.logoSmall}>🚛 Camion-dz</Text>
          <Text style={styles.title}>إنشاء حساب</Text>
          <Text style={styles.label}>اختر نوع الحساب</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.typeButton, accountType === "client" && styles.selectedType]} onPress={() => setAccountType("client")}>
              <Text>📦 صاحب سلعة</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.typeButton, accountType === "driver" && styles.selectedType]} onPress={() => setAccountType("driver")}>
              <Text>🚛 سائق</Text>
            </TouchableOpacity>
          </View>
          <TextInput style={styles.input} placeholder="الاسم الكامل / الشركة" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="رقم الهاتف" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <TextInput style={styles.input} placeholder="كلمة السر" secureTextEntry value={password} onChangeText={setPassword} />
          <TouchableOpacity style={styles.primaryButton} onPress={register}>
            <Text style={styles.buttonText}>إنشاء الحساب</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen("welcome")}><Text style={styles.link}>رجوع</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "login") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.logoSmall}>🚛 Camion-dz</Text>
          <Text style={styles.title}>تسجيل الدخول</Text>
          <TextInput style={styles.input} placeholder="رقم الهاتف" keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="كلمة السر" secureTextEntry />
          <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen("map")}>
            <Text style={styles.buttonText}>دخول</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen("welcome")}><Text style={styles.link}>رجوع</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.mapContainer}>
      {location? (
        <MapView style={styles.map} showsUserLocation initialRegion={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.08, longitudeDelta: 0.08 }}>
          <Marker coordinate={location

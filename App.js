import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [accountType, setAccountType] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status!== "granted") {
        Alert.alert("تنبيه", "اسمح للموقع");
        setLoading(false);
        return;
      }
      let pos = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    } catch (e) {
      Alert.alert("خطأ", "ما قدرناش نجيبو موقعك");
    }
    setLoading(false);
  };

  useEffect(() => { if (screen === "map") { getLocation(); } }, [screen]);

  const register = () => {
    if (!name ||!phone ||!password ||!accountType) {
      Alert.alert("ناقص", "عمر كل الخانات");
      return;
    }
    setScreen("map");
  };

  if (screen === "welcome") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.logo}>Camion-dz</Text>
          <Text style={styles.title}>النقل بالشاحنات</Text>
          <Text style={styles.subtitle}>اربط بين السلع والسائقين</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen("register")}>
            <Text style={styles.buttonText}>انشاء حساب</Text>
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
          <Text style={styles.logoSmall}>Camion-dz</Text>
          <Text style={styles.title}>انشاء حساب</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.typeButton, accountType === "client" && styles.selected]} onPress={() => setAccountType("client")}>
              <Text>صاحب سلعة</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.typeButton, accountType === "driver" && styles.selected, { marginLeft: 10 }]} onPress={() => setAccountType("driver")}>
              <Text>سائق</Text>
            </TouchableOpacity>
          </View>
          <TextInput style={styles.input} placeholder="الاسم الكامل" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="رقم الهاتف" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <TextInput style={styles.input} placeholder="كلمة السر" secureTextEntry value={password} onChangeText={setPassword} />
          <TouchableOpacity style={styles.primaryButton} onPress={register}>
            <Text style={styles.buttonText}>انشاء الحساب</Text>
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
          <Text style={styles.logoSmall}>Camion-dz</Text>
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
        <MapView style={styles.map} showsUserLocation={true} initialRegion={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.08, longitudeDelta: 0.08 }}>
          <Marker coordinate={location} title="موقعك" />
        </MapView>
      ) : (
        <View style={styles.loading}>
          {loading? <ActivityIndicator size="large" /> : <TouchableOpacity style={styles.primaryButton} onPress={getLocation}><Text style={styles.buttonText}>تحديد موقعي</Text></TouchableOpacity>}
        </View>
      )}
      <View style={styles.mapPanel}>
        <Text style={styles.mapTitle}>طلب نقل بضاعة</Text>
        <View style={styles.locationBox}><Text>من اين؟</Text></View>
        <View style={styles.locationBox}><Text>الى اين؟</Text></View>
        <TouchableOpacity style={styles.primaryButton} onPress={() => Alert.alert("تم", "تم نشر طلبك")}>
          <Text style={styles.buttonText}>نشر الطلب</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 25 },
  form: { flex: 1, padding: 25, justifyContent: "center" },
  logo: { fontSize: 36, fontWeight: "bold", marginBottom: 15 },
  logoSmall: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 30, color: "#666" },
  row: { flexDirection: "row", marginBottom: 15 },
  typeButton: { flex: 1, padding: 14, borderWidth: 1, borderColor: "#ddd", borderRadius: 12, alignItems: "center" },
  selected: { borderColor: "#000", borderWidth: 2, backgroundColor: "#eee" },
  input: { height: 50, borderWidth: 1, borderColor: "#ddd", borderRadius: 10, paddingHorizontal: 15, marginBottom: 10, textAlign: "right" },
  primaryButton: { width: "100%", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 10, backgroundColor: "#E53935" },
  secondaryButton: { width: "100%", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 10, borderWidth: 1, borderColor: "#ddd" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  secondaryText: { fontWeight: "bold" },
  link: { textAlign: "center", marginTop: 15 },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  mapPanel: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", padding: 15, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  mapTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  locationBox: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 14, marginBottom: 8 }
});

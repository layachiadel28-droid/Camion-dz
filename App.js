import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status!== "granted") {
        Alert.alert("تنبيه", "لازم تسمح للموقع باش تخدم الخريطة");
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

  useEffect(() => {
    if (screen === "map") {
      getLocation();
    }
  }, [screen]);

  if (screen === "welcome") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.logo}>🚛 Camion-dz</Text>
          <Text style={styles.title}>نقل البضائع في الجزائر</Text>
          <TouchableOpacity style={styles.btn} onPress={() => setScreen("map")}>
            <Text style={styles.btnText}>فتح الخريطة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.mapContainer}>
      {location? (
        <MapView
          style={styles.map}
          showsUserLocation={true}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={location} title="موقعك الحالي" />
        </MapView>
      ) : (
        <View style={styles.center}>
          {loading? <ActivityIndicator size="large" color="#E53935" /> : (
            <TouchableOpacity style={styles.btn} onPress={getLocation}>
              <Text style={styles.btnText}>تحديد موقعي</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>طلب شاحنة</Text>
        <View style={styles.box}><Text>📍 مكان التحميل</Text></View>
        <View style={styles.box}><Text>🏁 مكان التفريغ</Text></View>
        <TouchableOpacity style={styles.btn} onPress={() => Alert.alert("تم", "تم نشر طلبك")}>
          <Text style={styles.btnText}>نشر الطلب</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen("welcome")}><Text style={styles.back}>رجوع</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  logo: { fontSize: 36, fontWeight: "bold", marginBottom: 15 },
  title: { fontSize: 18, marginBottom: 30 },
  btn: { backgroundColor: "#E53935", padding: 15, borderRadius: 10, width: "100%", alignItems: "center", marginTop: 10 },
  btnText: { color: "#fff", fontWeight: "bold" },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  panel: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", padding: 15, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  panelTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  box: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 14, marginBottom: 8 },
  back: { textAlign: "center", marginTop: 10 }
});

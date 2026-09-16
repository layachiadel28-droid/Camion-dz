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

  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const getLocation = async () => {
    setLoadingLocation(true);

    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "صلاحية الموقع",
          "اسمح للتطبيق باستعمال موقعك باش تخدم الخريطة."
        );
        setLoadingLocation(false);
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    } catch (error) {
      Alert.alert("خطأ", "ما قدرناش نجيبو موقعك.");
    }

    setLoadingLocation(false);
  };

  useEffect(() => {
    if (screen === "map") {
      getLocation();
    }
  }, [screen]);

  const register = () => {
    if (!name || !phone || !password || !accountType) {
      Alert.alert("معلومات ناقصة", "عمر جميع الخانات.");
      return;
    }

    setScreen("map");
  };

  if (screen === "welcome") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.logo}>YassirGo</Text>

          <Text style={styles.title}>
            تنقل بسهولة داخل الجزائر
          </Text>

          <Text style={styles.subtitle}>
            تطبيق النقل والرحلات
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setScreen("register")}
          >
            <Text style={styles.buttonText}>
              إنشاء حساب
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setScreen("login")}
          >
            <Text style={styles.secondaryText}>
              تسجيل الدخول
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "register") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.logoSmall}>YassirGo</Text>

          <Text style={styles.title}>
            إنشاء حساب
          </Text>

          <Text style={styles.label}>
            اختر نوع الحساب
          </Text>

          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                accountType === "customer" &&
                  styles.selectedType,
              ]}
              onPress={() => setAccountType("customer")}
            >
              <Text>🚕 راكب</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                accountType === "driver" &&
                  styles.selectedType,
              ]}
              onPress={() => setAccountType("driver")}
            >
              <Text>🚗 سائق</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="الاسم الكامل"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="رقم الهاتف"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <TextInput
            style={styles.input}
            placeholder="كلمة السر"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={register}
          >
            <Text style={styles.buttonText}>
              إنشاء الحساب
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setScreen("welcome")}
          >
            <Text style={styles.link}>
              رجوع
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "login") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.logoSmall}>YassirGo</Text>

          <Text style={styles.title}>
            تسجيل الدخول
          </Text>

          <TextInput
            style={styles.input}
            placeholder="رقم الهاتف"
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="كلمة السر"
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setScreen("map")}
          >
            <Text style={styles.buttonText}>
              دخول
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setScreen("welcome")}
          >
            <Text style={styles.link}>
              رجوع
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.mapContainer}>
      {location ? (
        <MapView
          style={styles.map}
          showsUserLocation
          showsMyLocationButton
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker
            coordinate={location}
            title="موقعك الحالي"
            description="نقطة الانطلاق"
          />
        </MapView>
      ) : (
        <View style={styles.loading}>
          {loadingLocation ? (
            <>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>
                جاري تحديد موقعك...
              </Text>
            </>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={getLocation}
            >
              <Text style={styles.buttonText}>
                تحديد موقعي
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.mapPanel}>
        <Text style={styles.mapTitle}>
          🚕 YassirGo
        </Text>

        <TouchableOpacity style={styles.locationBox}>
          <Text style={styles.locationText}>
            📍 من أين؟
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationBox}>
          <Text style={styles.locationText}>
            🏁 إلى أين؟
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            Alert.alert(
              "YassirGo",
              "تم تجهيز طلب الرحلة."
            )
          }
        >
          <Text style={styles.buttonText}>
            طلب رحلة
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  form: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
  },

  logo: {
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 20,
  },

  logoSmall: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 35,
  },

  label: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "right",
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },

  typeButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
  },

  selectedType: {
    borderWidth: 2,
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    textAlign: "right",
  },

  primaryButton: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#111",
  },

  secondaryButton: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  secondaryText: {
    fontSize: 17,
    fontWeight: "bold",
  },

  link: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },

  mapContainer: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },

  mapPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 18,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  mapTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },

  locationBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },

  locationText: {
    fontSize: 16,
    textAlign: "right",
  },
});

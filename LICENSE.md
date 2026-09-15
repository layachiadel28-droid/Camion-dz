import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, StatusBar } from 'react-native';

export default function App() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [phone, setPhone] = useState('');
  const [weight, setWeight] = useState('');

  const handleOrder = () => {
    if (!from.trim() || !to.trim() || !phone.trim()) {
      Alert.alert('تنبيه', 'عمر من وين ولوين ورقم الهاتف');
      return;
    }
    Alert.alert('✅ تم استلام طلبك', `من: ${from}\nإلى: ${to}\nالوزن: ${weight || 'غير محدد'}\nسنتواصل معك على: ${phone}`);
    setFrom(''); setTo(''); setPhone(''); setWeight('');
  };

  return (
    <View style={styles.main}>
      <StatusBar barStyle="light-content" backgroundColor="#ff6a00" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>🚛</Text>
        <Text style={styles.title}>Camion DZ</Text>
        <Text style={styles.subtitle}>تطبيق نقل البضائع في الجزائر - وهران</Text>

        <View style={styles.card}>
          <Text style={styles.label}>الانطلاق من</Text>
          <TextInput style={styles.input} placeholder="مثال: وهران - السانية" value={from} onChangeText={setFrom} />

          <Text style={styles.label}>الوصول إلى</Text>
          <TextInput style={styles.input} placeholder="مثال: الجزائر العاصمة" value={to} onChangeText={setTo} />

          <Text style={styles.label}>وزن السلعة (اختياري)</Text>
          <TextInput style={styles.input} placeholder="مثال: 2 طن" value={weight} onChangeText={setWeight} />

          <Text style={styles.label}>رقم هاتفك</Text>
          <TextInput style={styles.input} placeholder="07 XX XX XX XX" keyboardType="number-pad" value={phone} onChangeText={setPhone} maxLength={10} />

          <TouchableOpacity style={styles.button} onPress={handleOrder} activeOpacity={0.8}>
            <Text style={styles.buttonText}>اطلب كاميو الآن</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>خدمة 24/24 - 7/7</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#ff6a00' },
  container: { padding: 20, paddingTop: 50, backgroundColor: '#f8f9fa', flexGrow: 1, minHeight: '100%' },
  logo: { fontSize: 60, textAlign: 'center' },
  title: { fontSize: 34, fontWeight: 'bold', textAlign: 'center', color: '#111', marginTop: 5 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 25, fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  label: { fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 6, textAlign: 'right', color: '#333' },
  input: { backgroundColor: '#f2f2f2', borderRadius: 12, padding: 14, fontSize: 15, textAlign: 'right', borderWidth: 1, borderColor: '#eee' },
  button: { backgroundColor: '#ff6a00', borderRadius: 12, padding: 16, marginTop: 25, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { textAlign: 'center', marginTop: 15, color: '#999', fontSize: 12 }
});

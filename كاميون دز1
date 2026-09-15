import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

export default function App() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [phone, setPhone] = useState('');

  const order = () => {
    if(!from || !to || !phone){ Alert.alert('كمل قاع الخانات'); return; }
    Alert.alert('تم ✅', `طلب من ${from} الى ${to} - ${phone}`);
  };

  return (
    <ScrollView style={s.c}>
      <Text style={s.logo}>🚛 Camion DZ</Text>
      <View style={s.card}>
        <Text style={s.l}>من وين؟</Text>
        <TextInput style={s.i} placeholder="وهران" value={from} onChangeText={setFrom}/>
        <Text style={s.l}>لوين؟</Text>
        <TextInput style={s.i} placeholder="الجزائر" value={to} onChangeText={setTo}/>
        <Text style={s.l}>رقم الهاتف</Text>
        <TextInput style={s.i} placeholder="07..." keyboardType="phone-pad" value={phone} onChangeText={setPhone}/>
        <TouchableOpacity style={s.b} onPress={order}><Text style={s.bt}>اطلب كاميو</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  c:{flex:1, backgroundColor:'#f5f5f5', padding:20, paddingTop:50},
  logo:{fontSize:30, fontWeight:'bold', textAlign:'center', color:'#ff6a00', marginBottom:20},
  card:{backgroundColor:'white', padding:20, borderRadius:15},
  l:{fontWeight:'bold', marginTop:10, textAlign:'right'},
  i:{backgroundColor:'#f0f0f0', padding:12, borderRadius:10, marginTop:5, textAlign:'right'},
  b:{backgroundColor:'#ff6a00', padding:15, borderRadius:10, marginTop:20, alignItems:'center'},
  bt:{color:'white', fontWeight:'bold', fontSize:18}
});

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  const [step, setStep] = useState('login');
  const [phone, setPhone] = useState('');
  const [loc, setLoc] = useState(null);
  const [from, setFrom] = useState('وهران - حي السلام');
  const [to, setTo] = useState('ميناء وهران');
  const [price, setPrice] = useState('4500');
  const [type, setType] = useState('شاحنة صغيرة');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let l = await Location.getCurrentPositionAsync({});
        setLoc(l.coords);
      }
    })();
  }, []);

  if (step === 'login') {
    return (
      <View style={s.login}>
        <Text style={s.logo}>🚚 Camion-DZ</Text>
        <Text style={s.sub}>نقل البضائع والشاحنات في الجزائر</Text>
        <TextInput style={s.input} placeholder="07XX XX XX XX" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <View style={{flexDirection:'row', gap:10}}>
          <TouchableOpacity style={[s.typeBtn, {backgroundColor:'black'}]} onPress={()=>{}}><Text style={{color:'white'}}>عميل</Text></TouchableOpacity>
          <TouchableOpacity style={s.typeBtn} onPress={()=>{}}><Text>سائق</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={s.btn} onPress={() => phone.length >= 9 ? setStep('home') : Alert.alert('دخل رقم صحيح')}>
          <Text style={s.btnT}>دخول</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{flex:1}}>
      {loc ? (
        <MapView style={{flex:1}} initialRegion={{latitude: loc.latitude, longitude: loc.longitude, latitudeDelta:0.05, longitudeDelta:0.05}}>
          <Marker coordinate={loc} title="موقعك الحالي" />
        </MapView>
      ) : <View style={{flex:1, backgroundColor:'#eee', justifyContent:'center', alignItems:'center'}}><Text>جاري تحديد موقعك...</Text></View>}

      <View style={s.card}>
        <Text style={s.title}>اطلب شاحنة الآن</Text>
        <View style={{flexDirection:'row', gap:8, marginBottom:10}}>
          {['شاحنة صغيرة','شاحنة كبيرة','ديباناج'].map(t=>(
            <TouchableOpacity key={t} onPress={()=>setType(t)} style={[s.typeBtn, type===t && {backgroundColor:'black'}]}>
              <Text style={type===t ? {color:'white', fontSize:12} : {fontSize:12}}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput style={s.input2} value={from} onChangeText={setFrom} placeholder="منين؟" />
        <TextInput style={s.input2} value={to} onChangeText={setTo} placeholder="لوين؟" />
        <TextInput style={s.input2} value={price} onChangeText={setPrice} placeholder="اقترح سعرك DA" keyboardType="numeric" />
        <TouchableOpacity style={s.btn} onPress={() => Alert.alert('✅ تم إرسال طلبك', `النوع: ${type}\nمن: ${from}\nإلى: ${to}\nالسعر: ${price} دج\n\nجاري البحث عن أقرب سائق...`)}>
          <Text style={s.btnT}>إرسال الطلب للسائقين</Text>
        </TouchableOpacity>
        <Text style={{textAlign:'center', marginTop:8, fontSize:12, color:'#888'}}>السائقين القريبين سيتصلون بك</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  login:{flex:1, justifyContent:'center', padding:28, backgroundColor:'#FFCC00'},
  logo:{fontSize:42, fontWeight:'bold', textAlign:'center'},
  sub:{textAlign:'center', marginBottom:30, fontWeight:'600'},
  card:{backgroundColor:'white', padding:20, borderTopLeftRadius:24, borderTopRightRadius:24, position:'absolute', bottom:0, width:'100%'},
  title:{fontSize:18, fontWeight:'bold', textAlign:'right', marginBottom:12},
  input:{borderWidth:1, borderColor:'#000', padding:15, borderRadius:12, marginBottom:12, backgroundColor:'white', textAlign:'center', fontSize:16},
  input2:{borderWidth:1, borderColor:'#ddd', padding:13, borderRadius:12, marginBottom:8, backgroundColor:'#f9f9f9', textAlign:'right'},
  btn:{backgroundColor:'black', padding:16, borderRadius:14, marginTop:10},
  btnT:{color:'white', textAlign:'center', fontWeight:'bold', fontSize:16},
  typeBtn:{borderWidth:1, paddingHorizontal:14, paddingVertical:8, borderRadius:20, backgroundColor:'white'}
});

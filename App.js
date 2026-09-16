import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.logo}>YassirGo</Text>
      <Text style={styles.title}>النقل بسهولة</Text>
      <Text style={styles.subtitle}>تطبيق النقل والرحلات في الجزائر</Text>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>إنشاء حساب</Text>
      </Pressable>
      <Pressable style={styles.outline}>
        <Text style={styles.outlineText}>تسجيل الدخول</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',alignItems:'center',padding:24,backgroundColor:'#fff'},
  logo:{fontSize:38,fontWeight:'800',marginBottom:18},
  title:{fontSize:25,fontWeight:'700',marginBottom:8},
  subtitle:{fontSize:16,textAlign:'center',marginBottom:35},
  button:{width:'100%',padding:16,borderRadius:12,alignItems:'center',marginBottom:12,backgroundColor:'#111'},
  buttonText:{color:'#fff',fontSize:17,fontWeight:'700'},
  outline:{width:'100%',padding:15,borderRadius:12,alignItems:'center',borderWidth:1,borderColor:'#111'},
  outlineText:{fontSize:17,fontWeight:'700'}
});

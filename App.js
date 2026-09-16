import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>شاحنة</Text>
      <Text style={styles.subtitle}>النقل والرحلات في الجزائر</Text>
      
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>حساب خاص</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonOutline}>
        <Text style={styles.buttonOutlineText}>امتياز المخطط</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 38, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 25 },
  button: { backgroundColor: 'black', padding: 17, borderRadius: 12, width: 250, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: 'white', fontSize: 16 },
  buttonOutline: { borderWidth: 1, borderColor: 'black', padding: 16, borderRadius: 12, width: 250, alignItems: 'center' },
  buttonOutlineText: { color: 'black', fontSize: 16 },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// بيانات وهمية للرحجات والشاحنات
const initialShipments = [
  {
    id: '1',
    truck: 'شاحنة مرسيدس - الجزائر',
    status: 'في الطريق',
    driver: 'أحمد محمد',
    destination: 'وهران',
    color: '#ffcc00',
  },
  {
    id: '2',
    truck: 'شاحنة فولفو - سطيف',
    status: 'مكتملة',
    driver: 'خالد علي',
    destination: 'قسنطينة',
    color: '#2ecc71',
  },
  {
    id: '3',
    truck: 'شاحنة سكانيا - البليدة',
    status: 'جاري التحميل',
    driver: 'ياسين عمر',
    destination: 'ورقلة',
    color: '#3498db',
  },
];

export default function App() {
  const [shipments, setShipments] = useState(initialShipments);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.truckName}>🚚 {item.truck}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.color }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.cardDetails}>👤 السائق: {item.driver}</Text>
      <Text style={styles.cardDetails}>📍 الوجهة: {item.destination}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => alert(`جاري تتبع الشاحنة: ${item.truck}`)}
      >
        <Text style={styles.buttonText}>تتبع الشاحنة الآن</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚚 نظام نقل وإدارة الشاحنات</Text>
      </View>

      <View style={styles.mapSimulation}>
        <Text style={styles.mapText}>🗺️ خريطة التتبع المباشر (GPS)</Text>
        <Text style={styles.mapSubText}>يتم تحديث مواقع الشاحنات تلقائياً</Text>
      </View>

      <Text style={styles.sectionTitle}>الرحلات الحالية</Text>

      <FlatList
        data={shipments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  header: {
    backgroundColor: '#1e272e',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mapSimulation: {
    height: 180,
    backgroundColor: '#dcdde1',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
    borderRadius: 12,
  },
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f3640',
  },
  mapSubText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 20,
    marginBottom: 10,
    textAlign: 'right',
    color: '#2f3640',
  },
  listContainer: { paddingHorizontal: 15 },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  truckName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2f3640',
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'right',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#1e272e',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const initialShipments = [
  {
    id: '1',
    truck: 'شاحنة مرسيدس',
    plateNumber: '001234-16-00',
    status: 'في الطريق',
    driver: 'أحمد محمد',
    phone: '0550000000',
    cargo: 'مواد غذائية',
    quantity: '20 طن',
    origin: 'الجزائر',
    destination: 'وهران',
    date: '2026-09-17',
  },
  {
    id: '2',
    truck: 'شاحنة فولفو',
    plateNumber: '002345-19-00',
    status: 'مكتملة',
    driver: 'خالد علي',
    phone: '0560000000',
    cargo: 'حديد',
    quantity: '15 طن',
    origin: 'سطيف',
    destination: 'قسنطينة',
    date: '2026-09-16',
  },
];

const statuses = ['الكل', 'جاري التحميل', 'في الطريق', 'مكتملة'];

export default function App() {
  const [shipments, setShipments] = useState(initialShipments);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('الكل');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    truck: '',
    plateNumber: '',
    driver: '',
    phone: '',
    cargo: '',
    quantity: '',
    origin: '',
    destination: '',
    date: new Date().toISOString().slice(0, 10),
  });

  const filteredShipments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return shipments.filter((item) => {
      const matchesStatus = selectedStatus === 'الكل' || item.status === selectedStatus;
      const matchesSearch = !query || [
        item.truck,
        item.plateNumber,
        item.driver,
        item.origin,
        item.destination,
        item.cargo,
      ].some((value) => value.toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [search, selectedStatus, shipments]);

  const updateShipmentStatus = (id) => {
    const item = shipments.find((shipment) => shipment.id === id);
    if (!item) return;
    const nextStatus = item.status === 'جاري التحميل'
      ? 'في الطريق'
      : item.status === 'في الطريق'
        ? 'مكتملة'
        : 'جاري التحميل';
    setShipments((current) => current.map((shipment) => (
      shipment.id === id ? { ...shipment, status: nextStatus } : shipment
    )));
  };

  const addShipment = () => {
    const required = ['truck', 'plateNumber', 'driver', 'cargo', 'origin', 'destination'];
    if (required.some((field) => !form[field].trim())) {
      Alert.alert('بيانات ناقصة', 'من فضلك املأ معلومات الشاحنة والسائق والحمولة والمسار.');
      return;
    }

    setShipments((current) => [
      {
        ...form,
        id: Date.now().toString(),
        status: 'جاري التحميل',
      },
      ...current,
    ]);
    setForm({
      truck: '', plateNumber: '', driver: '', phone: '', cargo: '', quantity: '',
      origin: '', destination: '', date: new Date().toISOString().slice(0, 10),
    });
    setShowForm(false);
  };

  const removeShipment = (id) => {
    Alert.alert('حذف الرحلة', 'هل تريد حذف هذه الرحلة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => setShipments((current) => current.filter((item) => item.id !== id)),
      },
    ]);
  };

  const renderShipment = ({ item }) => {
    const statusColor = item.status === 'مكتملة'
      ? '#16a085'
      : item.status === 'في الطريق' ? '#e67e22' : '#2980b9';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: statusColor }]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
          <View style={styles.cardTitleBlock}>
            <Text style={styles.truckName}>🚚 {item.truck}</Text>
            <Text style={styles.plate}>{item.plateNumber}</Text>
          </View>
        </View>

        <View style={styles.routeRow}>
          <Text style={styles.routeText}>📍 {item.origin}</Text>
          <Text style={styles.arrow}>←</Text>
          <Text style={styles.routeText}>{item.destination} 📍</Text>
        </View>
        <Text style={styles.detail}>👤 السائق: {item.driver} {item.phone ? `  •  ${item.phone}` : ''}</Text>
        <Text style={styles.detail}>📦 الحمولة: {item.cargo} {item.quantity ? `  •  ${item.quantity}` : ''}</Text>
        <Text style={styles.detail}>📅 التاريخ: {item.date}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => updateShipmentStatus(item.id)}>
            <Text style={styles.buttonText}>تحديث الحالة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => removeShipment(item.id)}>
            <Text style={styles.deleteText}>حذف</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#123047" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>نقل كاميون 🚚</Text>
          <Text style={styles.headerSubtitle}>إدارة الشاحنات والرحلات</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
          <Text style={styles.addButtonText}>＋ رحلة</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <Summary label="كل الرحلات" value={shipments.length} />
        <Summary label="في الطريق" value={shipments.filter((item) => item.status === 'في الطريق').length} />
        <Summary label="مكتملة" value={shipments.filter((item) => item.status === 'مكتملة').length} />
      </View>

      <View style={styles.searchBox}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="ابحث بالشاحنة، السائق أو الوجهة..."
          placeholderTextColor="#8a99a8"
          style={styles.searchInput}
          textAlign="right"
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      <View style={styles.filters}>
        {statuses.map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filter, selectedStatus === status && styles.activeFilter]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[styles.filterText, selectedStatus === status && styles.activeFilterText]}>{status}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredShipments}
        renderItem={renderShipment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد رحلات مطابقة.</Text>}
      />

      <Modal visible={showForm} animationType="slide" transparent onRequestClose={() => setShowForm(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowForm(false)}><Text style={styles.close}>✕</Text></TouchableOpacity>
              <Text style={styles.modalTitle}>إضافة رحلة جد��دة</Text>
            </View>
            <FlatList
              data={[
                ['truck', 'اسم الشاحنة *'], ['plateNumber', 'رقم التسجيل *'], ['driver', 'اسم السائق *'],
                ['phone', 'هاتف السائق'], ['cargo', 'نوع الحمولة *'], ['quantity', 'الكمية'],
                ['origin', 'نقطة الانطلاق *'], ['destination', 'الوجهة *'], ['date', 'تاريخ الرحلة'],
              ]}
              keyExtractor={([key]) => key}
              renderItem={({ item: [key, label] }) => (
                <TextInput
                  value={form[key]}
                  onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))}
                  placeholder={label}
                  placeholderTextColor="#8a99a8"
                  style={styles.input}
                  textAlign="right"
                  keyboardType={key === 'phone' ? 'phone-pad' : 'default'}
                />
              )}
              ListFooterComponent={(
                <TouchableOpacity style={styles.saveButton} onPress={addShipment}>
                  <Text style={styles.saveButtonText}>حفظ الرحلة</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function Summary({ label, value }) {
  return <View style={styles.summaryItem}><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f6f8' },
  header: { backgroundColor: '#123047', padding: 18, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'right' },
  headerSubtitle: { color: '#b9cbd8', fontSize: 13, textAlign: 'right', marginTop: 3 },
  addButton: { backgroundColor: '#f39c12', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 9 },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  summary: { flexDirection: 'row-reverse', backgroundColor: '#fff', margin: 12, borderRadius: 12, paddingVertical: 14, elevation: 2 },
  summaryItem: { flex: 1, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#e7edf1' },
  summaryValue: { color: '#123047', fontSize: 22, fontWeight: 'bold' },
  summaryLabel: { color: '#71808c', fontSize: 12, marginTop: 3 },
  searchBox: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e1e8ed' },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: '#123047' },
  searchIcon: { fontSize: 18, marginLeft: 8 },
  filters: { flexDirection: 'row-reverse', paddingHorizontal: 12, paddingVertical: 12, gap: 7 },
  filter: { borderWidth: 1, borderColor: '#d6e0e6', borderRadius: 18, paddingHorizontal: 11, paddingVertical: 7 },
  activeFilter: { backgroundColor: '#123047', borderColor: '#123047' },
  filterText: { color: '#607381', fontSize: 12 },
  activeFilterText: { color: '#fff', fontWeight: 'bold' },
  list: { paddingHorizontal: 12, paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 13, padding: 15, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitleBlock: { flex: 1, alignItems: 'flex-end', marginRight: 10 },
  truckName: { color: '#123047', fontWeight: 'bold', fontSize: 17 },
  plate: { color: '#8796a1', fontSize: 12, marginTop: 3 },
  badge: { borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  routeRow: { backgroundColor: '#f2f7fa', borderRadius: 9, padding: 10, flexDirection: 'row-reverse', justifyContent: 'space-around', alignItems: 'center', marginBottom: 10 },
  routeText: { color: '#123047', fontSize: 14, fontWeight: 'bold' },
  arrow: { color: '#f39c12', fontSize: 20, fontWeight: 'bold' },
  detail: { color: '#647783', fontSize: 13, textAlign: 'right', marginBottom: 6 },
  actions: { flexDirection: 'row-reverse', gap: 8, marginTop: 6 },
  primaryButton: { flex: 1, backgroundColor: '#123047', borderRadius: 8, padding: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  deleteButton: { borderWidth: 1, borderColor: '#e5b5b5', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  deleteText: { color: '#c0392b', fontWeight: 'bold', fontSize: 13 },
  empty: { color: '#71808c', textAlign: 'center', marginTop: 35, fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modal: { backgroundColor: '#f3f6f8', maxHeight: '92%', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16 },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { color: '#123047', fontSize: 20, fontWeight: 'bold' },
  close: { color: '#607381', fontSize: 22, padding: 5 },
  input: { backgroundColor: '#fff', borderRadius: 9, borderWidth: 1, borderColor: '#dce5ea', paddingHorizontal: 13, paddingVertical: 12, marginBottom: 9, color: '#123047', fontSize: 14 },
  saveButton: { backgroundColor: '#16a085', borderRadius: 9, padding: 14, alignItems: 'center', marginTop: 5, marginBottom: 15 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

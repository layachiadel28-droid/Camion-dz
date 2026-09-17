import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const STORAGE_KEY = '@camion_dz_shipments';
const statuses = ['الكل', 'جاري التحميل', 'في الطريق', 'مكتملة'];
const initialShipments = [
  { id: '1', truck: 'شاحنة مرسيدس', plateNumber: '001234-16-00', status: 'في الطريق', driver: 'أحمد محمد', phone: '0550000000', cargo: 'مواد غذائية', quantity: '20 طن', origin: 'الجزائر', destination: 'وهران', date: '2026-09-17' },
  { id: '2', truck: 'شاحنة فولفو', plateNumber: '002345-19-00', status: 'مكتملة', driver: 'خالد علي', phone: '0560000000', cargo: 'حديد', quantity: '15 طن', origin: 'سطيف', destination: 'قسنطينة', date: '2026-09-16' },
];
const emptyForm = () => ({ truck: '', plateNumber: '', driver: '', phone: '', cargo: '', quantity: '', origin: '', destination: '', date: new Date().toISOString().slice(0, 10) });

export default function App() {
  const [shipments, setShipments] = useState(initialShipments);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('الكل');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [details, setDetails] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved) setShipments(JSON.parse(saved));
    }).catch(() => Alert.alert('تنبيه', 'تعذر قراءة الرحلات المحفوظة.'));
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(shipments)).catch(() => {});
  }, [shipments]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return shipments.filter((item) => {
      const statusMatch = selectedStatus === 'الكل' || item.status === selectedStatus;
      const values = [item.truck, item.plateNumber, item.driver, item.origin, item.destination, item.cargo];
      return statusMatch && (!query || values.some((value) => String(value || '').toLowerCase().includes(query)));
    });
  }, [search, selectedStatus, shipments]);

  const locateTruck = async () => {
    setLocationLoading(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('صلاحية الموقع', 'اسمح للتطبيق باستعمال الموقع لتفعيل التتبع.');
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(current.coords);
      Alert.alert('الموقع الحالي', `خط العرض: ${current.coords.latitude.toFixed(5)}\nخط الطول: ${current.coords.longitude.toFixed(5)}`);
    } catch {
      Alert.alert('خطأ', 'تعذر الحصول على الموقع حالياً.');
    } finally {
      setLocationLoading(false);
    }
  };

  const openAdd = () => { setEditingId(null); setForm(emptyForm()); setShowForm(true); };
  const openEdit = (item) => {
    setDetails(null);
    setEditingId(item.id);
    setForm({ ...emptyForm(), ...item });
    setShowForm(true);
  };

  const saveShipment = () => {
    const required = ['truck', 'plateNumber', 'driver', 'cargo', 'origin', 'destination'];
    if (required.some((field) => !String(form[field] || '').trim())) {
      Alert.alert('بيانات ناقصة', 'املأ معلومات الشاحنة والسائق والحمولة والمسار.');
      return;
    }
    if (editingId) {
      setShipments((current) => current.map((item) => item.id === editingId ? { ...item, ...form } : item));
    } else {
      setShipments((current) => [{ ...form, id: Date.now().toString(), status: 'جاري التحميل' }, ...current]);
    }
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(false);
  };

  const updateStatus = (id) => {
    setShipments((current) => current.map((item) => {
      if (item.id !== id) return item;
      const status = item.status === 'جاري التحميل' ? 'في الطريق' : item.status === 'في الطريق' ? 'مكتملة' : 'جاري التحميل';
      return { ...item, status };
    }));
  };

  const removeShipment = (id) => Alert.alert('حذف الرحلة', 'هل تريد حذف هذه الرحلة؟', [
    { text: 'إلغاء', style: 'cancel' },
    { text: 'حذف', style: 'destructive', onPress: () => setShipments((current) => current.filter((item) => item.id !== id)) },
  ]);

  const callDriver = (phone) => {
    if (!phone) return Alert.alert('لا يوجد رقم', 'أضف رقم هاتف السائق أولاً.');
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('خطأ', 'تعذر فتح تطبيق الاتصال.'));
  };

  const whatsappDriver = (phone) => {
    if (!phone) return Alert.alert('لا يوجد رقم', 'أضف رقم هاتف السائق أولاً.');
    const normalized = phone.replace(/^0/, '213');
    Linking.openURL(`whatsapp://send?phone=${normalized}`).catch(() => Alert.alert('خطأ', 'واتساب غير مثبت أو تعذر فتحه.'));
  };

  const renderShipment = ({ item }) => {
    const color = item.status === 'مكتملة' ? '#16a085' : item.status === 'في الطريق' ? '#e67e22' : '#2980b9';
    return <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: color }]}><Text style={styles.badgeText}>{item.status}</Text></View>
        <View style={styles.titleBlock}><Text style={styles.truckName}>🚚 {item.truck}</Text><Text style={styles.muted}>{item.plateNumber}</Text></View>
      </View>
      <View style={styles.route}><Text style={styles.routeText}>📍 {item.origin}</Text><Text style={styles.arrow}>←</Text><Text style={styles.routeText}>{item.destination} 📍</Text></View>
      <Text style={styles.detail}>👤 السائق: {item.driver}{item.phone ? `  •  ${item.phone}` : ''}</Text>
      <Text style={styles.detail}>📦 الحمولة: {item.cargo}{item.quantity ? `  •  ${item.quantity}` : ''}</Text>
      <Text style={styles.detail}>📅 التاريخ: {item.date}</Text>
      <View style={styles.actions}><TouchableOpacity style={styles.primary} onPress={() => setDetails(item)}><Text style={styles.buttonText}>التفاصيل</Text></TouchableOpacity><TouchableOpacity style={styles.secondary} onPress={() => openEdit(item)}><Text style={styles.secondaryText}>تعديل</Text></TouchableOpacity><TouchableOpacity style={styles.delete} onPress={() => removeShipment(item.id)}><Text style={styles.deleteText}>حذف</Text></TouchableOpacity></View>
      <View style={styles.actions}><TouchableOpacity style={styles.primary} onPress={() => updateStatus(item.id)}><Text style={styles.buttonText}>تحديث الحالة</Text></TouchableOpacity><TouchableOpacity style={styles.call} onPress={() => callDriver(item.phone)}><Text style={styles.callText}>☎ اتصال</Text></TouchableOpacity><TouchableOpacity style={styles.whatsapp} onPress={() => whatsappDriver(item.phone)}><Text style={styles.whatsappText}>واتساب</Text></TouchableOpacity></View>
    </View>;
  };

  return <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#123047" />
    <View style={styles.header}><View><Text style={styles.headerTitle}>نقل كاميون 🚚</Text><Text style={styles.headerSubtitle}>إدارة الشاحنات والرحلات</Text></View><TouchableOpacity style={styles.add} onPress={openAdd}><Text style={styles.addText}>＋ رحلة</Text></TouchableOpacity></View>
    <View style={styles.summary}><Summary label="كل الرحلات" value={shipments.length} /><Summary label="في الطريق" value={shipments.filter((x) => x.status === 'في الطريق').length} /><Summary label="مكتملة" value={shipments.filter((x) => x.status === 'مكتملة').length} /></View>
    <View style={styles.mapBox}>{location ? <MapView style={styles.map} region={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.04, longitudeDelta: 0.04 }}><Marker coordinate={location} title="موقعي الحالي" /></MapView> : <Text style={styles.mapHint}>🗺️ الخريطة والتتبع GPS</Text>}<TouchableOpacity style={styles.locationButton} onPress={locateTruck}><Text style={styles.locationText}>{locationLoading ? 'جارٍ تحديد الموقع...' : '📍 تحديد موقعي'}</Text></TouchableOpacity></View>
    <View style={styles.searchBox}><TextInput value={search} onChangeText={setSearch} placeholder="ابحث بالشاحنة، السائق أو الوجهة..." placeholderTextColor="#8a99a8" style={styles.searchInput} textAlign="right" /><Text>🔍</Text></View>
    <View style={styles.filters}>{statuses.map((status) => <TouchableOpacity key={status} style={[styles.filter, selectedStatus === status && styles.activeFilter]} onPress={() => setSelectedStatus(status)}><Text style={[styles.filterText, selectedStatus === status && styles.activeFilterText]}>{status}</Text></TouchableOpacity>)}</View>
    <FlatList data={filtered} renderItem={renderShipment} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>لا توجد رحلات مطابقة.</Text>} />

    <Modal visible={showForm} animationType="slide" transparent onRequestClose={() => setShowForm(false)}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}><View style={styles.modal}><View style={styles.modalHeader}><TouchableOpacity onPress={() => setShowForm(false)}><Text style={styles.close}>✕</Text></TouchableOpacity><Text style={styles.modalTitle}>{editingId ? 'تعديل الرحلة' : 'إضافة رحلة جديدة'}</Text></View><FlatList data={['truck','plateNumber','driver','phone','cargo','quantity','origin','destination','date']} keyExtractor={(key) => key} renderItem={({ item: key }) => <TextInput value={String(form[key] || '')} onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))} placeholder={{ truck: 'اسم الشاحنة *', plateNumber: 'رقم التسجيل *', driver: 'اسم السائق *', phone: 'هاتف السائق', cargo: 'نوع الحمولة *', quantity: 'الكمية', origin: 'نقطة الانطلاق *', destination: 'الوجهة *', date: 'تاريخ الرحلة' }[key]} placeholderTextColor="#8a99a8" style={styles.input} textAlign="right" keyboardType={key === 'phone' ? 'phone-pad' : 'default'} />} ListFooterComponent={<TouchableOpacity style={styles.save} onPress={saveShipment}><Text style={styles.saveText}>{editingId ? 'حفظ التعديل' : 'حفظ الرحلة'}</Text></TouchableOpacity>} /></View></KeyboardAvoidingView></Modal>

    <Modal visible={Boolean(details)} animationType="slide" transparent onRequestClose={() => setDetails(null)}><View style={styles.overlay}><View style={styles.detailModal}>{details && <><View style={styles.modalHeader}><TouchableOpacity onPress={() => setDetails(null)}><Text style={styles.close}>✕</Text></TouchableOpacity><Text style={styles.modalTitle}>تفاصيل الرحلة</Text></View><Text style={styles.detailTitle}>🚚 {details.truck}</Text><Text style={styles.bigDetail}>الحالة: {details.status}</Text><Text style={styles.bigDetail}>رقم التسجيل: {details.plateNumber}</Text><Text style={styles.bigDetail}>السائق: {details.driver}</Text><Text style={styles.bigDetail}>الهاتف: {details.phone || 'غير مسجل'}</Text><Text style={styles.bigDetail}>الحمولة: {details.cargo} - {details.quantity || 'الكمية غير محددة'}</Text><Text style={styles.bigDetail}>المسار: {details.origin} ← {details.destination}</Text><Text style={styles.bigDetail}>التاريخ: {details.date}</Text><View style={styles.actions}><TouchableOpacity style={styles.call} onPress={() => callDriver(details.phone)}><Text style={styles.callText}>☎ اتصال</Text></TouchableOpacity><TouchableOpacity style={styles.whatsapp} onPress={() => whatsappDriver(details.phone)}><Text style={styles.whatsappText}>واتساب</Text></TouchableOpacity><TouchableOpacity style={styles.secondary} onPress={() => openEdit(details)}><Text style={styles.secondaryText}>تعديل</Text></TouchableOpacity></View></>}</View></View></Modal>
  </SafeAreaView>;
}

function Summary({ label, value }) { return <View style={styles.summaryItem}><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f6f8' }, header: { backgroundColor: '#123047', padding: 18, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }, headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' }, headerSubtitle: { color: '#b9cbd8', fontSize: 13 }, add: { backgroundColor: '#f39c12', padding: 10, borderRadius: 9 }, addText: { color: '#fff', fontWeight: 'bold' }, summary: { flexDirection: 'row-reverse', backgroundColor: '#fff', margin: 12, borderRadius: 12, paddingVertical: 14, elevation: 2 }, summaryItem: { flex: 1, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#e7edf1' }, summaryValue: { color: '#123047', fontSize: 22, fontWeight: 'bold' }, summaryLabel: { color: '#71808c', fontSize: 12 }, mapBox: { height: 150, marginHorizontal: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: '#dce7ed', justifyContent: 'center', alignItems: 'center' }, map: { ...StyleSheet.absoluteFillObject }, mapHint: { color: '#456879', fontWeight: 'bold' }, locationButton: { position: 'absolute', bottom: 10, backgroundColor: '#123047', padding: 9, borderRadius: 8 }, locationText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }, searchBox: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#fff', margin: 12, marginBottom: 0, borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e1e8ed' }, searchInput: { flex: 1, paddingVertical: 11, color: '#123047' }, filters: { flexDirection: 'row-reverse', padding: 12, gap: 6 }, filter: { borderWidth: 1, borderColor: '#d6e0e6', borderRadius: 18, paddingHorizontal: 10, paddingVertical: 7 }, activeFilter: { backgroundColor: '#123047', borderColor: '#123047' }, filterText: { color: '#607381', fontSize: 12 }, activeFilterText: { color: '#fff', fontWeight: 'bold' }, list: { paddingHorizontal: 12, paddingBottom: 20 }, card: { backgroundColor: '#fff', borderRadius: 13, padding: 15, marginBottom: 12, elevation: 2 }, cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }, titleBlock: { flex: 1, alignItems: 'flex-end', marginRight: 10 }, truckName: { color: '#123047', fontWeight: 'bold', fontSize: 17 }, muted: { color: '#8796a1', fontSize: 12 }, badge: { borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 }, badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' }, route: { backgroundColor: '#f2f7fa', borderRadius: 9, padding: 10, flexDirection: 'row-reverse', justifyContent: 'space-around', alignItems: 'center' }, routeText: { color: '#123047', fontWeight: 'bold' }, arrow: { color: '#f39c12', fontSize: 20 }, detail: { color: '#647783', fontSize: 13, textAlign: 'right', marginTop: 7 }, actions: { flexDirection: 'row-reverse', gap: 7, marginTop: 10 }, primary: { flex: 1, backgroundColor: '#123047', borderRadius: 8, padding: 10, alignItems: 'center' }, buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }, secondary: { borderWidth: 1, borderColor: '#b8cbd6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 }, secondaryText: { color: '#34596d', fontWeight: 'bold', fontSize: 12 }, call: { backgroundColor: '#2980b9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 }, callText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }, whatsapp: { backgroundColor: '#16a085', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10 }, whatsappText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }, delete: { borderWidth: 1, borderColor: '#e5b5b5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 }, deleteText: { color: '#c0392b', fontWeight: 'bold', fontSize: 12 }, empty: { textAlign: 'center', color: '#71808c', marginTop: 30 }, overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,.45)' }, modal: { backgroundColor: '#f3f6f8', maxHeight: '92%', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16 }, detailModal: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18 }, modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, modalTitle: { color: '#123047', fontSize: 20, fontWeight: 'bold' }, close: { fontSize: 22, color: '#607381' }, input: { backgroundColor: '#fff', borderRadius: 9, borderWidth: 1, borderColor: '#dce5ea', padding: 12, marginBottom: 9, color: '#123047' }, save: { backgroundColor: '#16a085', borderRadius: 9, padding: 14, alignItems: 'center', marginTop: 5 }, saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }, detailTitle: { color: '#123047', fontSize: 21, fontWeight: 'bold', textAlign: 'right', marginBottom: 15 }, bigDetail: { color: '#526b78', fontSize: 15, textAlign: 'right', marginBottom: 10 },
});

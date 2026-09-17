import React, { useEffect, useMemo, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const KEYS = { user: '@camion_user', trips: '@camion_trips', plan: '@camion_plan' };
const plans = [
  { id: 'free', name: 'مجاني', price: '0 دج', features: ['حتى 3 رحلات', 'إدارة أساسية', 'خريطة GPS'] },
  { id: 'pro', name: 'احترافي', price: '1,500 دج / شهر', features: ['رحلات غير محدودة', 'تتبع GPS', 'تقارير ومشاركة'] },
  { id: 'business', name: 'مؤسسات', price: '4,500 دج / شهر', features: ['عدة مستخدمين', 'إدارة الأسطول', 'دعم وأولوية'] },
];
const initialTrips = [
  { id: '1', truck: 'شاحنة مرسيدس', plate: '001234-16-00', driver: 'أحمد محمد', phone: '0550000000', cargo: 'مواد غذائية', from: 'الجزائر', to: 'وهران', status: 'في الطريق' },
  { id: '2', truck: 'شاحنة فولفو', plate: '002345-19-00', driver: 'خالد علي', phone: '0560000000', cargo: 'حديد', from: 'سطيف', to: 'قسنطينة', status: 'مكتملة' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState(initialTrips);
  const [plan, setPlan] = useState('free');
  const [screen, setScreen] = useState('home');
  const [showTripForm, setShowTripForm] = useState(false);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState(null);
  const [form, setForm] = useState({ truck: '', plate: '', driver: '', phone: '', cargo: '', from: '', to: '' });

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(KEYS.user), AsyncStorage.getItem(KEYS.trips), AsyncStorage.getItem(KEYS.plan)])
      .then(([savedUser, savedTrips, savedPlan]) => {
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedTrips) setTrips(JSON.parse(savedTrips));
        if (savedPlan) setPlan(savedPlan);
      });
  }, []);
  useEffect(() => { AsyncStorage.setItem(KEYS.trips, JSON.stringify(trips)); }, [trips]);
  useEffect(() => { if (user) AsyncStorage.setItem(KEYS.user, JSON.stringify(user)); }, [user]);

  const filteredTrips = useMemo(() => {
    const query = search.trim().toLowerCase();
    return trips.filter((trip) => !query || [trip.truck, trip.plate, trip.driver, trip.cargo, trip.from, trip.to].some((v) => String(v).toLowerCase().includes(query)));
  }, [trips, search]);

  const requestLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') return Alert.alert('صلاحية GPS', 'اسمح للتطبيق باستعمال موقعك من إعدادات الهاتف.');
    const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setLocation(current.coords);
  };

  const saveTrip = () => {
    if ([form.truck, form.plate, form.driver, form.cargo, form.from, form.to].some((v) => !v.trim())) return Alert.alert('بيانات ناقصة', 'املأ الحقول الإلزامية.');
    if (plan === 'free' && trips.length >= 3) return Alert.alert('الخطة المجانية', 'وصلت إلى 3 رحلات. اختر اشتراكاً للمتابعة.');
    setTrips((current) => [{ ...form, id: Date.now().toString(), status: 'جاري التحميل' }, ...current]);
    setForm({ truck: '', plate: '', driver: '', phone: '', cargo: '', from: '', to: '' });
    setShowTripForm(false);
  };

  const updateStatus = (id) => setTrips((current) => current.map((trip) => trip.id === id ? { ...trip, status: trip.status === 'جاري التحميل' ? 'في الطريق' : trip.status === 'في الطريق' ? 'مكتملة' : 'جاري التحميل' } : trip));
  const logout = () => { setUser(null); AsyncStorage.removeItem(KEYS.user); };

  if (!user) return <Registration onRegistered={setUser} />;

  return <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#123047" />
    <View style={styles.header}><View><Text style={styles.title}>كاميون DZ 🚚</Text><Text style={styles.subtitle}>مرحباً، {user.name}</Text></View><Text style={styles.plan}>{plans.find((p) => p.id === plan)?.name}</Text></View>

    {screen === 'home' && <>
      <View style={styles.stats}><Stat label="كل الرحلات" value={trips.length} /><Stat label="في الطريق" value={trips.filter((t) => t.status === 'في الطريق').length} /><Stat label="مكتملة" value={trips.filter((t) => t.status === 'مكتملة').length} /></View>
      <View style={styles.search}><TextInput value={search} onChangeText={setSearch} placeholder="ابحث عن رحلة أو شاحنة..." placeholderTextColor="#8a99a8" style={styles.searchInput} textAlign="right" /><Text>🔍</Text></View>
      <TouchableOpacity style={styles.addButton} onPress={() => setShowTripForm(true)}><Text style={styles.addText}>＋ تسجيل رحلة جديدة</Text></TouchableOpacity>
      <FlatList data={filteredTrips} keyExtractor={(item) => item.id} renderItem={({ item }) => <TripCard trip={item} onStatus={() => updateStatus(item.id)} />} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>لا توجد رحلات.</Text>} />
    </>}

    {screen === 'map' && <View style={styles.flex}><Text style={styles.section}>الخريطة وتتبع الشاحنات</Text><View style={styles.mapWrap}>{location ? <MapView style={styles.map} region={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.08, longitudeDelta: 0.08 }} showsUserLocation><Marker coordinate={location} title="موقعك الحالي" /></MapView> : <Text style={styles.mapPlaceholder}>اضغط لتحديد موقعك على الخريطة</Text>}<TouchableOpacity style={styles.gpsButton} onPress={requestLocation}><Text style={styles.gpsText}>📍 تحديث موقعي GPS</Text></TouchableOpacity></View><Text style={styles.info}>التتبع المعروض هو موقع الهاتف الحالي. التتبع المباشر لكل شاحنة يحتاج جهاز GPS أو تطبيق السائق وحساباً مشتركاً.</Text></View>}

    {screen === 'subscription' && <Subscription plan={plan} onSelect={(id) => { setPlan(id); AsyncStorage.setItem(KEYS.plan, id); Alert.alert('تم الاختيار', 'تم تفعيل الخطة محلياً. ربط الدفع الإلكتروني يحتاج حساب دفع وخادماً.'); }} />}

    {screen === 'profile' && <View style={styles.profile}><Text style={styles.section}>حسابي</Text><Text style={styles.profileText}>الاسم: {user.name}</Text><Text style={styles.profileText}>الهاتف: {user.phone}</Text><Text style={styles.profileText}>الخطة الحالية: {plans.find((p) => p.id === plan)?.name}</Text><TouchableOpacity style={styles.logout} onPress={logout}><Text style={styles.logoutText}>تسجيل الخروج</Text></TouchableOpacity></View>}

    <View style={styles.nav}>{[['home', 'الرئيسية'], ['map', 'الخريطة'], ['subscription', 'الاشتراك'], ['profile', 'حسابي']].map(([id, label]) => <TouchableOpacity key={id} style={styles.navItem} onPress={() => setScreen(id)}><Text style={[styles.navText, screen === id && styles.navActive]}>{id === 'home' ? '🏠' : id === 'map' ? '🗺️' : id === 'subscription' ? '⭐' : '👤'}\n{label}</Text></TouchableOpacity>)}</View>

    <Modal visible={showTripForm} animationType="slide" transparent onRequestClose={() => setShowTripForm(false)}><KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.modal}><Text style={styles.modalTitle}>تسجيل رحلة جديدة</Text>{[['truck', 'اسم الشاحنة *'], ['plate', 'رقم التسجيل *'], ['driver', 'اسم السائق *'], ['phone', 'هاتف السائق'], ['cargo', 'نوع الحمولة *'], ['from', 'نقطة الانطلاق *'], ['to', 'الوجهة *']].map(([key, placeholder]) => <TextInput key={key} value={form[key]} onChangeText={(value) => setForm({ ...form, [key]: value })} placeholder={placeholder} placeholderTextColor="#8a99a8" textAlign="right" style={styles.input} keyboardType={key === 'phone' ? 'phone-pad' : 'default'} />)}<TouchableOpacity style={styles.saveButton} onPress={saveTrip}><Text style={styles.saveText}>حفظ الرحلة</Text></TouchableOpacity><TouchableOpacity onPress={() => setShowTripForm(false)}><Text style={styles.cancel}>إلغاء</Text></TouchableOpacity></View></KeyboardAvoidingView></Modal>
  </SafeAreaView>;
}

function Registration({ onRegistered }) {
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [password, setPassword] = useState('');
  const register = () => { if (!name.trim() || !/^0[5-7][0-9]{8}$/.test(phone) || password.length < 4) return Alert.alert('تحقق من البيانات', 'أدخل الاسم، رقم هاتف جزائري صحيح وكلمة مرور من 4 أحرف على الأقل.'); onRegistered({ name, phone }); };
  return <SafeAreaView style={styles.auth}><Text style={styles.logo}>🚚</Text><Text style={styles.authTitle}>كاميون DZ</Text><Text style={styles.authSubtitle}>إدارة نقل الشاحنات بسهولة</Text><TextInput placeholder="الاسم الكامل" value={name} onChangeText={setName} style={styles.authInput} textAlign="right" /><TextInput placeholder="رقم الهاتف الجزائري" value={phone} onChangeText={setPhone} style={styles.authInput} keyboardType="phone-pad" textAlign="right" /><TextInput placeholder="كلمة المرور" value={password} onChangeText={setPassword} style={styles.authInput} secureTextEntry textAlign="right" /><TouchableOpacity style={styles.register} onPress={register}><Text style={styles.registerText}>إنشاء حساب</Text></TouchableOpacity><Text style={styles.note}>التسجيل محلي للتجربة. لإضافة دخول حقيقي نحتاج خادم وقاعدة بيانات.</Text></SafeAreaView>;
}
function TripCard({ trip, onStatus }) { const color = trip.status === 'مكتملة' ? '#16a085' : trip.status === 'في الطريق' ? '#e67e22' : '#2980b9'; return <View style={styles.card}><View style={styles.cardTop}><View style={[styles.badge, { backgroundColor: color }]}><Text style={styles.badgeText}>{trip.status}</Text></View><View><Text style={styles.cardTitle}>🚚 {trip.truck}</Text><Text style={styles.muted}>{trip.plate}</Text></View></View><Text style={styles.route}>{trip.from}  ←  {trip.to}</Text><Text style={styles.detail}>👤 {trip.driver}  •  📦 {trip.cargo}</Text><TouchableOpacity style={styles.statusButton} onPress={onStatus}><Text style={styles.statusText}>تحديث الحالة</Text></TouchableOpacity></View>; }
function Stat({ label, value }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.muted}>{label}</Text></View>; }
function Subscription({ plan, onSelect }) { return <View style={styles.flex}><Text style={styles.section}>اختر اشتراكك</Text><Text style={styles.info}>ابدأ مجاناً أو اختر الخطة المناسبة لأسطولك.</Text><FlatList data={plans} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} renderItem={({ item }) => <View style={[styles.planCard, plan === item.id && styles.selectedPlan]}><View style={styles.planHeader}><Text style={styles.planName}>{item.name}</Text><Text style={styles.price}>{item.price}</Text></View>{item.features.map((feature) => <Text key={feature} style={styles.feature}>✓ {feature}</Text>)}<TouchableOpacity style={styles.choose} onPress={() => onSelect(item.id)}><Text style={styles.chooseText}>{plan === item.id ? 'الخطة الحالية' : 'اختيار الخطة'}</Text></TouchableOpacity></View>} /></View>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f6f8' }, flex: { flex: 1 }, header: { backgroundColor: '#123047', padding: 18, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }, title: { color: '#fff', fontSize: 24, fontWeight: 'bold' }, subtitle: { color: '#b9cbd8', textAlign: 'right', marginTop: 3 }, plan: { color: '#fff', backgroundColor: '#16a085', padding: 8, borderRadius: 15 }, stats: { flexDirection: 'row-reverse', backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 15 }, stat: { flex: 1, alignItems: 'center' }, statValue: { color: '#123047', fontSize: 22, fontWeight: 'bold' }, muted: { color: '#82929c', fontSize: 12 }, search: { backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row-reverse', alignItems: 'center' }, searchInput: { flex: 1, padding: 12 }, addButton: { backgroundColor: '#f39c12', margin: 12, padding: 13, borderRadius: 9, alignItems: 'center' }, addText: { color: '#fff', fontWeight: 'bold' }, list: { padding: 12, paddingBottom: 20 }, card: { backgroundColor: '#fff', padding: 15, borderRadius: 13, marginBottom: 12, elevation: 2 }, cardTop: { flexDirection: 'row-reverse', justifyContent: 'space-between' }, cardTitle: { color: '#123047', fontWeight: 'bold', fontSize: 17, textAlign: 'right' }, badge: { padding: 7, borderRadius: 16, height: 32 }, badgeText: { color: '#fff', fontSize: 11 }, route: { backgroundColor: '#f2f7fa', color: '#123047', textAlign: 'center', padding: 11, marginVertical: 10, fontWeight: 'bold' }, detail: { color: '#647783', textAlign: 'right' }, statusButton: { backgroundColor: '#123047', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 }, statusText: { color: '#fff', fontWeight: 'bold' }, mapWrap: { height: 430, margin: 12, borderRadius: 14, overflow: 'hidden', backgroundColor: '#dce7ed', justifyContent: 'center', alignItems: 'center' }, map: { ...StyleSheet.absoluteFillObject }, mapPlaceholder: { color: '#456879', fontWeight: 'bold' }, gpsButton: { position: 'absolute', bottom: 15, backgroundColor: '#123047', padding: 12, borderRadius: 9 }, gpsText: { color: '#fff', fontWeight: 'bold' }, section: { color: '#123047', fontSize: 21, fontWeight: 'bold', textAlign: 'right', margin: 16 }, info: { color: '#647783', textAlign: 'right', marginHorizontal: 16, lineHeight: 22 }, nav: { flexDirection: 'row-reverse', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e9ed', paddingBottom: 6 }, navItem: { flex: 1, alignItems: 'center', padding: 8 }, navText: { textAlign: 'center', color: '#82929c', fontSize: 11, lineHeight: 20 }, navActive: { color: '#123047', fontWeight: 'bold' }, profile: { flex: 1 }, profileText: { backgroundColor: '#fff', padding: 16, marginHorizontal: 12, marginBottom: 8, textAlign: 'right', color: '#456879' }, logout: { backgroundColor: '#c0392b', margin: 16, padding: 13, borderRadius: 9, alignItems: 'center' }, logoutText: { color: '#fff', fontWeight: 'bold' }, planCard: { backgroundColor: '#fff', borderRadius: 14, padding: 17, marginBottom: 12, elevation: 2 }, selectedPlan: { borderWidth: 2, borderColor: '#16a085' }, planHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between' }, planName: { color: '#123047', fontSize: 19, fontWeight: 'bold' }, price: { color: '#16a085', fontWeight: 'bold' }, feature: { color: '#647783', textAlign: 'right', marginTop: 9 }, choose: { backgroundColor: '#123047', borderRadius: 8, padding: 11, alignItems: 'center', marginTop: 14 }, chooseText: { color: '#fff', fontWeight: 'bold' }, auth: { flex: 1, backgroundColor: '#123047', justifyContent: 'center', padding: 24 }, logo: { textAlign: 'center', fontSize: 55 }, authTitle: { color: '#fff', textAlign: 'center', fontSize: 30, fontWeight: 'bold' }, authSubtitle: { color: '#b9cbd8', textAlign: 'center', marginBottom: 28 }, authInput: { backgroundColor: '#fff', borderRadius: 9, padding: 14, marginBottom: 12 }, register: { backgroundColor: '#f39c12', padding: 14, borderRadius: 9, alignItems: 'center' }, registerText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }, note: { color: '#b9cbd8', textAlign: 'center', marginTop: 18, fontSize: 12 }, overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,.45)' }, modal: { backgroundColor: '#f3f6f8', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16, maxHeight: '92%' }, modalTitle: { color: '#123047', textAlign: 'right', fontSize: 21, fontWeight: 'bold', marginBottom: 12 }, input: { backgroundColor: '#fff', borderRadius: 9, padding: 12, marginBottom: 9, borderWidth: 1, borderColor: '#dce5ea' }, saveButton: { backgroundColor: '#16a085', padding: 14, borderRadius: 9, alignItems: 'center' }, saveText: { color: '#fff', fontWeight: 'bold' }, cancel: { textAlign: 'center', color: '#c0392b', padding: 14 }, empty: { textAlign: 'center', color: '#71808c', marginTop: 30 },
});

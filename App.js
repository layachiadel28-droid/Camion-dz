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

const OPENAI_API_KEY = 'PASTE_YOUR_OPENAI_API_KEY_HERE';
const OPENAI_MODEL = 'gpt-4o-mini';
const KEYS = { user: '@camion_user', trips: '@camion_trips', plan: '@camion_plan' };

const plans = [
  { id: 'free', name: 'مجاني', price: '0 دج', features: ['حتى 3 رحلات', 'إدارة أساسية', 'خريطة GPS'] },
  { id: 'pro', name: 'احترافي', price: '1,500 دج / شهر', features: ['رحلات غير محدودة', 'تتبع GPS', 'تقارير ومشاركة'] },
  { id: 'business', name: 'مؤسسات', price: '4,500 دج / شهر', features: ['عدة مستخدمين', 'إدارة الأسطول', 'دعم وأولوية'] },
];

const initialTrips = [
  { id: '1', truck: 'شاحنة مرسيدس', plate: '001234-16-00', driver: 'أحمد محمد', phone: '0550000000', cargo: 'مواد غذائية', from: 'الجزائر', to: 'وهران', status: 'في الطريق' },
  { id: '2', truck: 'شاحنة فولفو', plate: '002345-19-00', driver: 'خالد علي', phone: '0560000000', cargo: 'حديد', from: 'سطيف', to: 'قسنطينة', status: 'مكتملة' },
  { id: '3', truck: 'شاحنة MAN', plate: '003456-21-00', driver: 'سامر عمر', phone: '0540000000', cargo: 'أسمنت', from: 'تبسة', to: 'ورقلة', status: 'جاري التحميل' },
];

async function askOpenAI(prompt) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'PASTE_YOUR_OPENAI_API_KEY_HERE') {
    throw new Error('يرجى إدخال مفتاح OpenAI في ملف App.js قبل استخدام المساعد.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'أنت مساعد ذكي عربي لصناعة النقل والخدمات اللوجستية. ساعد المستخدم في إدارة الرحلات، متابعة الشاحنات، وضع خطط التشغيل، حساب الأسعار، وأمثل باسم كاميون DZ.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errText = data?.error?.message || 'حدث خطأ في الاتصال بـ OpenAI.';
    throw new Error(errText);
  }

  return data.choices?.[0]?.message?.content?.trim() || 'لا يوجد رد.';
}

export default function App() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState(initialTrips);
  const [plan, setPlan] = useState('free');
  const [screen, setScreen] = useState('home');
  const [showTripForm, setShowTripForm] = useState(false);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState(null);
  const [form, setForm] = useState({ truck: '', plate: '', driver: '', phone: '', cargo: '', from: '', to: '' });
  const [chatMessages, setChatMessages] = useState([
    { id: 'welcome', role: 'assistant', text: 'مرحباً! أنا مساعد كاميون DZ. أستطيع أن أساعدك في إدارة الرحلات، متابعة الشاحنات، أو اقتراح حلول تشغيلية.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

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

  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', text };
    setChatMessages((current) => [...current, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const answer = await askOpenAI(`${text}\n\nالسياق: التطبيق هو "كاميون DZ" لإدارة شاحنات، رحلات، اشتراكات، وتتبع GPS.`);
      setChatMessages((current) => [...current, { id: `bot-${Date.now()}`, role: 'assistant', text: answer }]);
    } catch (error) {
      setChatMessages((current) => [...current, { id: `error-${Date.now()}`, role: 'assistant', text: error?.message || 'حدث خطأ أثناء الاتصال بالخادم.' }]);
      Alert.alert('خطأ في المساعد', error?.message || 'حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setChatLoading(false);
    }
  };

  if (!user) return <Registration onRegistered={setUser} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#123047" />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>كاميون DZ 🚚</Text>
          <Text style={styles.subtitle}>مرحباً، {user.name}</Text>
        </View>
        <Text style={styles.plan}>{plans.find((p) => p.id === plan)?.name || 'مجاني'}</Text>
      </View>

      {screen === 'home' && (
        <>
          <View style={styles.stats}>
            <Stat label="كل الرحلات" value={trips.length} />
            <Stat label="في الطريق" value={trips.filter((t) => t.status === 'في الطريق').length} />
            <Stat label="مكتملة" value={trips.filter((t) => t.status === 'مكتملة').length} />
          </View>

          <View style={styles.search}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="ابحث عن رحلة أو شاحنة..."
              placeholderTextColor="#8a99a8"
              style={styles.searchInput}
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={() => setShowTripForm(true)}>
            <Text style={styles.addText}>＋ تسجيل رحلة جديدة</Text>
          </TouchableOpacity>

          <FlatList
            data={filteredTrips}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TripCard trip={item} onStatus={() => updateStatus(item.id)} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {screen === 'map' && (
        <View style={styles.flex}>
          <Text style={styles.section}>الخريطة وتتبع الشاحنات</Text>
          <View style={styles.mapWrap}>
            {location ? (
              <MapView style={styles.map} initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}>
                <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title="موقعك الحالي" />
              </MapView>
            ) : (
              <View style={styles.mapPlaceholder}>
                <Text style={styles.info}>لا يوجد موقع حتى الآن.</Text>
                <TouchableOpacity style={styles.smallAction} onPress={requestLocation}>
                  <Text style={styles.smallActionText}>فتح GPS</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {screen === 'subscription' && (
        <Subscription
          plan={plan}
          onSelect={(id) => {
            setPlan(id);
            AsyncStorage.setItem(KEYS.plan, id);
            Alert.alert('تم الاختيار', 'تم تفعيل الخطة المحددة بنجاح.');
          }}
        />
      )}

      {screen === 'profile' && (
        <View style={styles.profile}>
          <Text style={styles.section}>حسابي</Text>
          <Text style={styles.profileText}>الاسم: {user.name}</Text>
          <Text style={styles.profileText}>الهاتف: {user.phone}</Text>
          <Text style={styles.profileText}>الخطة الحالية: {plans.find((p) => p.id === plan)?.name || 'مجاني'}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>تسجيل الخروج</Text>
          </TouchableOpacity>
        </View>
      )}

      {screen === 'assistant' && (
        <View style={styles.chatContainer}>
          <Text style={styles.section}>المساعد الذكي</Text>
          <FlatList
            data={chatMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.chatBubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.chatText, item.role === 'user' ? styles.userText : styles.aiText]}>{item.text}</Text>
              </View>
            )}
            contentContainerStyle={styles.chatList}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.chatInputRow}>
            <TextInput
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="اكتب سؤالك للمساعد..."
              placeholderTextColor="#7f8e9d"
              style={styles.chatInput}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendChatMessage} disabled={chatLoading}>
              <Text style={styles.sendButtonText}>{chatLoading ? '...' : 'إرسال'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.nav}>
        {[
          ['home', 'الرئيسية'],
          ['map', 'الخريطة'],
          ['subscription', 'الاشتراك'],
          ['assistant', 'المساعد'],
          ['profile', 'حسابي'],
        ].map(([id, label]) => (
          <TouchableOpacity
            key={id}
            style={[styles.navItem, screen === id && styles.navItemActive]}
            onPress={() => setScreen(id)}
          >
            <Text style={[styles.navText, screen === id && styles.navTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={showTripForm} animationType="slide" transparent onRequestClose={() => setShowTripForm(false)}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.section}>إضافة رحلة جديدة</Text>
            <TextInput value={form.truck} onChangeText={(v) => setForm((p) => ({ ...p, truck: v }))} placeholder="نوع الشاحنة" style={styles.input} />
            <TextInput value={form.plate} onChangeText={(v) => setForm((p) => ({ ...p, plate: v }))} placeholder="اللوحة" style={styles.input} />
            <TextInput value={form.driver} onChangeText={(v) => setForm((p) => ({ ...p, driver: v }))} placeholder="اسم السائق" style={styles.input} />
            <TextInput value={form.phone} onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))} placeholder="رقم الهاتف" keyboardType="phone-pad" style={styles.input} />
            <TextInput value={form.cargo} onChangeText={(v) => setForm((p) => ({ ...p, cargo: v }))} placeholder="نوع البضاعة" style={styles.input} />
            <TextInput value={form.from} onChangeText={(v) => setForm((p) => ({ ...p, from: v }))} placeholder="من" style={styles.input} />
            <TextInput value={form.to} onChangeText={(v) => setForm((p) => ({ ...p, to: v }))} placeholder="إلى" style={styles.input} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowTripForm(false)}>
                <Text style={styles.cancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={saveTrip}>
                <Text style={styles.submitText}>حفظ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function Registration({ onRegistered }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const register = () => {
    if (!name.trim() || !/^0[5-7][0-9]{8}$/.test(phone) || password.length < 4) {
      return Alert.alert('تحقق من البيانات', 'أدخل الاسم، رقم هاتف صحيح، وكلمة مرور لا تقل عن 4 أحرف.');
    }

    onRegistered({ name, phone, password });
  };

  return (
    <SafeAreaView style={styles.auth}>
      <Text style={styles.logo}>🚚</Text>
      <Text style={styles.authTitle}>كاميون DZ</Text>
      <Text style={styles.authSubtitle}>إدارة نقل الشاحنات</Text>
      <TextInput value={name} onChangeText={setName} placeholder="الاسم الكامل" style={styles.authInput} />
      <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="رقم الهاتف" style={styles.authInput} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="كلمة المرور" style={styles.authInput} />
      <TouchableOpacity style={styles.authButton} onPress={register}>
        <Text style={styles.authButtonText}>تسجيل الدخول</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function TripCard({ trip, onStatus }) {
  const color = trip.status === 'مكتملة' ? '#16a085' : trip.status === 'في الطريق' ? '#e67e22' : '#2980b9';

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.tripTitle}>{trip.truck}</Text>
        <Text style={[styles.badge, { backgroundColor: color }]}>{trip.status}</Text>
      </View>
      <Text style={styles.tripText}>اللوحة: {trip.plate}</Text>
      <Text style={styles.tripText}>السائق: {trip.driver}</Text>
      <Text style={styles.tripText}>من: {trip.from} إلى: {trip.to}</Text>
      <Text style={styles.tripText}>البضاعة: {trip.cargo}</Text>
      <TouchableOpacity style={styles.statusButton} onPress={onStatus}>
        <Text style={styles.statusText}>تغيير الحالة</Text>
      </TouchableOpacity>
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

function Subscription({ plan, onSelect }) {
  return (
    <View style={styles.flex}>
      <Text style={styles.section}>اختر اشتراكك</Text>
      <Text style={styles.info}>ابدأ مجاناً أو اختر باقة مناسبة لعملك.</Text>
      {plans.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.planCard, plan === item.id && styles.planCardActive]}
          onPress={() => onSelect(item.id)}
        >
          <Text style={styles.planName}>{item.name}</Text>
          <Text style={styles.planPrice}>{item.price}</Text>
          {item.features.map((feature) => (
            <Text key={feature} style={styles.planFeature}>• {feature}</Text>
          ))}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f6f8' },
  flex: { flex: 1 },
  header: {
    backgroundColor: '#123047',
    padding: 18,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 26, color: '#fff', fontWeight: '700', textAlign: 'right' },
  subtitle: { fontSize: 15, color: '#dfeaf3', marginTop: 4, textAlign: 'right' },
  plan: { color: '#fff', backgroundColor: '#1aa7a7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, fontWeight: '700' },
  stats: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  stat: { flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, marginHorizontal: 4, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#123047' },
  muted: { fontSize: 12, color: '#72849a', marginTop: 4 },
  search: { paddingHorizontal: 16, marginBottom: 10 },
  searchInput: { backgroundColor: '#fff', borderRadius: 12, padding: 12, textAlign: 'right', borderWidth: 1, borderColor: '#dfe6ee' },
  addButton: { backgroundColor: '#123047', padding: 14, marginHorizontal: 16, borderRadius: 12, marginBottom: 10 },
  addText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#edf2f5' },
  cardRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  tripTitle: { fontSize: 18, fontWeight: '700', color: '#123047', textAlign: 'right' },
  badge: { color: '#fff', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, fontSize: 11, fontWeight: '700' },
  tripText: { textAlign: 'right', color: '#42556e', marginTop: 5 },
  statusButton: { marginTop: 12, backgroundColor: '#eaf3ff', padding: 10, borderRadius: 10 },
  statusText: { textAlign: 'center', color: '#123047', fontWeight: '700' },
  section: { color: '#123047', fontWeight: '700', fontSize: 22, textAlign: 'right', marginHorizontal: 16, marginVertical: 12 },
  mapWrap: { flex: 1, marginHorizontal: 16, marginBottom: 12, borderRadius: 14, overflow: 'hidden', backgroundColor: '#dfeaf3' },
  map: { flex: 1 },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#dfeaf3' },
  info: { color: '#123047', fontWeight: '700', marginBottom: 12 },
  smallAction: { backgroundColor: '#123047', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  smallActionText: { color: '#fff', fontWeight: '700' },
  profile: { flex: 1, paddingHorizontal: 16 },
  profileText: { textAlign: 'right', color: '#123047', marginBottom: 10, fontSize: 16 },
  logoutButton: { marginTop: 20, backgroundColor: '#d93a3a', borderRadius: 12, padding: 14 },
  logoutText: { textAlign: 'center', color: '#fff', fontWeight: '700' },
  nav: { flexDirection: 'row-reverse', justifyContent: 'space-between', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5edf3', paddingHorizontal: 8, paddingVertical: 10 },
  navItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  navItemActive: { backgroundColor: '#eaf4ff' },
  navText: { color: '#58708d', fontWeight: '700' },
  navTextActive: { color: '#123047' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 18, padding: 18 },
  input: { backgroundColor: '#f5f7fa', borderRadius: 12, padding: 12, textAlign: 'right', marginBottom: 10, borderWidth: 1, borderColor: '#e5ebf1' },
  modalActions: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 10 },
  cancelButton: { flex: 1, backgroundColor: '#f0f3f6', padding: 12, borderRadius: 10, marginRight: 8 },
  cancelText: { color: '#123047', textAlign: 'center', fontWeight: '700' },
  submitButton: { flex: 1, backgroundColor: '#123047', padding: 12, borderRadius: 10, marginLeft: 8 },
  submitText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  auth: { flex: 1, backgroundColor: '#123047', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 52, textAlign: 'center', marginBottom: 10 },
  authTitle: { fontSize: 30, color: '#fff', fontWeight: '700', textAlign: 'center' },
  authSubtitle: { color: '#d6e2ec', fontSize: 16, textAlign: 'center', marginBottom: 16 },
  authInput: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, textAlign: 'right' },
  authButton: { backgroundColor: '#1aa7a7', borderRadius: 12, padding: 14 },
  authButtonText: { textAlign: 'center', color: '#fff', fontWeight: '700' },
  planCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#dfeaf2' },
  planCardActive: { borderColor: '#123047', backgroundColor: '#eef6ff' },
  planName: { textAlign: 'right', fontSize: 20, fontWeight: '700', color: '#123047' },
  planPrice: { textAlign: 'right', fontSize: 18, color: '#1aa7a7', marginVertical: 8 },
  planFeature: { textAlign: 'right', color: '#465b72', marginTop: 4 },
  chatContainer: { flex: 1, paddingHorizontal: 12, paddingTop: 12 },
  chatList: { paddingBottom: 8 },
  chatBubble: { maxWidth: '80%', padding: 12, borderRadius: 14, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#123047' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff' },
  chatText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#fff', textAlign: 'right' },
  aiText: { color: '#123047', textAlign: 'right' },
  chatInputRow: { flexDirection: 'row-reverse', alignItems: 'flex-end', paddingVertical: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#edf3f7' },
  chatInput: { flex: 1, minHeight: 48, maxHeight: 120, backgroundColor: '#f5f8fb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, textAlign: 'right', marginRight: 8 },
  sendButton: { backgroundColor: '#123047', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  sendButtonText: { color: '#fff', fontWeight: '700' },
});

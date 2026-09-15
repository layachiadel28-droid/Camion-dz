import { View, Text } from 'react-native';
import MapView from 'react-native-maps';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={{ latitude: 35.6979, longitude: -0.6337, latitudeDelta: 1, longitudeDelta: 1 }} />
      <View style={{ position: 'absolute', top: 40, left: 20, backgroundColor: 'white', padding: 10 }}>
        <Text>Camion-DZ - وهران</Text>
      </View>
    </View>
  );
}

import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Button,
  Platform,
  Alert,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export default function App() {
  const [currentLatitude, setCurrentLatitude] = useState('');
  const [currentLongitude, setCurrentLongitude] = useState('');
  const [watchID, setWatchID] = useState(0);

  const callLocation = () => {
    if (Platform.OS === 'ios') {
      getLocation();
    } else {
      const requestLocationPermission = async () => {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permissão de Acesso à Localização',
            message: 'Este aplicativo precisa acessar sua localização.',
            buttonNeutral: 'Pergunte-me depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getLocation();
        } else {
          Alert.alert('Permissão de Localização negada');
        }
      };
      requestLocationPermission();
    }
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        let currentPositionLatitude = JSON.stringify(position.coords.latitude);
        let currentPositionLongitude = JSON.stringify(
          position.coords.longitude,
        );
        setCurrentLatitude(currentPositionLatitude);
        setCurrentLongitude(currentPositionLongitude);
      },
      error => Alert.alert(error.message),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
      },
    );
    // eslint-disable-next-line no-unused-vars
    const onWatchID = Geolocation.watchPosition(position => {
      let newCurrentLatitude = JSON.stringify(position.coords.latitude);
      let newCurrentLongitude = JSON.stringify(position.coords.longitude);
      setCurrentLatitude(newCurrentLatitude);
      setCurrentLongitude(newCurrentLongitude);
    });
    setWatchID(watchID);
  };

  const clearLocation = () => {
    Geolocation.clearWatch(watchID);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.boldText}>Você está Aqui</Text>
      <Text style={styles.text}>Latitude: {currentLatitude}</Text>
      <Text style={styles.text}>Longitude: {currentLongitude}</Text>
      <View style={styles.button}>
        <Button title="Obter Localização" onPress={callLocation} />
      </View>
      <View style={styles.button}>
        <Button title="Cancelar Monitoração" onPress={clearLocation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    padding: 16,
    backgroundColor: 'white',
  },
  boldText: {
    fontSize: 30,
    color: 'red',
  },
  text: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
});

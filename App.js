import React, {useState, useEffect} from 'react';
import {
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import MapView, {
  Marker,
  MAP_TYPES,
  Polygon,
  Polyline,
  ProviderPropType,
} from 'react-native-maps';
import Geojson, {makeOverlays} from 'react-native-geojson';
const {width, height} = Dimensions.get('window');
import Dot from './assets/dot.png';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from 'react-native-geolocation-service';
// import Geolocation from '@react-native-community/geolocation';

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const initialRegion = {
  latitude: -15.78825,
  longitude: -47.4324,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

let id = 0;

const DrawPolygon = props => {
  const [region, setRegion] = useState(initialRegion);
  const [farmPolygon, setFarmPolygon] = useState(null);
  const [editing, setEditing] = useState(null);
  const [creatingHole, setCreatingHole] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [locations, setLocations] = useState([]);
  let _watchId;

  const requestPermissions = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: 'whenInUse',
      });
    }

    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }
  };

  const getCurrentPosition = () => {
    setRegion(initialRegion);
    setShowUserLocation(true);
  };

  useEffect(() => {
    requestPermissions();
    getCurrentPosition();
    console.log('ComponentDidMount');

    return () => {
      console.log('ComponentWillUnMount');
      if (_watchId !== null) {
        Geolocation.clearWatch(_watchId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    _watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        // const oldCoords = position.coords;
        //PEGAR A CORDENADA ANTERIOR E VERIFICAR SE A MESMA É DIFERENTE DA NOVA ENTAO ATUALIZA O LOCATION
        // if (!position.coords) {
        setLocations([...locations, {latitude, longitude}]);
        console.log(latitude, longitude);
        // }
      },
      error => {
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 10000,
        fastestInterval: 20000,
      },
    );
    // console.log('ComponentDidUpdate');
    // console.log(_watchId); // devolvoe um ID
  }, [locations.latitude, locations.longitude]);

  const onPress = e => {
    // devolucoes { coordinate: LatLng, position: Point }
    // console.log('coordinate', e.nativeEvent.coordinate); //ok
    if (drawing === true) {
      if (!editing) {
        setEditing({
          id: id + 1,
          coordinates: [e.nativeEvent.coordinate],
          holes: [],
        });
      } else if (!creatingHole) {
        setEditing({
          ...editing,
          coordinates: [...editing.coordinates, e.nativeEvent.coordinate],
        });
      } else {
        const holes = [...editing.holes];

        holes[holes.length - 1] = [
          ...holes[holes.length - 1],
          e.nativeEvent.coordinate,
        ];

        setEditing({
          ...editing,
          id: id + 1, // keep incrementing id to trigger display refresh
          coordinates: [...editing.coordinates],
          holes,
        });
      }
    }
  };
  const handleDrawFarm = () => {
    setDrawing(!drawing);
    if (drawing === true) {
      setFarmPolygon({...editing});
      setEditing(null);
    }
  };

  const handleChangeCoordinate = (e, index) => {
    let newCoord = e.nativeEvent.coordinate;
    let newEditing = Object.assign({}, farmPolygon);
    let newCoordinates = Object.assign({}, newEditing.coordinates);
    newCoordinates[index] = newCoord;
    newEditing.coordinates = newCoordinates;
    let transformedCoords = Object.keys(newEditing.coordinates).map(function (
      key,
    ) {
      return newEditing.coordinates[key];
    });
    newEditing.coordinates = transformedCoords;

    setFarmPolygon(newEditing);
  };

  const mapOptions = {
    scrollEnabled: true,
  };

  if (editing) {
    mapOptions.scrollEnabled = false;
    mapOptions.onPanDrag = e => onPress(e);
  }

  return (
    <View style={styles.container}>
      {locations.length > 0 && (
        <MapView
          provider={props.provider}
          style={styles.map}
          mapType={MAP_TYPES.HYBRID}
          showsUserLocation={showUserLocation}
          showsMyLocationButton={true}
          zoomControlEnabled={true}
          loadingEnabled
          // initialRegion={region}
          initialRegion={{
            latitude: locations[0].latitude,
            longitude: locations[0].longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: 0.0421,
          }}
          onPress={e => onPress(e)}
          {...mapOptions}>
          {/* POLIGONO COM MARCADOR EM VOLTA */}
          {/* {editing && (
            <Polygon
              key={editing.coordinates}
              coordinates={editing.coordinates}
              strokeColor="rgba(0,0,255,1.0)"
              fillColor="rgba(220,220,220,0.3)"
              strokeWidth={3}
            />
          )} */}
          {/* {editing &&
            editing.coordinates &&
            editing.coordinates.map((coordinate, index) => (
              <MapView.Marker
                title={'Criando'}
                description={'Descrição'}
                image={Dot}
                key={index}
                coordinate={coordinate}
                anchor={{x: 0.5, y: 0.5}}
              />
            ))} */}
          {/* FAZENDA MAPEADA COM MARCADOR EM VOLTA */}

          {/* {farmPolygon && (
            <Polygon
              key={farmPolygon.id}
              coordinates={farmPolygon.coordinates}
              holes={farmPolygon.holes}
              strokeColor="#00F"
              fillColor="rgba(255,255,255,0.0)"
              strokeWidth={3}
            />
          )} */}

          {locations.map((location, index) => (
            <Marker
              image={Dot}
              key={`location-${index}`}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
            />
          ))}
        </MapView>
      )}

      {/* BOTAO PARA CRUD */}
      <View style={styles.buttonContainer}>
        {{editing} && (
          <TouchableOpacity
            onPress={() => handleDrawFarm()}
            style={[styles.bubble, styles.button]}>
            <Text>{drawing === false ? 'Mapear Fazendas ' : 'Finalizar'}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            height: 50,
            width: 50,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
            console.log(`LOCATIONS ${locations}`);
          }}>
          <Icon name="map-marker-plus-outline" style={{fontSize: 32}} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },
  latlng: {
    width: 200,
    alignItems: 'stretch',
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
});

DrawPolygon.propTypes = {
  provider: ProviderPropType,
};

export default DrawPolygon;

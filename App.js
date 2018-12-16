import React from 'react';
import { Alert, AsyncStorage, Button, StyleSheet, TextInput, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

import { calculateLatitudeDelta, calculateLongitudeDelta } from './helpers/coordinates';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      region: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
      },
      markers: [],
      coordinate: {
        latitude: 0,
        longitude: 0,
      }
    };

    this.setCurrentPosition = this.setCurrentPosition.bind(this);
    this.setMarkersFromStorage = this.setMarkersFromStorage.bind(this);
    this.saveMarkerToStorage= this.saveMarkerToStorage.bind(this);
    this.onLatitudeChange = this.onLatitudeChange.bind(this);
    this.onLongitudeChange = this.onLongitudeChange.bind(this);
    this.onAddPress = this.onAddPress.bind(this);
  }

  async componentDidMount() {
    this.setCurrentPosition();
    this.setMarkersFromStorage();
  }

  async setCurrentPosition() {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { accuracy, latitude, longitude } }) => this.setState({
        region: {
          latitude,
          longitude,
          latitudeDelta: calculateLatitudeDelta(latitude, accuracy),
          longitudeDelta: calculateLongitudeDelta(accuracy),
        },
        coordinate: {
          latitude,
          longitude,
        }
      }),
      () => Alert.alert('Error', 'Failed to get current location.'),
    );
  }

  async setMarkersFromStorage() {
    const markers = [];

    try {
      const value = await AsyncStorage.getItem(markersKey);

      if (value !== null) {
        markers.push(...JSON.parse(value));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to storage.');
    }

    this.setState({ markers });
  }

  async saveMarkerToStorage(marker) {
    const markers = [marker, ...this.state.markers];

    try {
      await AsyncStorage.setItem(markersKey, JSON.stringify(markers));
    } catch (error) {
      Alert.alert('Error', 'Failed to save markers.')
    }
  }

  async onLatitudeChange(latitude) {
    const isNumber = !isNaN(parseFloat(latitude));

    if (isNumber) {
      this.setState(({ coordinate }) => ({
        coordinate: {
          ...coordinate,
          latitude: parseFloat(latitude),
        }
      }));
    }
  }

  async onLongitudeChange(longitude) {
    const isNumber = !isNaN(parseFloat(longitude));

    if (isNumber) {
      this.setState(({ coordinate }) => ({
        coordinate: {
          ...coordinate,
          longitude: parseFloat(longitude),
        }
      }));
    }
  }

  async onAddPress() {
    const { coordinate: { latitude, longitude } } = this.state;
    const marker = {
      coordinates: { latitude, longitude, },
    };

    await this.saveMarkerToStorage(marker);

    this.setState(prevState => ({
      region: {
        latitude,
        longitude,
        latitudeDelta: calculateLatitudeDelta(latitude),
        longitudeDelta: calculateLongitudeDelta(),
      },
      markers: [marker, ...prevState.markers],
    }));
  }

  render() {
    const { coordinate: { latitude, longitude } } = this.state;
    const markers = this.state.markers.map((marker, index) => (
      <Marker
        key={index}
        coordinate={marker.coordinates}
      />
    ));

    return (
      <View style={styles.container}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={this.state.region}
          >
            {markers}
          </MapView>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.controlsContainer}>
            <View style={styles.controlContainer}>
              <TextInput
                style={styles.input}
                placeholder="Latitude"
                value={`${latitude}`}
                onChangeText={this.onLatitudeChange}
              />
            </View>
            <View style={styles.controlContainer}>
              <TextInput
                style={styles.input}
                placeholder="Longitude"
                value={`${longitude}`}
                onChangeText={this.onLongitudeChange}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="Add"
                color="#000"
                onPress={this.onAddPress}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  formContainer: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
  },
  controlsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 30,
  },
  controlContainer: {
    flexBasis: '30%',
    height: 40,
  },
  input: {
    flex: 1,
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ddd',
  },
  buttonContainer: {
    flexBasis: '30%',
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ddd',
  },
});

const markersKey = 'MARKERS';
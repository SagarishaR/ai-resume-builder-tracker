import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Alert } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import { PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding'; // for reverse geocoding

const TrackerScreen = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("Applied"); // default status
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(""); // string input for date
  const [location, setLocation] = useState(null); // store selected location
  const [address, setAddress] = useState(""); // store address
  const [jobs, setJobs] = useState([]);
  const [region, setRegion] = useState({
    latitude: 37.78825, 
    longitude: -122.4324, 
    latitudeDelta: 0.0922, 
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    // Initialize Geocoder with your API key (get it from https://developers.google.com/maps/documentation/geocoding/get-api-key)
    Geocoder.init(process.env.REACT_APP_GOOGLE_MAPS_API_KEY); 
  }, []);

  // Request permission to access location (for Android)
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "We need access to your location to show nearby interview locations",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Location permission granted");
        getCurrentLocation();
      } else {
        Alert.alert("Permission Denied", "Location permission is required to use the map.");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Get current location (if needed)
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      (error) => {
        console.warn(error);
        Alert.alert("Error", "Unable to fetch location.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Handle location update after drag
  const handleMarkerDragEnd = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    console.log("Dragged Location:", latitude, longitude);  // Debugging
    setLocation({ latitude, longitude });
    
    // Reverse geocoding to get address from lat/long
    Geocoder.from(latitude, longitude)
      .then(json => {
        console.log("Geocoder Response:", json); // Debugging the full response
        const addressComponent = json.results[0]?.formatted_address;
        if (addressComponent) {
          console.log("Address: ", addressComponent);  // Debugging
          setAddress(addressComponent);
        } else {
          Alert.alert("No Address Found", "We couldn't retrieve an address for this location.");
          setAddress("Address not available");
        }
      })
      .catch(error => {
        console.warn("Geocoding Error: ", error);
        Alert.alert("Geocoding Error", "There was an issue fetching the address.");
        setAddress("Address not available");
      });
  };

  // Add new job application
  const handleAddJob = () => {
    console.log("Job Title:", jobTitle);
    console.log("Company:", company);
    console.log("Location:", location);
  
    if (!jobTitle || !company || !location) {
      Alert.alert("Missing Fields", "Job title, company, and location are required.");
      return;
    }

    const newJob = {
      id: Date.now().toString(),
      jobTitle,
      company,
      status,
      notes,
      date: date || "Not specified",
      location: address, // Store the address
    };

    setJobs([newJob, ...jobs]);
    setJobTitle("");
    setCompany("");
    setStatus("Applied");
    setNotes("");
    setDate("");
    setLocation(null); // Clear location after adding
    setAddress(""); // Clear address after adding
  };

  // Handle map press to set location
  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    console.log("Selected Location:", latitude, longitude);  // Debugging
    setLocation({ latitude, longitude });

    // Reverse geocoding to get address from lat/long
    Geocoder.from(latitude, longitude)
      .then(json => {
        console.log("Geocoder Response:", json); // Debugging the full response
        const addressComponent = json.results[0]?.formatted_address;
        if (addressComponent) {
          console.log("Address: ", addressComponent);  // Debugging
          setAddress(addressComponent);
        } else {
          Alert.alert("No Address Found", "We couldn't retrieve an address for this location.");
          setAddress("Address not available");
        }
      })
      .catch(error => {
        console.warn("Geocoding Error: ", error);
        Alert.alert("Geocoding Error", "There was an issue fetching the address.");
        setAddress("Address not available");
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Job Application Tracker</Text>

      <TextInput
        style={styles.input}
        placeholder="Job Title"
        value={jobTitle}
        onChangeText={setJobTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Company Name"
        value={company}
        onChangeText={setCompany}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Date (optional)"
        value={date}
        onChangeText={setDate}
      />

      {/* Status TextInput (instead of Picker) */}
      <TextInput
        style={styles.input}
        placeholder="Enter Status (e.g., Applied, Interview, Offer)"
        value={status}
        onChangeText={setStatus}
      />

      <TextInput
        style={[styles.input, { height: 60 }]}
        placeholder="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      {/* Map Component for Location Selection */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={handleMapPress}
        >
          {location && (
            <Marker
              coordinate={location}
              draggable
              onDragEnd={handleMarkerDragEnd}
            />
          )}
        </MapView>
      </View>

      <Text>Address: {address}</Text>

      <TouchableOpacity style={styles.button} onPress={handleAddJob}>
        <Text style={styles.buttonText}>➕ Add Job</Text>
      </TouchableOpacity>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.jobCard}>
            <Text style={styles.jobTitle}>{item.jobTitle}</Text>
            <Text>{item.company}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Location: {item.location || "Not specified"}</Text>
            {item.notes ? <Text>📝 {item.notes}</Text> : null}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 6,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#9370DB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  mapContainer: {
    width: '100%',
    height: 300,
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  jobCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  jobTitle: { fontWeight: "bold", fontSize: 16 },
});

export default TrackerScreen;

import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Card, Button } from "react-native-paper";

const templates = [
  {
    id: 1,
    title: "Modern Templates",
    description: "Choose from a variety of stylish and professional resume templates.",
    image: require("../assets/sample.jpeg"),
    navigateTo: "ResumeSlides", // Specify where to navigate
  },
  {
    id: 2,
    title: "Tracker",
    description: "Monitor your job applications and stay updated on your progress.",
    image: require("../assets/track.jpg"),
    navigateTo: "TrackerScreen",
  },
  {
    id: 3,
    title: "ATS Score Checker",
    description: "Find Your ATS Score within a minute",
    image: require("../assets/ats.webp"),
    navigateTo: "ATSScoreChecker",
  },
];

const TemplateCards = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {templates.map((template) => (
        <Card key={template.id} style={styles.card}>
          <Card.Cover 
            source={template.image} 
            style={styles.image} 
            resizeMode="cover" 
          />
          <Card.Content>
            <Text style={styles.title}>{template.title}</Text>
            <Text style={styles.description}>{template.description}</Text>
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="contained" 
              onPress={() => {
                if (template.navigateTo && navigation) {
                  navigation.navigate(template.navigateTo);
                } else {
                  console.log(`${template.title} Clicked!`);
                }
              }} 
              style={styles.button}
            >
              Explore Now
            </Button>
          </Card.Actions>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4, 
    backgroundColor: "#fff",
  },
  image: { 
    width: "100%", 
    height: 180, 
    borderTopLeftRadius: 12, 
    borderTopRightRadius: 12,
  },
  title: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  description: { fontSize: 14, color: "#666", marginVertical: 5 },
  button: { marginTop: 10, backgroundColor: "#9370DB" },
});

export default TemplateCards;

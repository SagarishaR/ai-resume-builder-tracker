import React from "react";
import { View, Text, StyleSheet, TouchableOpacity,ScrollView } from "react-native";
import { Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const ResumeSlides = () => {
  const navigation = useNavigation();

  // Array of cards
  const resumeTemplates = [
    { id: 1, title: "Classic ", image: require("../assets/classic.png"), route: "MinimalScreen" },
    { id: 2, title: "Ivy League ", image: require("../assets/Ivy.png"), route: "Ivy_League" },
    { id: 3, title: "TimeLine", image: require("../assets/timeline.png"), route: "Timeline" },
    { id: 4, title: "Freshers", image: require("../assets/freshers_resume.jpg"), route: "freshers" },
    { id: 5, title: "Elegant", image: require("../assets/enhance.png"), route: "elegant" },
    { id: 6, title: "Compact", image: require("../assets/compact.png"), route: "compact" },
    { id: 6, title: "High", image: require("../assets/high.webp"), route: "high" }


  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {resumeTemplates.map((template) => (
        <TouchableOpacity key={template.id} onPress={() => navigation.navigate(template.route)}>
          <Card style={styles.card}>
            <Card.Cover source={template.image} style={styles.image} resizeMode="contain" />
            <Card.Content>
              <Text style={styles.cardTitle}>{template.title}</Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 20 },
  card: { width: 300, borderRadius: 12, elevation: 4, backgroundColor: "#fff", overflow: "hidden", marginBottom: 20 },
  image: { width: "100%", height: 200, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginTop: 10, textAlign: "center" },
});
export default ResumeSlides;

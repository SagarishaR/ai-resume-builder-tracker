import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { getResumesByUser, saveResume } from "./database"; // Adjust the path as needed
import Print from "react-native-print";

const PrintScreen = ({ route }) => {
  const [resumes, setResumes] = useState([]);
  const userId = route?.params?.user?.id || 1; // Assuming user data is passed via route, default to 1 for testing

  useEffect(() => {
    const fetchResumes = async () => {
      const result = await getResumesByUser(userId);
      if (result.success) {
        setResumes(result.resumes);
      } else {
        console.log(result.message);
      }
    };
    fetchResumes();
  }, [userId]);

  const handlePrint = async (resumeContent) => {
    try {
      const htmlContent = `
        <html>
          <body>
            <h1>Resume</h1>
            <p>${resumeContent}</p>
          </body>
        </html>
      `;
      await Print.print({ html: htmlContent });
    } catch (error) {
      console.error("❌ Print error:", error);
      Alert.alert("Print Error", "Failed to print the resume.");
    }
  };

  const handleDownloadSample = async () => {
    const sampleResume = "Sample resume content for user ID: " + userId;
    const result = await saveResume(userId, sampleResume);
    if (result.success) {
      Alert.alert("Success", "Sample resume downloaded!");
      const updatedResumes = await getResumesByUser(userId);
      if (updatedResumes.success) {
        setResumes(updatedResumes.resumes);
      }
    } else {
      Alert.alert("Error", result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>My Resumes</Text>
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadSample}>
          <Text style={styles.buttonText}>Download Sample Resume</Text>
        </TouchableOpacity>
        {resumes.length > 0 ? (
          resumes.map((resume) => (
            <View key={resume.id} style={styles.resumeItem}>
              <Text>Resume ID: {resume.id}</Text>
              <Text>Content: {resume.resume_content}</Text>
              <Text>Downloaded: {resume.download_date}</Text>
              <TouchableOpacity
                style={styles.printButton}
                onPress={() => handlePrint(resume.resume_content)}
              >
                <Text style={styles.buttonText}>Print</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text>No resumes downloaded or created yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10, color: "#333" },
  resumeItem: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    elevation: 2,
  },
  downloadButton: {
    backgroundColor: "#ff6200",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  printButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default PrintScreen;

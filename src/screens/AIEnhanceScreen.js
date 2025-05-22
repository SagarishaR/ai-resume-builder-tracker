import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import WebView from "react-native-webview";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import axios from "axios";

const AIEnhanceScreen = ({ route }) => {
  const { formData } = route.params || {};
  const [enhancedResume, setEnhancedResume] = useState("");
  const [loading, setLoading] = useState(true);

  // Call AI API to enhance resume
  useEffect(() => {
    const fetchEnhancedResume = async () => {
      try {
        const response = await axios.post("http://YOUR_SERVER_IP:5001/enhance-resume", formData);
        setEnhancedResume(response.data.enhancedResume);
      } catch (error) {
        Alert.alert("Error", "Failed to enhance resume");
      } finally {
        setLoading(false);
      }
    };
    fetchEnhancedResume();
  }, []);

  // HTML content for WebView
  const resumeHTML = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #007bff; }
          .container { max-width: 600px; margin: auto; padding: 20px; }
          .section { margin-bottom: 15px; }
          .section h2 { font-size: 18px; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${formData.fullName}</h1>
          <p>Email: ${formData.email}</p>
          <p>Phone: ${formData.phone}</p>
          <div class="section">
            <h2>Enhanced Resume</h2>
            <p>${enhancedResume.replace(/\n/g, "<br>")}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Generate & Download PDF
  const generatePDF = async () => {
    try {
      const options = {
        html: resumeHTML,
        fileName: "AI_Enhanced_Resume",
        directory: "Documents",
      };
      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert("Success", `Resume saved at: ${file.filePath}`);
    } catch (error) {
      Alert.alert("Error", "Failed to generate PDF");
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <WebView source={{ html: resumeHTML }} style={{ flex: 1 }} />
      )}
      <Button mode="contained" onPress={generatePDF} style={styles.button}>
        Download PDF
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  button: { margin: 10, backgroundColor: "#007bff" },
});

export default AIEnhanceScreen;

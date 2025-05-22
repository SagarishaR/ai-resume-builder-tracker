import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { pick, types } from '@react-native-documents/picker';
import axios from 'axios';

const ATSScoreChecker = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [atsScore, setAtsScore] = useState(null);

  const pickResume = async () => {
    try {
      console.log('Opening file picker...');
      const [result] = await pick({
        type: [types.pdf],
      });
      console.log('Picked file:', result);

      const formData = new FormData();
      formData.append('pdf', {
        uri: result.uri,
        type: 'application/pdf',
        name: result.name || 'resume.pdf',
      });
      console.log('FormData prepared:', formData);

      console.log('Sending request to server...');
      const response = await axios.post('http://10.0.2.2:5001/extract-pdf-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Server response:', response.data);

      setResumeText(response.data.text);
      console.log('Resume text set:', response.data.text);
      Alert.alert('Success', 'Resume uploaded and text extracted!');
    } catch (err) {
      if (err.code === 'CANCELLED') {
        console.log('User canceled file picker');
      } else {
        console.error('Upload error:', err.message, err.response?.data, err.response?.status);
        Alert.alert('Error', `Failed to upload resume: ${err.message}${err.response?.data ? ' - ' + JSON.stringify(err.response.data) : ''}`);
      }
    }
  };

  const calculateAtsScore = () => {
    console.log('Calculating ATS score, resumeText:', resumeText);
    if (!resumeText) {
      Alert.alert('Error', 'Please upload a resume');
      return;
    }
    if (!jobDescription) {
      Alert.alert('Error', 'Please enter a job description');
      return;
    }
    const jdWords = jobDescription.toLowerCase().split(/\W+/);
    const resumeWords = resumeText.toLowerCase().split(/\W+/);
    const matches = jdWords.filter((word) => resumeWords.includes(word)).length;
    const score = Math.min((matches / jdWords.length) * 100, 100).toFixed(2);
    setAtsScore(score);
    console.log('ATS score calculated:', score);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickResume}>
        <Text style={styles.buttonText}>Upload Resume (PDF)</Text>
      </TouchableOpacity>
      {resumeText ? <Text style={styles.uploadedText}>Resume Uploaded</Text> : null}

      <TextInput
        style={styles.jdInput}
        value={jobDescription}
        onChangeText={setJobDescription}
        placeholder="Paste Job Description Here"
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={calculateAtsScore}>
        <Text style={styles.buttonText}>Calculate ATS Score</Text>
      </TouchableOpacity>

      {atsScore && <Text style={styles.atsScore}>ATS Score: {atsScore}%</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  button: { backgroundColor: '#9370DB', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  jdInput: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginVertical: 20, height: 150, backgroundColor: '#fff' },
  atsScore: { fontSize: 18, color: '#9370DB', textAlign: 'center', marginTop: 20 },
  uploadedText: { fontSize: 14, color: '#666', textAlign: 'center', marginVertical: 10 },
});

export default ATSScoreChecker;
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, Alert, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';

const freshers = () => {
  const [resumeData, setResumeData] = useState({
    profilePic: null,
    name: '',
    about: '',
    phone: '',
    email: '',
    linkedin: '',
    skills: [''],
    education: [{ year: '', institution: '', description: '' }],
    projects: [{ title: '', description: '' }],
  });
  const [jobDescription, setJobDescription] = useState('');
  const [atsScore, setAtsScore] = useState(null);

  const handleChange = (field, value) => {
    setResumeData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillChange = (index, value) => {
    const updatedSkills = [...resumeData.skills];
    updatedSkills[index] = value;
    setResumeData((prev) => ({ ...prev, skills: updatedSkills }));
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...resumeData.education];
    updatedEducation[index][field] = value;
    setResumeData((prev) => ({ ...prev, education: updatedEducation }));
  };

  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...resumeData.projects];
    updatedProjects[index][field] = value;
    setResumeData((prev) => ({ ...prev, projects: updatedProjects }));
  };

  const addSkill = () => {
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, ''],
    }));
  };

  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, { year: '', institution: '', description: '' }],
    }));
  };

  const addProject = () => {
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, { title: '', description: '' }],
    }));
  };

  const pickProfilePic = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        Alert.alert('Error', 'Image picker error: ' + response.error);
        console.log('Image picker error:', response.error);
      } else {
        const uri = response.uri || response.assets?.[0]?.uri;
        if (uri) {
          setResumeData((prev) => ({ ...prev, profilePic: uri }));
        } else {
          Alert.alert('Error', 'Failed to load image');
        }
      }
    });
  };

  const calculateAtsScore = () => {
    if (!jobDescription) {
      Alert.alert('Error', 'Please enter a job description');
      return;
    }
    const jdWords = jobDescription.toLowerCase().split(/\W+/);
    const resumeText = `${resumeData.name} ${resumeData.about} ${resumeData.phone} ${resumeData.email} ${resumeData.linkedin} ${
      resumeData.skills.join(' ')
    } ${resumeData.education.map((edu) => `${edu.year} ${edu.institution} ${edu.description}`).join(' ')} ${
      resumeData.projects.map((proj) => `${proj.title} ${proj.description}`).join(' ')
    }`.toLowerCase();
    const resumeWords = resumeText.split(/\W+/);
    
    const matches = jdWords.filter((word) => resumeWords.includes(word)).length;
    const score = Math.min((matches / jdWords.length) * 100, 100).toFixed(2);
    setAtsScore(score);
  };

  const enhanceWithAI = async () => {
    try {
      const response = await axios.post('http://10.0.2.2:5001/enhance-resume', {
        resume: resumeData,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const enhancedData = response.data;
      if (response.status >= 200 && response.status < 300) {
        if (enhancedData.resume.error) {
          Alert.alert('Warning', 'Resume enhanced, but not in expected format. Raw output: ' + enhancedData.resume.raw);
          console.log('Raw enhanced resume:', enhancedData.resume.raw);
        } else {
          setResumeData(enhancedData.resume);
          Alert.alert('Success', 'Resume enhanced successfully!');
        }
      } else {
        Alert.alert('Error', enhancedData.details || enhancedData.error || 'Failed to enhance resume');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error while enhancing resume');
      console.error(error);
    }
  };

  const downloadPDF = async () => {
    try {
      let profilePicBase64 = '';
      if (resumeData.profilePic) {
        profilePicBase64 = await RNFS.readFile(resumeData.profilePic, 'base64');
      }

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .header { background-color: #4a4a4a; color: #fff; display: flex; align-items: center; padding: 20px; margin-bottom: 20px; }
              .profile-container { width: 100px; height: 100px; border-radius: 50%; overflow: hidden; background-color: #ccc; margin-right: 20px; }
              .profile-pic { width: 100px; height: 100px; object-fit: cover; }
              .name { font-size: 24px; font-weight: bold; }
              .left-column { width: 45%; background-color: #f5f5f5; padding: 20px; }
              .right-column { width: 45%; background-color: #fff; padding: 20px; }
              .section { margin-bottom: 20px; }
              .section-title { font-size: 18px; font-weight: bold; color: #000; margin-bottom: 10px; border-bottom: 2px solid #000; }
              .text { font-size: 14px; color: #000; margin-bottom: 5px; }
              .contact-icon { color: #000; margin-right: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="profile-container">
                ${profilePicBase64 ? `<img src="data:image/jpeg;base64,${profilePicBase64}" class="profile-pic" />` : ''}
              </div>
              <div class="name">${resumeData.name || 'Your Name'}</div>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <div class="left-column">
                <div class="section">
                  <div class="section-title">ABOUT ME</div>
                  <p class="text">${resumeData.about}</p>
                </div>
                <div class="section">
                  <div class="section-title">CONTACT</div>
                  <p class="text"><span class="contact-icon">📞</span> ${resumeData.phone}</p>
                  <p class="text"><span class="contact-icon">📧</span> ${resumeData.email}</p>
                  <p class="text"><span class="contact-icon">🌐</span> ${resumeData.linkedin}</p>
                </div>
                <div class="section">
                  <div class="section-title">SKILLS</div>
                  ${resumeData.skills.filter(skill => skill).map(skill => `<p class="text">• ${skill}</p>`).join('')}
                </div>
              </div>
              <div class="right-column">
                <div class="section">
                  <div class="section-title">EDUCATION</div>
                  ${resumeData.education.map(edu => `
                    <p class="text">${edu.year}</p>
                    <p class="text">${edu.institution}</p>
                    <p class="text">${edu.description}</p>
                  `).join('')}
                </div>
                <div class="section">
                  <div class="section-title">PROJECTS</div>
                  ${resumeData.projects.map(proj => `
                    <p class="text">${proj.title}</p>
                    <p class="text">${proj.description}</p>
                  `).join('')}
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: 'Freshers_Resume',
        directory: 'Download',
      };
      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert('Success', `PDF saved to ${file.filePath}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickProfilePic}>
          {resumeData.profilePic ? (
            <Image source={{ uri: resumeData.profilePic }} style={styles.profilePic} />
          ) : (
            <View style={styles.profilePicPlaceholder}><Text>No Image</Text></View>
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.nameInput}
          value={resumeData.name}
          onChangeText={(text) => handleChange('name', text)}
          placeholder="Your Name"
          placeholderTextColor="#fff"
        />
      </View>
      <View style={styles.content}>
        <View style={styles.leftColumn}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ABOUT ME</Text>
            <TextInput
              style={styles.textInput}
              value={resumeData.about}
              onChangeText={(text) => handleChange('about', text)}
              multiline
              placeholder="Write a brief about yourself..."
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONTACT</Text>
            <TextInput
              style={styles.textInput}
              value={resumeData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              placeholder="Phone: e.g., +123-456-7890"
            />
            <TextInput
              style={styles.textInput}
              value={resumeData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="Email: e.g., hello@yourdomain.com"
            />
            <TextInput
              style={styles.textInput}
              value={resumeData.linkedin}
              onChangeText={(text) => handleChange('linkedin', text)}
              placeholder="LinkedIn: e.g., linkedin.com/in/yourprofile"
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SKILLS</Text>
            {resumeData.skills.map((skill, index) => (
              <TextInput
                key={index}
                style={styles.textInput}
                value={skill}
                onChangeText={(text) => handleSkillChange(index, text)}
                placeholder={`Skill ${index + 1}`}
              />
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addSkill}>
              <Text style={styles.addButtonText}>Add More</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.rightColumn}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            {resumeData.education.map((edu, index) => (
              <View key={index}>
                <TextInput
                  style={styles.textInput}
                  value={edu.year}
                  onChangeText={(text) => handleEducationChange(index, 'year', text)}
                  placeholder="Year (e.g., 2009 - 2014)"
                />
                <TextInput
                  style={styles.textInput}
                  value={edu.institution}
                  onChangeText={(text) => handleEducationChange(index, 'institution', text)}
                  placeholder="Institution"
                />
                <TextInput
                  style={styles.textInput}
                  value={edu.description}
                  onChangeText={(text) => handleEducationChange(index, 'description', text)}
                  placeholder="Description"
                  multiline
                />
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addEducation}>
              <Text style={styles.addButtonText}>Add More</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROJECTS</Text>
            {resumeData.projects.map((project, index) => (
              <View key={index}>
                <TextInput
                  style={styles.textInput}
                  value={project.title}
                  onChangeText={(text) => handleProjectChange(index, 'title', text)}
                  placeholder="Project Title"
                />
                <TextInput
                  style={styles.textInput}
                  value={project.description}
                  onChangeText={(text) => handleProjectChange(index, 'description', text)}
                  multiline
                  placeholder="Description"
                />
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addProject}>
              <Text style={styles.addButtonText}>Add More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <TextInput
        style={styles.jdInput}
        value={jobDescription}
        onChangeText={setJobDescription}
        placeholder="Paste Job Description Here"
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={calculateAtsScore}>
        <Text style={styles.buttonText}>Check ATS Score</Text>
      </TouchableOpacity>
      {atsScore && <Text style={styles.atsScore}>ATS Score: ${atsScore}%</Text>}
      <TouchableOpacity style={styles.button} onPress={downloadPDF}>
        <Text style={styles.buttonText}>Download PDF</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={enhanceWithAI}>
        <Text style={styles.buttonText}>Enhance with AI</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  header: { backgroundColor: '#4a4a4a', padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  profilePic: { width: 100, height: 100, borderRadius: 50 },
  profilePicPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  nameInput: { fontSize: 24, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'right', backgroundColor: 'transparent' },
  content: { flexDirection: 'row', justifyContent: 'space-between' },
  leftColumn: { width: '45%', backgroundColor: '#f5f5f5', padding: 20 },
  rightColumn: { width: '45%', backgroundColor: '#fff', padding: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 10, borderBottomWidth: 2, borderBottomColor: '#000' },
  textInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 10, marginBottom: 10, fontSize: 14 },
  addButton: { backgroundColor: '#000', padding: 10, borderRadius: 4, alignItems: 'center', marginTop: 10 },
  addButtonText: { color: '#fff', fontSize: 14 },
  jdInput: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, marginVertical: 20, height: 150 },
  button: { backgroundColor: '#000', padding: 15, borderRadius: 4, alignItems: 'center', marginVertical: 10 },
  buttonText: { color: '#fff', fontSize: 16 },
  atsScore: { fontSize: 18, color: '#000', textAlign: 'center', marginVertical: 10 },
});

export default freshers;
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { pick, types } from '@react-native-documents/picker';
import axios from 'axios';

const MinimalScreen = () => {
  const [resumeData, setResumeData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    summary: '',
    experience: [{ title: '', company: '', duration: '', description: '' }],
    languages: [{ name: '', proficiency: 0 }],
    educations: [{ institute: '', degree: '', date: '' }],
    skills: [''],
    certifications: [''],
    profilePic: null,
  });
  const [jobDescription, setJobDescription] = useState('');
  const [atsScore, setAtsScore] = useState(null);

  const handleChange = (field, value) => {
    setResumeData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...resumeData.experience];
    updatedExperience[index][field] = value;
    setResumeData((prev) => ({ ...prev, experience: updatedExperience }));
  };

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', duration: '', description: '' }],
    }));
  };

  const handleLanguageChange = (index, field, value) => {
    const updatedLanguages = [...resumeData.languages];
    updatedLanguages[index][field] = value;
    setResumeData((prev) => ({ ...prev, languages: updatedLanguages }));
  };

  const handleProficiencyChange = (index, stars) => {
    const updatedLanguages = [...resumeData.languages];
    updatedLanguages[index].proficiency = stars;
    setResumeData((prev) => ({ ...prev, languages: updatedLanguages }));
  };

  const addLanguage = () => {
    setResumeData((prev) => ({
      ...prev,
      languages: [...prev.languages, { name: '', proficiency: 0 }],
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducations = [...resumeData.educations];
    updatedEducations[index][field] = value;
    setResumeData((prev) => ({ ...prev, educations: updatedEducations }));
  };

  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      educations: [...prev.educations, { institute: '', degree: '', date: '' }],
    }));
  };

  const handleSkillChange = (index, value) => {
    const updatedSkills = [...resumeData.skills];
    updatedSkills[index] = value;
    setResumeData((prev) => ({ ...prev, skills: updatedSkills }));
  };

  const addSkill = () => {
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, ''],
    }));
  };

  const handleCertificationChange = (index, value) => {
    const updatedCertifications = [...resumeData.certifications];
    updatedCertifications[index] = value;
    setResumeData((prev) => ({ ...prev, certifications: updatedCertifications }));
  };

  const addCertification = () => {
    setResumeData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, ''],
    }));
  };

  const pickProfilePic = async () => {
    try {
      const [result] = await pick({
        type: [types.images],
      });
      setResumeData((prev) => ({ ...prev, profilePic: result.uri }));
    } catch (err) {
      if (err.code === 'CANCELLED') {
        // User canceled
      } else {
        Alert.alert('Error', 'Failed to pick image');
        console.error(err);
      }
    }
  };

  const calculateAtsScore = () => {
    if (!jobDescription) {
      Alert.alert('Error', 'Please enter a job description');
      return;
    }
    const jdWords = jobDescription.toLowerCase().split(/\W+/);
    const resumeText = `${resumeData.name} ${resumeData.email} ${resumeData.phone} ${resumeData.linkedin} ${resumeData.summary} ${
      resumeData.experience.map((exp) => `${exp.title} ${exp.company} ${exp.duration} ${exp.description}`).join(' ')
    } ${resumeData.languages.map((lang) => lang.name).join(' ')} ${
      resumeData.educations.map((edu) => `${edu.institute} ${edu.degree} ${edu.date}`).join(' ')
    } ${resumeData.skills.join(' ')} ${resumeData.certifications.join(' ')}`.toLowerCase();
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
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { background-color: #4682b4; padding: 15px; color: white; display: flex; align-items: center; }
              .profile-container { width: 80px; height: 80px; min-width: 80px; min-height: 80px; border-radius: 50%; overflow: hidden; background-color: #ccc; }
              .profile-pic { width: 80px; height: 80px; object-fit: cover; }
              .name-container { margin-left: 15px; }
              .name { font-size: 24px; font-weight: bold; }
              .contact { margin-top: 5px; font-size: 12px; }
              .section { margin: 20px 0; }
              .section-title { font-size: 18px; color: #4682b4; }
              .experience-item { margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="profile-container">
                ${profilePicBase64 ? `<img src="data:image/jpeg;base64,${profilePicBase64}" class="profile-pic" />` : ''}
              </div>
              <div class="name-container">
                <div class="name">${resumeData.name || 'No Name Provided'}</div>
                <div class="contact">Email: ${resumeData.email} | Phone: ${resumeData.phone} | LinkedIn: ${resumeData.linkedin}</div>
              </div>
            </div>
            <div class="section">
              <div class="section-title">Summary</div>
              <p>${resumeData.summary}</p>
            </div>
            <div class="section">
              <div class="section-title">Experience</div>
              ${resumeData.experience.map(exp => `
                <div class="experience-item">
                  <strong>${exp.title} at ${exp.company}</strong><br>
                  <em>${exp.duration}</em><br>
                  <p>${exp.description}</p>
                </div>
              `).join('')}
            </div>
            <div class="section">
              <div class="section-title">Education</div>
              ${resumeData.educations.map(edu => `
                <div class="experience-item">
                  <strong>${edu.degree}</strong><br>
                  <em>${edu.institute}, ${edu.date}</em>
                </div>
              `).join('')}
            </div>
            <div class="section">
              <div class="section-title">Skills</div>
              <p>${resumeData.skills.join(', ')}</p>
            </div>
            <div class="section">
              <div class="section-title">Certifications</div>
              <p>${resumeData.certifications.join(', ')}</p>
            </div>
            <div class="section">
              <div class="section-title">Languages</div>
              ${resumeData.languages.map(lang => `
                <p>${lang.name}: ${'★'.repeat(lang.proficiency)}${'☆'.repeat(5 - lang.proficiency)}</p>
              `).join('')}
            </div>
          </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: 'minimal-resume',
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
        />
      </View>
      <View style={styles.contact}>
        <TextInput
          style={styles.input}
          value={resumeData.email}
          onChangeText={(text) => handleChange('email', text)}
          placeholder="Email"
        />
        <TextInput
          style={styles.input}
          value={resumeData.phone}
          onChangeText={(text) => handleChange('phone', text)}
          placeholder="Phone"
        />
        <TextInput
          style={styles.input}
          value={resumeData.linkedin}
          onChangeText={(text) => handleChange('linkedin', text)}
          placeholder="LinkedIn URL"
        />
      </View>
      <TextInput
        style={styles.summaryInput}
        value={resumeData.summary}
        onChangeText={(text) => handleChange('summary', text)}
        placeholder="Professional Summary"
        multiline
      />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        {resumeData.experience.map((exp, index) => (
          <View key={index} style={styles.entry}>
            <TextInput
              style={styles.input}
              value={exp.title}
              onChangeText={(text) => handleExperienceChange(index, 'title', text)}
              placeholder="Job Title"
            />
            <TextInput
              style={styles.input}
              value={exp.company}
              onChangeText={(text) => handleExperienceChange(index, 'company', text)}
              placeholder="Company"
            />
            <TextInput
              style={styles.input}
              value={exp.duration}
              onChangeText={(text) => handleExperienceChange(index, 'duration', text)}
              placeholder="Duration"
            />
            <TextInput
              style={styles.textArea}
              value={exp.description}
              onChangeText={(text) => handleExperienceChange(index, 'description', text)}
              placeholder="Description"
              multiline
            />
          </View>
        ))}
        <TouchableOpacity style={styles.button} onPress={addExperience}>
          <Text style={styles.buttonText}>Add Experience</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {resumeData.educations.map((edu, index) => (
          <View key={index} style={styles.entry}>
            <TextInput
              style={styles.input}
              value={edu.institute}
              onChangeText={(text) => handleEducationChange(index, 'institute', text)}
              placeholder="Institute"
            />
            <TextInput
              style={styles.input}
              value={edu.degree}
              onChangeText={(text) => handleEducationChange(index, 'degree', text)}
              placeholder="Degree"
            />
            <TextInput
              style={styles.input}
              value={edu.date}
              onChangeText={(text) => handleEducationChange(index, 'date', text)}
              placeholder="Date (e.g., May 2020)"
            />
          </View>
        ))}
        <TouchableOpacity style={styles.button} onPress={addEducation}>
          <Text style={styles.buttonText}>Add Education</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        {resumeData.skills.map((skill, index) => (
          <View key={index} style={styles.entry}>
            <TextInput
              style={styles.input}
              value={skill}
              onChangeText={(text) => handleSkillChange(index, text)}
              placeholder={`Skill ${index + 1} (e.g., JavaScript)`}
            />
          </View>
        ))}
        <TouchableOpacity style={styles.button} onPress={addSkill}>
          <Text style={styles.buttonText}>Add Skill</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        {resumeData.certifications.map((cert, index) => (
          <View key={index} style={styles.entry}>
            <TextInput
              style={styles.input}
              value={cert}
              onChangeText={(text) => handleCertificationChange(index, text)}
              placeholder={`Certification ${index + 1} (e.g., AWS Certified Developer)`}
            />
          </View>
        ))}
        <TouchableOpacity style={styles.button} onPress={addCertification}>
          <Text style={styles.buttonText}>Add Certification</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Languages</Text>
        {resumeData.languages.map((lang, index) => (
          <View key={index} style={styles.entry}>
            <TextInput
              style={styles.input}
              value={lang.name}
              onChangeText={(text) => handleLanguageChange(index, 'name', text)}
              placeholder="Language"
            />
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text
                  key={star}
                  style={[styles.star, star <= lang.proficiency && styles.filledStar]}
                  onPress={() => handleProficiencyChange(index, star)}
                >
                  ★
                </Text>
              ))}
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.button} onPress={addLanguage}>
          <Text style={styles.buttonText}>Add Language</Text>
        </TouchableOpacity>
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
      {atsScore && <Text style={styles.atsScore}>ATS Score: {atsScore}%</Text>}
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
  header: { backgroundColor: '#4682b4', padding: 20, flexDirection: 'row', alignItems: 'center' },
  profilePic: { width: 100, height: 100, borderRadius: 50 },
  profilePicPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  nameInput: { flex: 1, fontSize: 24, fontWeight: 'bold', color: '#fff', marginLeft: 20, backgroundColor: 'transparent' },
  contact: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#f5f5f5' },
  input: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, marginHorizontal: 5 },
  summaryInput: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, marginVertical: 20, height: 100 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, color: '#4682b4', marginBottom: 10 },
  entry: { padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 4, marginBottom: 10 },
  textArea: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, height: 80 },
  stars: { flexDirection: 'row', marginTop: 10 },
  star: { fontSize: 20, color: '#ccc' },
  filledStar: { color: '#ffd700' },
  button: { backgroundColor: '#4682b4', padding: 15, borderRadius: 4, alignItems: 'center', marginVertical: 10 },
  buttonText: { color: '#fff', fontSize: 16 },
  jdInput: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, marginVertical: 20, height: 150 },
  atsScore: { fontSize: 18, color: '#4682b4', textAlign: 'center', marginVertical: 10 },
});

export default MinimalScreen;

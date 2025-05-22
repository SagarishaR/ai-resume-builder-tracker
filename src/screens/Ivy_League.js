import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import axios from 'axios';

const Ivy_League = () => {
  const [resumeData, setResumeData] = useState({
    name: '',
    jobTitle: '',
    phone: '',
    email: '',
    linkedin: '',
    summary: '',
    experience: [{ title: '', company: '', duration: '', description: '' }],
    education: [{ degree: '', institute: '', year: '' }],
    skills: [''],
    strengths: [{ area: '', detail: '' }],
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

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...resumeData.education];
    updatedEducation[index][field] = value;
    setResumeData((prev) => ({ ...prev, education: updatedEducation }));
  };

  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, { degree: '', institute: '', year: '' }],
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

  const handleStrengthChange = (index, field, value) => {
    const updatedStrengths = [...resumeData.strengths];
    updatedStrengths[index][field] = value;
    setResumeData((prev) => ({ ...prev, strengths: updatedStrengths }));
  };

  const addStrength = () => {
    setResumeData((prev) => ({
      ...prev,
      strengths: [...prev.strengths, { area: '', detail: '' }],
    }));
  };

  const calculateAtsScore = () => {
    if (!jobDescription) {
      Alert.alert('Error', 'Please enter a job description');
      return;
    }
    const jdWords = jobDescription.toLowerCase().split(/\W+/);
    const resumeText = `${resumeData.name} ${resumeData.jobTitle} ${resumeData.phone} ${resumeData.email} ${resumeData.linkedin} ${resumeData.summary} ${
      resumeData.experience.map((exp) => `${exp.title} ${exp.company} ${exp.duration} ${exp.description}`).join(' ')
    } ${resumeData.education.map((edu) => `${edu.degree} ${edu.institute} ${edu.year}`).join(' ')} ${
      resumeData.skills.join(' ')
    } ${resumeData.strengths.map((str) => `${str.area} ${str.detail}`).join(' ')}`.toLowerCase();
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
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .header { background-color: #000; color: #fff; padding: 10px; margin-bottom: 20px; }
              .name-container { margin-left: 15px; }
              .name { font-size: 24px; font-weight: bold; }
              .job-title { font-size: 18px; margin-top: 5px; }
              .contact { font-size: 12px; color: #ccc; margin-top: 5px; }
              .section { margin-bottom: 20px; }
              .section-title { font-size: 18px; color: #000; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
              .experience-item { margin-bottom: 15px; }
              .experience-title { font-weight: bold; }
              .experience-details { font-style: italic; margin: 5px 0; }
              .experience-desc { margin: 5px 0; }
              .education-item { margin-bottom: 15px; }
              .education-degree { font-weight: bold; }
              .education-details { font-style: italic; margin: 5px 0; }
              .skills { font-size: 14px; }
              .skills span { margin-right: 10px; }
              .strength-item { margin-bottom: 15px; }
              .strength-title { font-weight: bold; }
              .strength-desc { margin: 5px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="name-container">
                <div class="name">${resumeData.name || 'No Name Provided'}</div>
                <div class="job-title">${resumeData.jobTitle || 'No Job Title'}</div>
                <div class="contact">${resumeData.phone} | ${resumeData.email} | ${resumeData.linkedin}</div>
              </div>
            </div>
            <div class="section">
              <div class="section-title">SUMMARY</div>
              <p>${resumeData.summary}</p>
            </div>
            <div class="section">
              <div class="section-title">EXPERIENCE</div>
              ${resumeData.experience.map((exp) => `
                <div class="experience-item">
                  <div class="experience-title">${exp.title}</div>
                  <div class="experience-details">${exp.company} | ${exp.duration}</div>
                  <div class="experience-desc">${exp.description}</div>
                </div>
              `).join('')}
            </div>
            <div class="section">
              <div class="section-title">EDUCATION</div>
              ${resumeData.education.map((edu) => `
                <div class="education-item">
                  <div class="education-degree">${edu.degree}</div>
                  <div class="education-details">${edu.institute} | ${edu.year}</div>
                </div>
              `).join('')}
            </div>
            <div class="section">
              <div class="section-title">SKILLS</div>
              <div class="skills">${resumeData.skills.filter(skill => skill).join(' | ')}</div>
            </div>
            <div class="section">
              <div class="section-title">STRENGTHS</div>
              ${resumeData.strengths.map((strength) => `
                <div class="strength-item">
                  <div class="strength-title">${strength.area}</div>
                  <div class="strength-desc">${strength.detail}</div>
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: 'Ivy_League',
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
        <TextInput
          style={styles.nameInput}
          value={resumeData.name}
          onChangeText={(text) => handleChange('name', text)}
          placeholder="Your Name"
          placeholderTextColor="#fff"
        />
        <TextInput
          style={styles.jobTitleInput}
          value={resumeData.jobTitle}
          onChangeText={(text) => handleChange('jobTitle', text)}
          placeholder="Job Title"
          placeholderTextColor="#fff"
        />
      </View>
      <View style={styles.contact}>
        <TextInput
          style={styles.input}
          value={resumeData.phone}
          onChangeText={(text) => handleChange('phone', text)}
          placeholder="Phone"
        />
        <TextInput
          style={styles.input}
          value={resumeData.email}
          onChangeText={(text) => handleChange('email', text)}
          placeholder="Email"
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
        placeholder="Summary"
        multiline
        placeholderTextColor="#fff"
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
        {resumeData.education.map((edu, index) => (
          <View key={index} style={styles.entry}>
            <TextInput
              style={styles.input}
              value={edu.degree}
              onChangeText={(text) => handleEducationChange(index, 'degree', text)}
              placeholder="Degree"
            />
            <TextInput
              style={styles.input}
              value={edu.institute}
              onChangeText={(text) => handleEducationChange(index, 'institute', text)}
              placeholder="Institute"
            />
            <TextInput
              style={styles.input}
              value={edu.year}
              onChangeText={(text) => handleEducationChange(index, 'year', text)}
              placeholder="Year"
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
              placeholder={`Skill ${index + 1}`}
            />
          </View>
        ))}
        <TouchableOpacity style={styles.button} onPress={addSkill}>
          <Text style={styles.buttonText}>Add Skill</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Strengths</Text>
        {resumeData.strengths.map((strength, index) => (
          <View key={index} style={styles.entry}>
            <TextInput
              style={styles.input}
              value={strength.area}
              onChangeText={(text) => handleStrengthChange(index, 'area', text)}
              placeholder="Strength Area"
            />
            <TextInput
              style={styles.textArea}
              value={strength.detail}
              onChangeText={(text) => handleStrengthChange(index, 'detail', text)}
              placeholder="Strength Detail"
              multiline
            />
          </View>
        ))}
        <TouchableOpacity style={styles.button} onPress={addStrength}>
          <Text style={styles.buttonText}>Add Strength</Text>
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
  header: { backgroundColor: '#000', padding: 10, marginBottom: 20 },
  nameInput: { fontSize: 24, fontWeight: 'bold', color: '#fff', backgroundColor: 'transparent' },
  jobTitleInput: { fontSize: 18, color: '#fff', backgroundColor: 'transparent', marginTop: 5 },
  contact: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#f5f5f5', marginBottom: 20 },
  input: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, marginHorizontal: 5 },
  summaryInput: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, marginVertical: 20, height: 100 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, color: '#000', borderBottomWidth: 2, borderBottomColor: '#000', paddingBottom: 5, marginBottom: 10 },
  entry: { padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 4, marginBottom: 10 },
  textArea: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, height: 80 },
  button: { backgroundColor: '#000', padding: 15, borderRadius: 4, alignItems: 'center', marginVertical: 10 },
  buttonText: { color: '#fff', fontSize: 16 },
  jdInput: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, marginVertical: 20, height: 150 },
  atsScore: { fontSize: 18, color: '#000', textAlign: 'center', marginVertical: 10 },
});

export default Ivy_League;
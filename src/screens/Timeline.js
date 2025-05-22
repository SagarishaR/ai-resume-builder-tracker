import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';

const Timeline = () => {
  const [resumeData, setResumeData] = useState({
    profilePic: null,
    name: '',
    title: '',
    phone: '',
    email: '',
    linkedin: '',
    summary: '',
    education: [{ year: '', location: '', institution: '', degree: '', additional: '' }],
    experience: [{ year: '', location: '', company: '', title: '', description: '' }],
    techSkills: [''],
    proudOf: [{ achievement: '', detail: '' }],
  });
  const [jobDescription, setJobDescription] = useState('');
  const [atsScore, setAtsScore] = useState(null);

  const handleChange = (field, value) => {
    setResumeData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...resumeData.education];
    updatedEducation[index][field] = value;
    setResumeData((prev) => ({ ...prev, education: updatedEducation }));
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...resumeData.experience];
    updatedExperience[index][field] = value;
    setResumeData((prev) => ({ ...prev, experience: updatedExperience }));
  };

  const handleTechSkillChange = (index, value) => {
    const updatedTechSkills = [...resumeData.techSkills];
    updatedTechSkills[index] = value;
    setResumeData((prev) => ({ ...prev, techSkills: updatedTechSkills }));
  };

  const handleProudOfChange = (index, field, value) => {
    const updatedProudOf = [...resumeData.proudOf];
    updatedProudOf[index][field] = value;
    setResumeData((prev) => ({ ...prev, proudOf: updatedProudOf }));
  };

  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, { year: '', location: '', institution: '', degree: '', additional: '' }],
    }));
  };

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, { year: '', location: '', company: '', title: '', description: '' }],
    }));
  };

  const addTechSkill = () => {
    setResumeData((prev) => ({
      ...prev,
      techSkills: [...prev.techSkills, ''],
    }));
  };

  const addProudOf = () => {
    setResumeData((prev) => ({
      ...prev,
      proudOf: [...prev.proudOf, { achievement: '', detail: '' }],
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
    const resumeText = `${resumeData.name} ${resumeData.summary} ${resumeData.phone} ${resumeData.email} ${resumeData.linkedin} ${
      resumeData.education.map((edu) => `${edu.year} ${edu.location} ${edu.institution} ${edu.degree} ${edu.additional}`).join(' ')
    } ${resumeData.experience.map((exp) => `${exp.year} ${exp.location} ${exp.company} ${exp.title} ${exp.description}`).join(' ')} ${
      resumeData.techSkills.join(' ')
    } ${resumeData.proudOf.map((proud) => `${proud.achievement} ${proud.detail}`).join(' ')
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
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #fff; }
              .header { padding: 10px 20px; border-bottom: 2px solid #ff6200; display: flex; align-items: center; justify-content: space-between; }
              .profile-pic { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
              .name { font-size: 24px; font-weight: bold; color: #000080; }
              .title { font-size: 16px; color: #ff6200; margin-top: 5px; }
              .contact { font-size: 14px; color: #000000; display: flex; align-items: center; flex-wrap: wrap; }
              .contact-item { margin-left: 10px; margin-right: 15px; }
              .section { margin-bottom: 20px; }
              .section-title { font-size: 18px; font-weight: bold; color: #000080; margin-bottom: 10px; }
              .timeline { position: relative; display: flex; align-items: flex-start; }
              .timeline-year-location { min-width: 120px; margin-right: 20px; font-weight: bold; color: #000000; }
              .timeline-line { position: absolute; left: 130px; top: 0; bottom: 0; width: 2px; background-color: #000000; }
              .timeline-dot { width: 6px; height: 6px; background-color: #ff6200; border-radius: 50%; position: absolute; left: 127px; top: 8px; }
              .timeline-content { flex: 1; margin-left: 20px; color: #000000; }
              .text { font-size: 14px; color: #000000; margin-bottom: 5px; }
              .skill-list { display: flex; flex-wrap: wrap; gap: 10px; }
              .skill-item { background-color: #f0f0f0; padding: 5px 10px; border-radius: 5px; font-size: 14px; color: #000000; }
              .proud-of-container { display: flex; flex-wrap: wrap; gap: 20px; }
              .proud-of { display: flex; align-items: center; width: '48%'; margin-bottom: 10px; }
              .proud-left { font-size: 20px; color: #ff6200; margin-right: 10px; }
              .proud-right { font-size: 20px; color: #ff6200; }
              .proud-content { flex: 1; }
            </style>
          </head>
          <body>
            <div class="header">
              ${profilePicBase64 ? `<img src="data:image/jpeg;base64,${profilePicBase64}" class="profile-pic" />` : '<div style="width: 80px; height: 80px; background-color: #ccc; border-radius: 50%;"></div>'}
              <div>
                <div class="name">${resumeData.name || 'Your Name'}</div>
                <div class="title">${resumeData.title || 'Your Title'}</div>
                <div class="contact">
                  <span>${resumeData.phone || '+1-123-456-7890'}</span>
                  <span>${resumeData.email || 'youremail@example.com'}</span>
                  <span>${resumeData.linkedin || 'linkedin.com/in/yourprofile'}</span>
                </div>
              </div>
            </div>
            <div style="margin-bottom: 20px;"></div>
            <div class="section">
              <div class="section-title">SUMMARY</div>
              <p class="text">${resumeData.summary || 'Professional summary goes here...'}</p>
            </div>
            <div class="section">
              <div class="section-title">EDUCATION</div>
              <div class="timeline">
                ${resumeData.education.map((edu, index) => `
                  <div style="position: relative; margin-bottom: 20px;">
                    <div class="timeline-year-location">${edu.year || 'Year'}<br>${edu.location || 'Location'}</div>
                    <div class="timeline-line"></div>
                    <div class="timeline-dot" style="top: ${index * 20 + 8}px;"></div>
                    <div class="timeline-content">
                      <p class="text">${edu.institution || 'Institution'}</p>
                      <p class="text">${edu.degree || 'Degree'}</p>
                      <p class="text">${edu.additional || 'Additional details...'}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="section">
              <div class="section-title">EXPERIENCE</div>
              <div class="timeline">
                ${resumeData.experience.map((exp, index) => `
                  <div style="position: relative; margin-bottom: 20px;">
                    <div class="timeline-year-location">${exp.year || 'Year'}<br>${exp.location || 'Location'}</div>
                    <div class="timeline-line"></div>
                    <div class="timeline-dot" style="top: ${index * 20 + 8}px;"></div>
                    <div class="timeline-content">
                      <p class="text">${exp.title || 'Title'}</p>
                      <p class="text">${exp.company || 'Company'}</p>
                      <p class="text">${exp.description || 'Description...'}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="section">
              <div class="section-title">TECH SKILLS</div>
              <div class="skill-list">
                ${resumeData.techSkills.filter(skill => skill).map(skill => `<span class="skill-item">${skill}</span>`).join('')}
              </div>
            </div>
            <div class="section">
              <div class="section-title">MOST PROUD OF</div>
              <div class="proud-of-container">
                ${resumeData.proudOf.map((proud, index) => `
                  <div class="proud-of">
                    <div class="proud-left">${index % 2 === 0 ? '⬆️' : ''}</div>
                    <div class="proud-content">
                      <p class="text">${proud.achievement || 'Achievement'}<br>${proud.detail || 'Detail'}</p>
                    </div>
                    <div class="proud-right">${index % 2 === 0 ? '' : '❤️'}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: 'Resume',
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
        <View style={styles.headerContent}>
          <TextInput
            style={styles.nameInput}
            value={resumeData.name}
            onChangeText={(text) => handleChange('name', text)}
            placeholder="Your Name"
          />
          <TextInput
            style={styles.titleInput}
            value={resumeData.title}
            onChangeText={(text) => handleChange('title', text)}
            placeholder="Your Title"
          />
          <View style={styles.contact}>
            <TextInput
              style={styles.contactInput}
              value={resumeData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              placeholder="Phone: e.g., +1-123-456-7890"
            />
            <TextInput
              style={styles.contactInput}
              value={resumeData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="Email: e.g., youremail@example.com"
            />
            <TextInput
              style={styles.contactInput}
              value={resumeData.linkedin}
              onChangeText={(text) => handleChange('linkedin', text)}
              placeholder="LinkedIn: e.g., linkedin.com/in/yourprofile"
            />
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SUMMARY</Text>
        <TextInput
          style={styles.textInput}
          value={resumeData.summary}
          onChangeText={(text) => handleChange('summary', text)}
          multiline
          placeholder="Write a brief summary..."
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EDUCATION</Text>
        {resumeData.education.map((edu, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineYearLocation}>
              <TextInput
                style={styles.yearInput}
                value={edu.year}
                onChangeText={(text) => handleEducationChange(index, 'year', text)}
                placeholder="Year (e.g., 2010 - 2014)"
              />
              <TextInput
                style={styles.locationInput}
                value={edu.location}
                onChangeText={(text) => handleEducationChange(index, 'location', text)}
                placeholder="Location (e.g., City, State)"
              />
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <TextInput
                style={styles.textInput}
                value={edu.institution}
                onChangeText={(text) => handleEducationChange(index, 'institution', text)}
                placeholder="Institution"
              />
              <TextInput
                style={styles.textInput}
                value={edu.degree}
                onChangeText={(text) => handleEducationChange(index, 'degree', text)}
                placeholder="Degree (e.g., B.S. Computer Science)"
              />
              <TextInput
                style={styles.textInput}
                value={edu.additional}
                onChangeText={(text) => handleEducationChange(index, 'additional', text)}
                placeholder="Additional Info"
                multiline
              />
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={addEducation}>
          <Text style={styles.addButtonText}>Add Education</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EXPERIENCE</Text>
        {resumeData.experience.map((exp, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineYearLocation}>
              <TextInput
                style={styles.yearInput}
                value={exp.year}
                onChangeText={(text) => handleExperienceChange(index, 'year', text)}
                placeholder="Year (e.g., 2015 - Present)"
              />
              <TextInput
                style={styles.locationInput}
                value={exp.location}
                onChangeText={(text) => handleExperienceChange(index, 'location', text)}
                placeholder="Location (e.g., City, State)"
              />
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <TextInput
                style={styles.textInput}
                value={exp.title}
                onChangeText={(text) => handleExperienceChange(index, 'title', text)}
                placeholder="Title (e.g., Software Engineer)"
              />
              <TextInput
                style={styles.textInput}
                value={exp.company}
                onChangeText={(text) => handleExperienceChange(index, 'company', text)}
                placeholder="Company"
              />
              <TextInput
                style={styles.textInput}
                value={exp.description}
                onChangeText={(text) => handleExperienceChange(index, 'description', text)}
                placeholder="Description"
                multiline
              />
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={addExperience}>
          <Text style={styles.addButtonText}>Add Experience</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TECH SKILLS</Text>
        {resumeData.techSkills.map((skill, index) => (
          <TextInput
            key={index}
            style={styles.textInput}
            value={skill}
            onChangeText={(text) => handleTechSkillChange(index, text)}
            placeholder={`Skill ${index + 1} (e.g., Python)`}
          />
        ))}
        <TouchableOpacity style={styles.addButton} onPress={addTechSkill}>
          <Text style={styles.addButtonText}>Add Skill</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MOST PROUD OF</Text>
        <View style={styles.proudOfContainer}>
          {resumeData.proudOf.map((proud, index) => (
            <View key={index} style={styles.proudOf}>
              <Text style={styles.proudLeft}>{index % 2 === 0 ? '⬆️' : ''}</Text>
              <View style={styles.proudContent}>
                <TextInput
                  style={styles.textInput}
                  value={proud.achievement}
                  onChangeText={(text) => handleProudOfChange(index, 'achievement', text)}
                  placeholder="Achievement"
                />
                <TextInput
                  style={styles.textInput}
                  value={proud.detail}
                  onChangeText={(text) => handleProudOfChange(index, 'detail', text)}
                  placeholder="Detail"
                  multiline
                />
              </View>
              <Text style={styles.proudRight}>{index % 2 === 0 ? '' : '❤️'}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.addButton} onPress={addProudOf}>
          <Text style={styles.addButtonText}>Add Proud Moment</Text>
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
  header: { padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#ff6200', marginBottom: 20 },
  profilePic: { width: 80, height: 80, borderRadius: 40 },
  profilePicPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  headerContent: { flex: 1, alignItems: 'flex-end', marginLeft: 10 },
  nameInput: { fontSize: 24, fontWeight: 'bold', color: '#000080', textAlign: 'right', marginBottom: 5 },
  titleInput: { fontSize: 16, color: '#ff6200', textAlign: 'right', marginBottom: 5 },
  contactInput: { fontSize: 14, color: '#000000', marginLeft: 5, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 5, width: 150, textAlign: 'right', marginBottom: 5 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000080', marginBottom: 10 },
  timelineItem: { position: 'relative', flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
  timelineYearLocation: { minWidth: 120, marginRight: 20, fontWeight: 'bold' },
  yearInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 5, fontSize: 14, color: '#000000', textAlign: 'left', marginBottom: 5 },
  locationInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 5, fontSize: 14, color: '#000000', textAlign: 'left' },
  timelineLine: { position: 'absolute', left: 130, top: 0, bottom: 0, width: 2, backgroundColor: '#000000' },
  timelineDot: { width: 6, height: 6, backgroundColor: '#ff6200', borderRadius: 3, position: 'absolute', left: 127, top: 8 },
  timelineContent: { flex: 1, marginLeft: 20 },
  textInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 10, marginBottom: 10, fontSize: 14, color: '#000000', textAlign: 'left' },
  proudOfContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  proudOf: { flexDirection: 'row', alignItems: 'center', width: '48%', marginBottom: 10 },
  proudLeft: { fontSize: 20, color: '#ff6200', marginRight: 10 },
  proudRight: { fontSize: 20, color: '#ff6200' },
  proudContent: { flex: 1 },
  addButton: { backgroundColor: '#ff6200', padding: 10, borderRadius: 4, alignItems: 'center', marginTop: 10 },
  addButtonText: { color: '#fff', fontSize: 14 },
  jdInput: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, marginVertical: 20, height: 150 },
  button: { backgroundColor: '#ff6200', padding: 15, borderRadius: 4, alignItems: 'center', marginVertical: 10 },
  buttonText: { color: '#fff', fontSize: 16 },
  atsScore: { fontSize: 18, color: '#000000', textAlign: 'center', marginVertical: 10 },
});

export default Timeline;
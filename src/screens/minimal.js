import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from "react-native";

const Minimal = () => {
  const navigation = useNavigation(); 
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [summary, setSummary] = useState("");
  const [workExperiences, setWorkExperiences] = useState([{ jobTitle: "", details: "", timeWorked: "" }]);
  const [educations, setEducations] = useState([{ institute: "", degree: "", date: "" }]);
  const [skills, setSkills] = useState([""]);
  const [certifications, setCertifications] = useState([""]);
  const [projects, setProjects] = useState([{ title: "", description: "", technologies: "" }]);
  const [additionalInfo, setAdditionalInfo] = useState([""]);

  const handleAddWork = () => setWorkExperiences([...workExperiences, { jobTitle: "", details: "", timeWorked: "" }]);
  const handleAddEducation = () => setEducations([...educations, { institute: "", degree: "", date: "" }]);
  const handleAddSkill = () => setSkills([...skills, ""]);
  const handleAddCertification = () => setCertifications([...certifications, ""]);
  const handleAddProject = () => setProjects([...projects, { title: "", description: "", technologies: "" }]);
  const handleAddAdditionalInfo = () => setAdditionalInfo([...additionalInfo, ""]);

  const handleWorkChange = (index, field, value) => {
    let updatedWorkExp = [...workExperiences];
    updatedWorkExp[index][field] = value;
    setWorkExperiences(updatedWorkExp);
  };

  const handleEducationChange = (index, field, value) => {
    let updatedEducations = [...educations];
    updatedEducations[index][field] = value;
    setEducations(updatedEducations);
  };

  const handleSkillChange = (text, index) => {
    let newSkills = [...skills];
    newSkills[index] = text;
    setSkills(newSkills);
  };

  const handleCertificationChange = (text, index) => {
    let newCertifications = [...certifications];
    newCertifications[index] = text;
    setCertifications(newCertifications);
  };

  const handleProjectChange = (index, field, value) => {
    let updatedProjects = [...projects];
    updatedProjects[index][field] = value;
    setProjects(updatedProjects);
  };

  const handleAdditionalInfoChange = (text, index) => {
    let newInfo = [...additionalInfo];
    newInfo[index] = text;
    setAdditionalInfo(newInfo);
  };

  const handleSubmit = async () => {
    const resumeData = {
      fullName,
      mobile,
      email,
      address,
      jobTitle,
      summary,
      workExperiences,
      educations,
      skills,
      certifications,
      projects,
      additionalInfo,
    };
  
    try {
      const response = await fetch(process.env.REACT_APP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
        },
        body: JSON.stringify(resumeData),
      });
  
      const atsOptimizedResume = await response.json();
  
      setSummary(atsOptimizedResume.summary);
      setWorkExperiences(atsOptimizedResume.workExperiences);
      setEducations(atsOptimizedResume.educations);
      setSkills(atsOptimizedResume.skills);
      setProjects(atsOptimizedResume.projects);
      setAdditionalInfo(atsOptimizedResume.additionalInfo);
     
      navigation.navigate("ResumePreview", { resume: atsOptimizedResume });
  
    } catch (error) {
      console.error("Error optimizing resume:", error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.heading}>Minimal Template Form</Text>

      <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Job Title" value={jobTitle} onChangeText={setJobTitle} />
      <TextInput style={styles.input} placeholder="Mobile Number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Email ID" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} multiline />

      <Text style={styles.sectionTitle}>Summary</Text>
      <TextInput style={styles.input} placeholder="Brief summary about you" value={summary} onChangeText={setSummary} multiline />

      <Text style={styles.sectionTitle}>Work Experience</Text>
      {workExperiences.map((exp, index) => (
        <View key={index} style={styles.workContainer}>
          <TextInput style={styles.input} placeholder="Job Title" value={exp.jobTitle} onChangeText={(text) => handleWorkChange(index, "jobTitle", text)} />
          <TextInput style={styles.input} placeholder="Details of Job" value={exp.details} onChangeText={(text) => handleWorkChange(index, "details", text)} multiline />
          <TextInput style={styles.input} placeholder="Time Worked (Eg : Jan 2023 - present)" value={exp.timeWorked} onChangeText={(text) => handleWorkChange(index, "timeWorked", text)} />
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={handleAddWork}>
        <Text style={styles.addButtonText}>+ Add Work Experience</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Education</Text>
      {educations.map((edu, index) => (
        <View key={index} style={styles.workContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="Institute" 
            value={edu.institute} 
            onChangeText={(text) => handleEducationChange(index, "institute", text)} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Degree" 
            value={edu.degree} 
            onChangeText={(text) => handleEducationChange(index, "degree", text)} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Date (e.g., May 2020)" 
            value={edu.date} 
            onChangeText={(text) => handleEducationChange(index, "date", text)} 
          />
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={handleAddEducation}>
        <Text style={styles.addButtonText}>+ Add Education</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Skills</Text>
      {skills.map((skill, index) => (
        <TextInput 
          key={index} 
          style={styles.input} 
          placeholder={`Skill ${index + 1} (e.g., JavaScript, Python)`} 
          value={skill} 
          onChangeText={(text) => handleSkillChange(text, index)} 
        />
      ))}
      <TouchableOpacity style={styles.addButton} onPress={handleAddSkill}>
        <Text style={styles.addButtonText}>+ Add Skill</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Certifications</Text>
      {certifications.map((cert, index) => (
        <TextInput 
          key={index} 
          style={styles.input} 
          placeholder={`Certification ${index + 1} (e.g., AWS Certified Developer)`} 
          value={cert} 
          onChangeText={(text) => handleCertificationChange(text, index)} 
        />
      ))}
      <TouchableOpacity style={styles.addButton} onPress={handleAddCertification}>
        <Text style={styles.addButtonText}>+ Add Certification</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Projects</Text>
      {projects.map((project, index) => (
        <View key={index} style={styles.workContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="Project Title" 
            value={project.title} 
            onChangeText={(text) => handleProjectChange(index, "title", text)} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Project Description" 
            value={project.description} 
            onChangeText={(text) => handleProjectChange(index, "description", text)} 
            multiline 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Technologies Used" 
            value={project.technologies} 
            onChangeText={(text) => handleProjectChange(index, "technologies", text)} 
          />
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={handleAddProject}>
        <Text style={styles.addButtonText}>+ Add Project</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Additional Information</Text>
      {additionalInfo.map((info, index) => (
        <TextInput key={index} style={styles.input} placeholder={`Additional Info ${index + 1}`} value={info} onChangeText={(text) => handleAdditionalInfoChange(text, index)} multiline />
      ))}
      <TouchableOpacity style={styles.addButton} onPress={handleAddAdditionalInfo}>
        <Text style={styles.addButtonText}>+ Add More Information</Text>
      </TouchableOpacity>

      <View style={styles.submitContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5, backgroundColor: "#fff" },
  workContainer: { marginBottom: 15 },
  addButton: { backgroundColor: "#9370DB", padding: 10, marginBottom: 10, borderRadius: 5, alignItems: "center" },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  submitContainer: { alignItems: "center", marginBottom: 30 },
  submitButton: { backgroundColor: "#9370DB", padding: 15, borderRadius: 8, width: "80%", alignItems: "center" },
  submitButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

export default Minimal;
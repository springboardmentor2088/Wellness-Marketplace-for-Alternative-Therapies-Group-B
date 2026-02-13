package com.wellnesshub.backend.practitioner;

import com.wellnesshub.backend.user.UserEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "practitioner_profiles")
public class PractitionerProfileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(nullable = false)
    private String specialization;

    @Column
    private String qualification;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "license_number")
    private String licenseNumber;

    @Column(name = "clinic_name")
    private String clinicName;

    @Column(name = "consultation_fee")
    private Double consultationFee;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status")
    private VerificationStatus verificationStatus;

    @Column(name = "degree_file_path")
    private String degreeFilePath;

    @Column(name = "created_at", updatable = false)
    private java.sql.Timestamp createdAt;

    // Enum for verification_status
    public enum VerificationStatus {
        PENDING, APPROVED, REJECTED
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getClinicName() { return clinicName; }
    public void setClinicName(String clinicName) { this.clinicName = clinicName; }

    public Double getConsultationFee() { return consultationFee; }
    public void setConsultationFee(Double consultationFee) { this.consultationFee = consultationFee; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getDegreeFilePath() { return degreeFilePath; }
    public void setDegreeFilePath(String degreeFilePath) { this.degreeFilePath = degreeFilePath; }

    public java.sql.Timestamp getCreatedAt() { return createdAt; }
}

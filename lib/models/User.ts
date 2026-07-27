import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    fullName: { type: String },
    photo: { type: String },
    role: { type: String, default: "guest" },
    phone: { type: String, index: true },
    passwordHash: { type: String, default: "" },

    country: { type: String, default: "-" },
    step: { type: String, default: "-" },
    studentId: { type: String, default: "" },
    university: { type: String, default: "MNUMS" },
    badges: { type: [String], default: [] },

    documents: {
      passport: { type: String, default: "" },
      emongoliaCert: { type: String, default: "" },
      marriageCert: { type: String, default: "" },
      residenceCert: { type: String, default: "" },
      birthCert: { type: String, default: "" },
      educationCert: { type: String, default: "" },
      bachelorDiploma: { type: String, default: "" },
      driverLicense: { type: String, default: "" },
      englishCert: { type: String, default: "" },
      medicalRecords: { type: String, default: "" },
      mentalHealthExam: { type: String, default: "" },
      professionalExp: { type: String, default: "" },
    },

    documentsSubmitted: { type: Boolean, default: false },
    documentsReviewedBy: { type: String, default: "" },
    documentsApprovedAt: { type: Date },

    profile: {
      sex: { type: String },
      dob: { type: Date },
      placeOfBirth: { type: String },
      nationality: { type: String },
      religion: { type: String },
      phone: { type: String },
      mobile: { type: String },
      skype: { type: String },
      bestTime: { type: String },
      address: {
        street: { type: String },
        number: { type: String },
        postalCode: { type: String },
        city: { type: String },
        country: { type: String },
      },
      fatherProfession: { type: String },
      motherProfession: { type: String },
      hobbies: { type: String },
      educationLevel: { type: String },
      languages: { type: String },
      childcareExperience: { type: [String], default: [] },
      householdTasks: { type: [String], default: [] },
      motivation: { type: String },
    },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

UserSchema.index({ "profile.phone": 1 });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;

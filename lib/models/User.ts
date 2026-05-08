// lib/models/User.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    fullName: { type: String },
    photo: { type: String },
    role: { type: String, default: "guest" }, // admin, student, guest

    // --- NEW FIELDS FOR TRACKING ---
    country: { type: String, default: "-" }, // e.g. "Germany"
    step: { type: String, default: "-" },    // e.g. "Visa Process"
    studentId: { type: String, default: '' },
    university: { type: String, default: 'MNUMS' },

    badges: { type: [String], default: [] },

    // --- DOCUMENT STORAGE ---
    documents: {
      passport: { type: String, default: "" },           // Cloudinary URL for JPG or PDF
      emongoliaCert: { type: String, default: "" },      // PDF URL
      marriageCert: { type: String, default: "" },       // PDF URL (optional)
      residenceCert: { type: String, default: "" },      // PDF URL
      birthCert: { type: String, default: "" },          // PDF URL
      educationCert: { type: String, default: "" },      // PDF URL
      bachelorDiploma: { type: String, default: "" },    // PDF URL
      driverLicense: { type: String, default: "" },      // Cloudinary or PDF URL
      englishCert: { type: String, default: "" },        // Cloudinary or PDF URL (IELTS/TOEFL)
      medicalRecords: { type: String, default: "" },     // Scanned document URL
      mentalHealthExam: { type: String, default: "" },   // Scanned document URL
      professionalExp: { type: String, default: "" },    // PDF URL (optional)
    },

    // Document submission tracking
    documentsSubmitted: { type: Boolean, default: false },
    documentsReviewedBy: { type: String, default: "" },    // Admin who reviewed
    documentsApprovedAt: { type: Date },

    // --- DETAILED PROFILE ---
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
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
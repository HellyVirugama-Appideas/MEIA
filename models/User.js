// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       trim: true,
//     },
//     email: {
//       type: String,
//       trim: true,
//       lowercase: true,
//       unique: true,
//       sparse: true,
//     },
//     countryCode: {
//       type: String,
//       default: "+91",
//     },
//     phone: {
//       type: String,
//       trim: true,
//       unique: true,
//       sparse: true,
//       required: true,
//     },
//     mpin: {
//       type: String, // hashed 4-6 digit pin
//       select: false,
//     },

//     // ---- Verification / Onboarding flags ----
//     isPhoneVerified: {
//       type: Boolean,
//       default: false,
//     },
//     isMpinSet: {
//       type: Boolean,
//       default: false,
//     },
//     isProfileComplete: {
//       type: Boolean,
//       default: false,
//     },
//     isOnboarded: {
//       type: Boolean,
//       default: false, // all onboarding screens completed or not
//     },

//     // ---- Onboarding: "Birth Information" / "Birth Time" / "No Exact Time" screens ----
//     birthInfo: {
//       dateOfBirth: { type: Date },
//       birthPlace: { type: String, trim: true },
//       birthTime: { type: String }, // stored as "HH:mm" (24hr)
//       isExactTime: { type: Boolean, default: true }, // false if user selected "No Exact Time"
//       latitude: { type: Number }, // resolved from birthPlace via geocoding
//       longitude: { type: Number },
//       timezone: { type: String }, // IANA tz, e.g. "Asia/Kolkata"
//     },

//     // Cached Swiss Ephemeris calculation result - computed once when
//     // birthInfo is completed, avoids recalculating on every request
//     birthChart: {
//       planets: [
//         {
//           key: String,
//           name: String,
//           sign: String,
//           degree: Number,
//           degreeFormatted: String,
//           longitude: Number,
//         },
//       ],
//       ascendant: {
//         sign: String,
//         degree: Number,
//         degreeFormatted: String,
//       },
//       midheaven: {
//         sign: String,
//         degree: Number,
//         degreeFormatted: String,
//       },
//       sunSign: String,
//       moonSign: String,
//       calculatedAt: Date,
//     },

//     // ---- Onboarding: "Select date" / "Select days" / "Cycle Information" screens ----
//     cycleInfo: {
//       lastPeriodDate: { type: Date },
//       averageCycleLength: { type: Number }, // in days e.g. 28
//       averagePeriodLength: { type: Number }, // in days e.g. 3,4,5
//     },

//     // ---- Onboarding: "Personalization Setup" screen ----
//     personalization: {
//       preferredName: { type: String, trim: true }, // "What should we call you?"
//       timeZone: { type: String, trim: true }, // "Your Time Zone"
//       notificationsEnabled: { type: Boolean, default: true },
//       ritualReminderTime: { type: String }, // "HH:mm AM/PM" - from Time Picker screen
//     },

//     // ---- OTP handling ----
//     otp: {
//       type: String,
//       select: false,
//     },
//     otpExpiresAt: {
//       type: Date,
//       select: false,
//     },
//     otpPurpose: {
//       type: String,
//       enum: ["signup", "forgot_mpin"],
//       select: false,
//     },

//     status: {
//       type: String,
//       enum: ["active", "blocked", "deleted"],
//       default: "active",
//     },
//     lastLoginAt: {
//       type: Date,
//     },
//     fcmToken: {
//       type: String, // mobile device push notification token
//     },
//     isPro: {
//       type: Boolean,
//       default: false, // quick flag for feature-gating, kept in sync with UserSubscription.status
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", UserSchema); 

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    countryCode: {
      type: String,
      default: "+91",
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      // NOT required at creation time anymore. A user document is first
      // created as a GUEST the moment onboarding starts (POST
      // /api/onboarding/start), before they ever give us a phone number.
      // Phone only gets attached later, in Signup step 1
      // (POST /api/auth/signup), which now runs AFTER onboarding.
    },
    mpin: {
      type: String, // hashed 4-6 digit pin
      select: false,
    },

    password: {
      type: String,
      select: false,
    },
    // ---- Guest / Verification / Onboarding flags ----
    isGuest: {
      type: Boolean,
      default: true, // true while the user is going through onboarding
      // without an account yet; flipped to false once signup
      // (phone + OTP + mpin) is completed successfully.
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isMpinSet: {
      type: Boolean,
      default: false,
    },
    // Fingerprint / Face ID preference
    // Actual biometric verification is handled by the mobile OS.
    biometricEnabled: {
      type: Boolean,
      default: false,
    },
    biometricToken: {
      type: String, // hashed, jaise mpin/password
      select: false,
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    isOnboarded: {
      type: Boolean,
      default: false, // all onboarding screens completed or not
    },
    syncPreference: {
      type: String,
      enum: ["cycle", "stars"],
      default: null,
    },

    // ---- Onboarding: "Birth Information" / "Birth Time" / "No Exact Time" screens ----
    birthInfo: {
      dateOfBirth: { type: Date },
      birthPlace: { type: String, trim: true },
      birthTime: { type: String }, // stored as "HH:mm" (24hr)
      isExactTime: { type: Boolean, default: true }, // false if user selected "No Exact Time"
      latitude: { type: Number }, // resolved from birthPlace via geocoding
      longitude: { type: Number },
      timezone: { type: String }, // IANA tz, e.g. "Asia/Kolkata"
    },

    // Cached Swiss Ephemeris calculation result - computed once when
    // birthInfo is completed, avoids recalculating on every request
    birthChart: {
      planets: [
        {
          key: String,
          name: String,
          sign: String,
          degree: Number,
          degreeFormatted: String,
          longitude: Number,
        },
      ],
      ascendant: {
        sign: String,
        degree: Number,
        degreeFormatted: String,
      },
      midheaven: {
        sign: String,
        degree: Number,
        degreeFormatted: String,
      },
      sunSign: String,
      moonSign: String,
      calculatedAt: Date,
    },

    // ---- Onboarding: "Select date" / "Select days" / "Cycle Information" screens ----
    cycleInfo: {
      lastPeriodDate: { type: Date },
      averageCycleLength: { type: Number }, // in days e.g. 28
      averagePeriodLength: { type: Number }, // in days e.g. 3,4,5
    },

    // ---- Onboarding: "Personalization Setup" screen ----
    personalization: {
      preferredName: { type: String, trim: true }, // "What should we call you?"
      timeZone: { type: String, trim: true }, // "Your Time Zone"
      notificationsEnabled: { type: Boolean, default: true },
      ritualReminderTime: { type: String }, // "HH:mm AM/PM" - from Time Picker screen
    },

    // ---- OTP handling ----
    otp: {
      type: String,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      select: false,
    },
    otpPurpose: {
      type: String,
      enum: ["signup", "forgot_mpin", "forgot_password"],
      select: false,
    },

    status: {
      type: String,
      enum: ["active", "blocked", "deleted"],
      default: "active",
    },
    lastLoginAt: {
      type: Date,
    },

    fcmToken: {
      type: String, // mobile device push notification token
    },
    isPro: {
      type: Boolean,
      default: false, // quick flag for feature-gating, kept in sync with UserSubscription.status
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
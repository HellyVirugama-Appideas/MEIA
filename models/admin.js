const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [/^\+971\s?(50|52|54|55|56|58)[0-9]{7}$/, "Please provide a valid UAE phone number"],
    },

    // S = Super Admin, A = Sub Admin
    role: {
      type: String,
      enum: ["S", "A"],
      default: "A",
    },

    password: { type: String, required: true, select: false },

    department: {
      type: String,
      trim: true,
      default: "General",
    },

    employeeId: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },

    // Sub-admin module-wise permissions (only relevant when role === 'A')
    permission: [
      {
        key: { type: String },
        module: { type: String },
        isView: { type: Boolean, default: false },
        isAdd: { type: Boolean, default: false },
        isEdit: { type: Boolean, default: false },
        isDelete: { type: Boolean, default: false },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
AdminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Clean JSON output (password hata do)
AdminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = mongoose.model("Admin", AdminSchema);
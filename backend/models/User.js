const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['donor', 'patient', 'admin'],
    required: [true, 'Please specify role']
  },
  profile: {
    fullName: {
      type: String,
      required: [true, 'Please provide full name']
    },
    phone: String,
    address: String,
    city: String,
    state: String,
    pinCode: String,
    dob: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    }
  },
  bloodType: {
    type: String,
    enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    required: function() {
      return this.role === 'donor';
    }
  },
  weight: {
    type: Number,
    required: function() {
      return this.role === 'donor';
    }
  },
  medicalHistory: [String],
  lastDonationDate: Date,
  nextEligibleDate: Date,
  available: {
    type: Boolean,
    default: true
  },
  hospitalName: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get user data without password
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

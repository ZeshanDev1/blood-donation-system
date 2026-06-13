const mongoose = require("mongoose");

const TeamMemberSchema = new mongoose.Schema(
  {
    name: String,
    title: String,
    bio: String,
    imageUrl: String,
    initials: String,
    color: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeamMember", TeamMemberSchema);
import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content",
      },
    ],

    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);

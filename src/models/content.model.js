import mongoose, { Schema } from "mongoose";

const contentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: ["video", "document", "audio", "other"],
    },
    fileURL: {
      type: String,
      required: true,
      trim: true,
    },

    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    duration: {
      type: Number,
    },
    tags: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

export const Content = mongoose.model("Content", contentSchema);

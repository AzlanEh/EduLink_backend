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
      trim: true,
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
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      set: (tags) => [...new Set(tags.map((tag) => tag.toLowerCase()))], // Removes duplicates and lowercases
    },
  },
  {
    timestamps: true,
  }
);

contentSchema.virtual("formattedDuration").get(function () {
  if (!this.duration) return "Unknown duration";
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return `${hours}h ${minutes}m`;
});

export const Content = mongoose.model("Content", contentSchema);

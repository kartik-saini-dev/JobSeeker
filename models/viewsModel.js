import mongoose, { Schema } from "mongoose";

const viewsSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model where userType is 'worker'
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job", // Reference to the Job model
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'viewedAt' }, // Automatically add `viewedAt` timestamp when the view is created
  }
);

const View = mongoose.models.View || mongoose.model("View", viewsSchema);
export default View;

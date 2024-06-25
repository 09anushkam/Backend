import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    diagnosedwith: {
      type: String,
      required: true,
    },
    prescribedMedications: {
      type: String,
      required: true,
    },
    wardno: {
      type: String,
      required: true,
    },
    dischargeStatus: {
      type: String,
      required: true,
    },
    bill: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Patient = mongoose.model('Patient', patientSchema);

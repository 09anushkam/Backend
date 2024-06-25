import mongoose from 'mongoose';

const medicalrecordSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    diagnosedwith: {
      type: String,
      required: true,
    },
    pastTreatments: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    mobilenumber: {
      type: Number,
      required: true,
    },
    bloodgroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    admittedIn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
  },
  { timestamps: true }
);

export const Medicalrecord = mongoose.model(
  'Medicalrecord',
  medicalrecordSchema
);

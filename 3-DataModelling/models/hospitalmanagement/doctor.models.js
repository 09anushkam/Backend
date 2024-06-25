import mongoose from 'mongoose';

const hospitalHourSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
  },
  hour: {
    type: Number,
    required: true,
  },
});

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
    },
    experienceInYears: {
      type: Number,
      default: 0,
    },
    worksInHospitals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
      },
    ],
    hospitalHours: [hospitalHourSchema],
  },
  { timestamps: true }
);

export const Doctor = mongoose.model('Doctor', doctorSchema);


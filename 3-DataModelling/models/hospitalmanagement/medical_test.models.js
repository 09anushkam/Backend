import mongoose from 'mongoose';

const medicaltestSchema = new mongoose.Schema({
  testType: {
    type: String,
    required: true,
  },
  patient: {
    type: String,
    required: true,
  },
  testreportResults: {
    type: String,
    required: true,
  },
});

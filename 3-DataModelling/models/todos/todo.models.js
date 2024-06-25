import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    complete:{
      type:Boolean,
      default:false,
    },
    createdBy:{
      type:mongoose.Schema.Types.ObjectId, //refernce type
      ref:"User",  //reference
    },
    subTodos:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subtodo",
      }
    ], // Array of subtodos
  },
  { timestamps: true }
);

export const Todo = mongoose.model('Todo', todoSchema);

//import './config.mjs';
import mongoose from 'mongoose';


console.log(process.env.DSN)
// Connect to MongoDB
mongoose.connect(process.env.DSN);
// my schema goes here!
const Review= new mongoose.Schema({
    courseNumber: String,
    courseName: String,
    semester: String,
    year: Number,
    professor: String,
    review: String
});
mongoose.model('Review', Review);

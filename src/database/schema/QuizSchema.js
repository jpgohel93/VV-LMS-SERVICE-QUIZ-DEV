const mongoose = require('mongoose');
 
const Schema = mongoose.Schema;

const QuizSchema = new Schema({
    title: String,
    description: String,
    category_id: [String],
    sub_category_id: [String],
    course_id: [String],
    publisher_id: String,
    tags: [String],
    instructor_id: String,
    level: String, //Beginner, Intermediate, Expert 
    banner: String,
    thumbnail_image: String,
    is_limit_attempts: Boolean,
    limit_attempt: Number,
    is_time_limit: Boolean,
    time_limit: String,
    is_question_time_limit: Boolean,
    question_time_limit: String,
    passing_type: Number, // 1 = question based, 2 = point based
    passing_points: Number,
    passing_questions: Number, // Passed by question means when student entered 5 right answer to passed quiz
    passing_percentage: Number, // Passed by question means when student entered 50% right answers to passed quiz
    question_point:  {
        type: Number,
        default: 1
    },
    negative_point: {
        type: Number,
        default: 0
    },
    questions: [{
        question: String,
        question_type: Number, // 1. multiple Answer, 2. true/false, 3. single Answer
        image: String,
        thumbnail_image: String,
        options:[{
            option_text: String,
            image_file: String,
            is_correct_answer: Boolean
        }],
        tags: [String],
        points: Number,
        explanation: String,
        short_order: Number
    }],
    is_deleted: {
        type: Boolean,
        default: false
    }
},{ timestamps: true }); 

QuizSchema.index( { questions : 1 } )
QuizSchema.index( { tags : 1 } )

module.exports =  mongoose.model('quiz', QuizSchema);
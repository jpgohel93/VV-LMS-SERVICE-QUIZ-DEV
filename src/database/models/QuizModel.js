const { QuizSchema } = require('../schema');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
 
const createQuiz = async (insertData) => {

    const quiz = new QuizSchema(insertData)

    const quizResult = await quiz.save().then((data) => {
        return data
    }).catch((err) => {
        return false
    });

    return quizResult;
}
 
const updateQuiz = async (id,updateData) => {

    const quizResult = QuizSchema.updateOne({_id: id}, updateData).then((model) => {
        return true
    }).catch((err) => {
        return false
    });

   return quizResult;
}

const fatchQuizById = async (id) => {
    const quizData = await QuizSchema.findById(id).then((data) => {
        return data
    }).catch((err) => {
        return null
    });
    return quizData;
}

const fatchQuizs = async (search,publisher_id) => {

    let searchFilter = [
        {
            is_active: true
        },
        {
            is_deleted: false
        }
    ];

    if(publisher_id !== '' && publisher_id !== undefined && publisher_id !== 0){
        searchFilter.push({
            publisher_id: publisher_id
        })
    }

    if(search !== ''){
        searchFilter.push({
            title: { $regex: '.*' + search + '.*',$options:'i' }
        })
    }
    

    const quizData = await QuizSchema.find({ 
        $and: searchFilter
    }).then((data) => {
        return data
    }).catch((err) => {
        return null
    });
    return quizData;
}

const fatchQuizList = async (search,start, limit,publisher_id) => {

    let searchFilter = [];

    if(publisher_id !== '' && publisher_id !== undefined && publisher_id !== 0){
        searchFilter.push({
            publisher_id: publisher_id
        })
    }

    if(search !== ''){
        searchFilter.push({
            title: { $regex: '.*' + search + '.*',$options:'i' }
        })
    }

    searchFilter.push({
        is_deleted: false
    })

    let conditions = {}
    if(searchFilter.length > 0){
        conditions = {
            $and: searchFilter
        }
    }

    const quizData = await QuizSchema.find(conditions).skip(start).limit(limit).then((data) => {
        return data
    }).catch((err) => {
        return null
    });
    return quizData;
}

const countQuiz = async (search,publisher_id) => {

    let searchFilter = [
        {
            is_deleted: false
        }
    ];

    if(publisher_id !== '' && publisher_id !== undefined && publisher_id !== 0){
        searchFilter.push({
            publisher_id: publisher_id
        })
    }

    if(search !== ''){
        searchFilter.push({
            title: { $regex: '.*' + search + '.*',$options:'i' }
        })
    }
    

    const quizData = await QuizSchema.count({ 
        $and: searchFilter
    }).then((data) => {
        return data
    }).catch((err) => {
        return null
    });
    return quizData;
}


const createQuestion = async (id,question) => {

    const questionResult = await QuizSchema.findOneAndUpdate({_id: id}, { $push:  { questions : question } }, { new: true }).then((model) => {
        return model
    }).catch((err) => {
        return false
    });

    return questionResult;
}

const updateQuestion = async (id,question) => {

    const questioneResult =  await QuizSchema.findOneAndUpdate({ "questions._id": id }, { $set: question }).then((model) => {
        return true
    }).catch((err) => {
        return false
    });

   return questioneResult;
}

const deleteQuestion = async (quiz_id,question_id) => {

    const questionData = await QuizSchema.findOneAndUpdate({ _id: quiz_id }, { $pull: { "questions": { _id: question_id } } }, { new: true }).then((model) => {
        return true
    }).catch((err) => {
        return false
    });
      
    return questionData;
}

const getSingleQuestion = async (question_id) => {

    const questionData = await QuizSchema.aggregate([
        { $unwind: "$questions" },
        { 
            $match: {
                "questions._id": new ObjectId(question_id)
            }
        },{
            $project:{
                questions: 1
            }
        }
    ]).then(async (data) => {
            return data
    }).catch((err) => {
            return null
    });

    return questionData;
}

const getQuizList = async (userFilter) => {

    let filter = [];

    if(userFilter.search){
        filter.push({
            title: { $regex: '.*' + userFilter.search + '.*', $options:'i' }
        })
    }

    if(userFilter.publisher_id){
        filter.push({
            publisher_id: userFilter.publisher_id
        })
    }

    filter.push({
        is_deleted: false
    })

    //check having a questions or not
    filter.push({ "questions.0": { $exists: true } })

    let getFilterData =  await QuizSchema.find( { $and: filter }, {_id: 1,title: 1}).skip(userFilter.page).limit(userFilter.perPage).sort({ createdAt: -1 }).then((data) => {
        return data
    }).catch((err) => {
        return null
    });

    return getFilterData;
}

module.exports = {
    createQuiz,
    fatchQuizById,
    updateQuiz,
    fatchQuizs,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getSingleQuestion,
    fatchQuizList,
    countQuiz,
    getQuizList
}
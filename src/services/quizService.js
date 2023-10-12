const { QuizModel } = require("../database");
const constants = require('../utils/constant');
const { CallCourseEvent, CallQuizEvent, CallEventBus, CallAdminEvent, CallCourseEvents, CallPublisherEvents } = require('../utils/call-event-bus');
const { deleteFile, deleteMultipleFiles } = require('../utils/aws');
 
const getRelatedToTags = async (userInput, request) => {
    try{
        const { publisher_id, search } = userInput;
        let courseData = await CallCourseEvent("get_courses_related_to_courses", { publisher_id, search }, request.get("Authorization"));

        let relatedArray = [];

        await courseData.map(async (element) => {
            await relatedArray.push({
                id: element.course_id,
                name: element.course_title,
                type: "course"
            })

            if(element.subjects.length > 0){
                await element.subjects.map(async (subjectElement) => {
                    await relatedArray.push({
                        id: subjectElement.subject_id,
                        name: subjectElement.subject_name,
                        type: "subject"
                    })
                })
            }
            if(element.lending_page.length > 0){
                await element.lending_page.map(async (sectionElement) => {
                    await relatedArray.push({
                        id: sectionElement.section_id,
                        name: sectionElement.section_title,
                        type: "section"
                    })
                })
            }
        });

        return {
            status: true,
            status_code: constants.SUCCESS_RESPONSE,
            message: "Data get successfully",
            data:relatedArray
        };
    }catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error detected :: ',error)
        return {
            status: false,
            status_code: constants.EXCEPTION_ERROR_CODE,
            message: 'An unexpected error occurred',
            error: { server_error: 'An unexpected error occurred' },
            data: null,
        };
     }
}

const createQuiz = async (userInput, request) => {
    try{
        const { publisher_id, title, description, category_id, sub_category_id, tags,instructor, level,banner , thumbnail_image, course_id} = userInput;


        const createQuiz = await QuizModel.createQuiz({ 
            publisher_id: publisher_id,
            title: title, 
            category_id: category_id, 
            sub_category_id: sub_category_id,
            tags: tags,
            instructor_id: instructor,
            description: description,
            level: level,
            banner: banner,
            thumbnail_image: thumbnail_image,
            course_id: course_id
        });

        if(createQuiz !== false){

            if(tags && tags.length > 0){
                let tagArray = []
                tags.map(tagData => {
                    tagArray.push({
                        tag_name: tagData
                    })
                });
                if(tagArray.length > 0){
                    request['body']['tag_name'] = tagArray
                    //call event bus 
                    CallEventBus("add_tags",request)
                }
            }

            let quizId = createQuiz._id;
            CallQuizEvent("create_quiz",{ quiz_id: quizId,publisher_id, title, description, category_id, sub_category_id, tags,instructor, level,banner, thumbnail_image, course_id }, request.get("Authorization"));

            return {
                status: true,
                status_code: constants.SUCCESS_RESPONSE,
                message: "Quiz created successfully",
                id: quizId,
                banner_image: banner
            };
        }else{
            return {
                status: false,
                status_code: constants.DATABASE_ERROR_RESPONSE,
                message: "Failed to create quiz",
                id: null
            };
        }
    }catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error detected :: ',error)
        return {
            status: false,
            status_code: constants.EXCEPTION_ERROR_CODE,
            message: 'An unexpected error occurred',
            error: { server_error: 'An unexpected error occurred' },
            data: null,
        };
     }
}

const updateQuiz = async (userInput, request) => {
    try{
        let { id, title, description, category_id, sub_category_id, tags,instructor, level,banner, thumbnail_image, course_id } = userInput;

        let updateData = { 
            title: title, 
            category_id: category_id, 
            sub_category_id: sub_category_id,
            tags: tags,
            instructor_id: instructor,
            description: description,
            level: level,
            course_id: course_id
        }
        const getQuizData = await QuizModel.fatchQuizById(id);
        
        if(banner){
            updateData['banner'] = banner

            if(getQuizData !== null &&  getQuizData?.banner){
                let filePath =  getQuizData.banner; 
                await deleteFile(filePath);
            }
        }else{
            banner = getQuizData?.banner ? getQuizData.banner : ''
        }

        if(thumbnail_image){
            updateData['thumbnail_image'] = thumbnail_image

            if(getQuizData !== null &&  getQuizData?.thumbnail_image){
                let filePath =  getQuizData.thumbnail_image; 
                await deleteFile(filePath);
            }
        }else{
            thumbnail_image = getQuizData?.thumbnail_image ? getQuizData.thumbnail_image : ''
        }
        
        const createQuiz = await QuizModel.updateQuiz(id,updateData);

        if(createQuiz !== false){

            if(tags && tags.length > 0){
                let tagArray = []
                tags.map(tagData => {
                    tagArray.push({
                        tag_name: tagData
                    })
                });
                if(tagArray.length > 0){
                    request['body']['tag_name'] = tagArray
                    //call event bus 
                    CallEventBus("add_tags",request)
                }
            }

            CallQuizEvent("update_quiz",{ quiz_id: id, title, description, category_id, sub_category_id, tags,instructor, level,banner, thumbnail_image, course_id }, request.get("Authorization"));

            return {
                status: true,
                status_code: constants.SUCCESS_RESPONSE,
                message: "Quiz updated successfully",
                banner_image: banner
            };
        }else{
            return {
                status: false,
                status_code: constants.DATABASE_ERROR_RESPONSE,
                message: "Failed to update quiz"
            };
        }
    }catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error detected :: ',error)
        return {
            status: false,
            status_code: constants.EXCEPTION_ERROR_CODE,
            message: 'An unexpected error occurred',
            error: { server_error: 'An unexpected error occurred' },
            data: null,
        };
     }
}

const getQuizList = async (userInputs) => {
    try{
        const { search, startToken, endToken, publisher_id  } = userInputs;

        const perPage = parseInt(endToken) || 10; 
        let page = Math.max((parseInt(startToken) || 1) - 1, 0); 
        if (page !== 0) { 
            page = perPage * page; 
        }

        const getQuizData = await QuizModel.fatchQuizList(search, page, perPage, publisher_id);
        const getQuizCount = await QuizModel.countQuiz(search, publisher_id);
        
        if(getQuizData !== null){
            return {
                status: true,
                status_code: constants.SUCCESS_RESPONSE,
                message: "Data get successfully",
                data: getQuizData,
                record_count: getQuizCount
            };
        }else{
            return {
                status: false,
                status_code: constants.DATABASE_ERROR_RESPONSE,
                message: "Data not found",
                data: null,
                record_count: 0
            };
        }
    }catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error detected :: ',error)
        return {
            status: false,
            status_code: constants.EXCEPTION_ERROR_CODE,
            message: 'An unexpected error occurred',
            error: { server_error: 'An unexpected error occurred' },
            data: null,
        };
    }
}

const getQuizById = async (userInputs, req) => {
    try{
        const { quiz_id  } = userInputs;

        const getQuizData = await QuizModel.fatchQuizById(quiz_id);
        
        if(getQuizData !== null){

            let categoryId = getQuizData.category_id
            if(categoryId && categoryId.length > 0){
                const getCategoryData = await CallAdminEvent("get_category_data",{ category_id_array: categoryId }, req.get("Authorization"));

                if(getCategoryData){
                    await getQuizData.set('category', getCategoryData ,{strict:false})
                }
            }
        

            let subcategoryId = getQuizData.sub_category_id
            if(subcategoryId && subcategoryId.length > 0){
                const getSubCategoryData = await CallAdminEvent("get_sub_category_data",{ sub_category_id_array: subcategoryId }, req.get("Authorization"));

                if(getSubCategoryData){
                    await getQuizData.set('sub_category', getSubCategoryData ,{strict:false})
                }
            }

            let courseId = getQuizData.course_id
            if(courseId && courseId.length > 0){
                const courseData = await CallCourseEvents("get_course_data",{ course_id_array: courseId }, req.get("Authorization"));

                if(courseData && courseData.length >0){
                    await getQuizData.set('course', courseData ,{strict:false})
                }
            }

            let instructorId = getQuizData.instructor_id
            if(instructorId){
                const instructorData = await CallPublisherEvents("get_teacher_by_id",{ id: instructorId }, req.get("Authorization"));
                if(instructorData){
                    let instructor = {
                        _id: instructorData._id,
                        first_name: instructorData.first_name,
                        last_name: instructorData.last_name
                    }
                    await getQuizData.set('instructor', instructor ,{strict:false})
                }
            }

            if (getQuizData?.questions?.length > 0) {
                getQuizData.questions.sort((a, b) => a.short_order - b.short_order);
            }
            
            return {
                status: true,
                status_code: constants.SUCCESS_RESPONSE,
                message: "Data get successfully",
                data: getQuizData
            };
        }else{
            return {
                status: false,
                status_code: constants.DATABASE_ERROR_RESPONSE,
                message: "Data not found",
                data: null
            };
        }
    }catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error detected :: ',error)
        return {
            status: false,
            status_code: constants.EXCEPTION_ERROR_CODE,
            message: 'An unexpected error occurred',
            error: { server_error: 'An unexpected error occurred' },
            data: null,
        };
     }
}


const updateQuizSetting = async (userInput, request) => {
    try{
        const { id, is_limit_attempts, limit_attempt, is_time_limit, time_limit,is_question_time_limit, question_time_limit, passing_type, passing_points, passing_questions,passing_percentage,  question_point, negative_point } = userInput;
        
        const createQuiz = await QuizModel.updateQuiz(id, { 
            is_limit_attempts: is_limit_attempts, 
            limit_attempt: limit_attempt, 
            is_time_limit: is_time_limit, 
            time_limit: time_limit,
            is_question_time_limit: is_question_time_limit, 
            question_time_limit: question_time_limit, 
            passing_type: passing_type, 
            passing_points: passing_points,
            passing_questions: passing_questions,
            passing_percentage: passing_percentage,
            question_point: question_point,
            negative_point: negative_point
        });

        if(createQuiz !== false){
            CallQuizEvent("update_quiz_setting",{ id, is_limit_attempts, limit_attempt, is_time_limit, time_limit,is_question_time_limit, question_time_limit, passing_type, passing_points, passing_questions,passing_percentage,  question_point, negative_point }, request.get("Authorization"));

            return {
                status: true,
                status_code: constants.SUCCESS_RESPONSE,
                message: "Quiz updated successfully",
                id: id
            };
        }else{
            return {
                status: false,
                status_code: constants.DATABASE_ERROR_RESPONSE,
                message: "Failed to updated quiz",
                id: null
            };
        }
    }catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error detected :: ',error)
        return {
            status: false,
            status_code: constants.EXCEPTION_ERROR_CODE,
            message: 'An unexpected error occurred',
            error: { server_error: 'An unexpected error occurred' },
            data: null,
        };
     }
}

const addQuizQuestion= async (userInput, request) => {
    try{
        const { id, question, image, options,tags, points, explanation, thumbnail_image } = userInput;
        
        const createQuiz = await QuizModel.createQuestion(id, { 
            question: question, 
            image: image, 
            options: options,
            tags: tags, 
            points: points, 
            explanation: explanation,
            short_order: 1,
            thumbnail_image: thumbnail_image
        });

        if(createQuiz !== false){
            let questionId = createQuiz.questions[createQuiz.questions.length - 1]._id

            if(tags && tags.length > 0){
                let tagArray = []
                tags.map(tagData => {
                    tagArray.push({
                        tag_name: tagData
                    })
                });
                if(tagArray.length > 0){
                    request['body']['tag_name'] = tagArray
                    //call event bus 
                    CallEventBus("add_tags",request)
                }
            }

            CallQuizEvent("add_quiz_question",{ id,questions_id:questionId, question, image, options,tags, points, explanation, thumbnail_image }, request.get("Authorization"));

            return {
                status: true,
                status_code: constants.SUCCESS_RESPONSE,
                message: "Question added successfully",
                id: questionId
            };
        }else{
            return {
                status: false,
                status_code: constants.DATABASE_ERROR_RESPONSE,
                message: "Failed to add the question",
                id: null
            };
        }
    }catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error detected :: ',error)
        return {
            status: false,
            status_code: constants.EXCEPTION_ERROR_CODE,
            message: 'An unexpected error occurred',
            error: { server_error: 'An unexpected error occurred' },
            data: null,
        };
     }
}

const updateQuizQuestion= async (userInput, request) => {
    try{
        const { questions_id, question, image, options,tags, points, explanation, thumbnail_image } = userInput;
        
        const createQuiz = await QuizModel.updateQuestion(questions_id, { 
            "questions.$.question": question, 
            "questions.$.image": image, 
            "questions.$.options": options,
            "questions.$.tags": tags, 
            "questions.$.points": points, 
            "questions.$.explanation": explanation,
            "questions.$.thumbnail_image": thumbnail_image
        });

        if(createQuiz !== false){

            if(tags && tags.length > 0){
                let tagArray = []
                tags.map(tagData => {
                    tagArray.push({
                        tag_name: tagData
                    })
                });
                if(tagArray.length > 0){
                    request['body']['tag_name'] = tagArray
                    //call event bus 
                    CallEventBus("add_tags",request)
                }
            }

            CallQuizEvent("update_quiz_question",{ questions_id:questions_id, question, image, options,tags, points, explanation, thumbnail_image }, request.get("Authorization"));

            return {
                status: true,
                status_code: constants.SUCCESS_RESPONSE,
                message: "Question updated successfully",
            };
        }else{
            return {
                status: false,
                status_code: constants.DATABASE_ERROR_RESPONSE,
                message: "Failed to update the question",
            };
        }
    }catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error detected :: ',error)
        return {
            status: false,
            status_code: constants.EXCEPTION_ERROR_CODE,
            message: 'An unexpected error occurred',
            error: { server_error: 'An unexpected error occurred' },
            data: null,
        };
    }
}

const deleteQuiz = async (userInput, request) => {
    try{
        const { quiz_id } = userInput;

        const getQuizData = await QuizModel.fatchQuizById(quiz_id);
        
        if(getQuizData !== null &&  getQuizData?.banner){
            let filePath =  getQuizData.banner; 
            await deleteFile(filePath);
        }
        if(getQuizData !== null &&  getQuizData?.thumbnail_image){
            let filePath =  getQuizData.thumbnail_image; 
            await deleteFile(filePath);
        }
        
        if(getQuizData !== null && getQuizData?.questions?.length > 0){
            let questionsArray =  getQuizData.questions; 

            let imageList = []
            await Promise.all(
                await questionsArray.map(async (element, key) => {
                    if(element.image !== undefined && element.image !== '' && element.image !== null){
                        imageList[key] = element.image
                    }   
                })
            )
            if(imageList.length > 0){
                await deleteMultipleFiles(imageList)
            }
        }

        
        const deleteQuiz = await QuizModel.updateQuiz(quiz_id,{ 
            is_deleted: true
        });

        if(deleteQuiz !== false){
            CallQuizEvent("delete_quiz",{ quiz_id: quiz_id }, request.get("Authorization"));

            return {
                status: true,
                status_code: constants.SUCCESS_RESPONSE,
                message: "Quiz deleted successfully",
            };
        }else{
            return {
                status: false,
                status_code: constants.DATABASE_ERROR_RESPONSE,
                message: "Failed to deleted quiz",
            };
        }
    }catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error detected :: ',error)
        return {
            status: false,
            status_code: constants.EXCEPTION_ERROR_CODE,
            message: 'An unexpected error occurred',
            error: { server_error: 'An unexpected error occurred' },
            data: null,
        };
    }
}

const deleteQuestion= async (userInput, request) => {
    try{
        const { quiz_id, question_id } = userInput;

        //delete question image
        const questionData = await QuizModel.getSingleQuestion(question_id)

        if(questionData !== null && questionData.length > 0){
            let file =  questionData[0].questions.image; 
            
            if(file !== undefined && file !== null && file !== ''){
                await deleteFile(file);
            }
        }
        
        const deleteQuiz = await QuizModel.deleteQuestion(quiz_id, question_id);

        if(deleteQuiz !== false){
            CallQuizEvent("delete_quiz_question",{ quiz_id: quiz_id, question_id: question_id }, request.get("Authorization"));

            return {
                status: true,
                status_code: constants.SUCCESS_RESPONSE,
                message: "Quiz deleted successfully",
            };
        }else{
            return {
                status: false,
                status_code: constants.DATABASE_ERROR_RESPONSE,
                message: "Failed to deleted quiz",
            };
        }
    }catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error detected :: ',error)
        return {
            status: false,
            status_code: constants.EXCEPTION_ERROR_CODE,
            message: 'An unexpected error occurred',
            error: { server_error: 'An unexpected error occurred' },
            data: null,
        };
    }
}

const changeQuestionPostion= async (userInput, request) => {
    try{
        const { questions_id } = userInput;
        
        questions_id.map(async (question_id, question_key) => {
            await QuizModel.updateQuestion(question_id, { 
                "questions.$.short_order": question_key + 1
            });
        });


        CallQuizEvent("change_quiz_question_postion",{ questions_id  }, request.get("Authorization"));

        return {
            status: true,
            status_code: constants.SUCCESS_RESPONSE,
            message: "Question position changed successfully",
        };
    }catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error detected :: ',error)
        return {
            status: false,
            status_code: constants.EXCEPTION_ERROR_CODE,
            message: 'An unexpected error occurred',
            error: { server_error: 'An unexpected error occurred' },
            data: null,
        };
    }
}


const quizDropdown = async (userInputs) => {
    try{
        const {  startToken, endToken, publisher_id, search } = userInputs;

        const perPage = parseInt(endToken) || 10; 
        let page = Math.max((parseInt(startToken) || 1) - 1, 0); 
        if (page !== 0) { 
            page = perPage * page; 
        }

        let getQuizList = await QuizModel.getQuizList({ page , perPage, publisher_id, search });

        if(getQuizList !== null){
            return {
                status: true,
                status_code: constants.SUCCESS_RESPONSE,
                message: "Data get successfully",
                data: getQuizList
            };
        }else{
            return {
                status: false,
                status_code: constants.DATABASE_ERROR_RESPONSE,
                message: "Data not found",
                data: null
            };
        }
    }catch (error) {
        // Handle unexpected errors
        console.error('Error in quizDropdown:', error);
        return {
            status: false,
            status_code: constants.EXCEPTION_ERROR_CODE,
            message: 'Failed to fetch quiz data',
            error: { server_error: 'An unexpected error occurred' },
            data: null,
        };
    }
}


module.exports = { 
    getRelatedToTags,
    createQuiz,
    updateQuizSetting,
    addQuizQuestion,
    updateQuizQuestion,
    updateQuiz,
    deleteQuiz,
    deleteQuestion,
    changeQuestionPostion,
    getQuizList,
    getQuizById,
    quizDropdown
}
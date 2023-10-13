const quizService = require('../services/quizService');
const UserAuth = require('./middleware/auth');
const { createS3Client, deleteFile } = require('../utils/aws');

module.exports = async (app) => {
	let uploadFile = await createS3Client("quiz");

	app.post('/quiz/searchRelatedToTags', UserAuth, async (req, res, next) => {
		const { publisher_id, search } = req.body;

		const data = await quizService.getRelatedToTags({ publisher_id, search }, req);

		res.status(data.status_code).json(data); 
	});

	app.post('/quiz/createquiz', UserAuth, uploadFile.fields([{name: "banner_image"}, {name: "thumbnail_image"}]), async (req, res, next) => {

		let bannerImage = req?.files?.banner_image ? (process.env.STORAGE_TYPE == "S3") ? `${process.env.STORAGE_TYPE}/${req?.files?.banner_image?.[0]?.key}` : `${process.env.STORAGE_TYPE}/${req?.files?.banner_image?.[0]?.filename}` : null
        let thumbnailImage = req?.files?.thumbnail_image ? (process.env.STORAGE_TYPE == "S3") ? `${process.env.STORAGE_TYPE}/${req?.files?.thumbnail_image?.[0]?.key}` : `${process.env.STORAGE_TYPE}/${req?.files?.thumbnail_image?.[0]?.filename}` : null

		const { publisher_id, title, description, category_id, sub_category_id, tags, instructor, level, course_id} = req.body;
		const data = await quizService.createQuiz({ publisher_id, title, description, category_id, sub_category_id, tags, instructor, level, banner: bannerImage,thumbnail_image: thumbnailImage, course_id }, req);

		res.status(data.status_code).json(data);
	});

	app.post('/quiz/updatequiz', UserAuth, uploadFile.fields([{name: "banner_image"}, {name: "thumbnail_image"}]), async (req, res, next) => {

		let bannerImage = req?.files?.banner_image ? (process.env.STORAGE_TYPE == "S3") ? `${process.env.STORAGE_TYPE}/${req?.files?.banner_image?.[0]?.key}` : `${process.env.STORAGE_TYPE}/${req?.files?.banner_image?.[0]?.filename}` : null;
        let thumbnailImage = req?.files?.thumbnail_image ? (process.env.STORAGE_TYPE == "S3") ? `${process.env.STORAGE_TYPE}/${req?.files?.thumbnail_image?.[0]?.key}` : `${process.env.STORAGE_TYPE}/${req?.files?.thumbnail_image?.[0]?.filename}` : null

		const { id, title, description, category_id, sub_category_id, tags, instructor, level, course_id } = req.body;
		const data = await quizService.updateQuiz({ id, title, description, category_id, sub_category_id, tags, instructor, level, banner: bannerImage,thumbnail_image: thumbnailImage, course_id }, req);

		res.status(data.status_code).json(data);
	});

	app.post('/quiz/getquizlist', UserAuth, async (req,res,next) => {

        const { search, startToken, endToken, publisher_id } = req.body;
      
        const data = await quizService.getQuizList({ search, startToken, endToken, publisher_id });
    
        res.status(data.status_code).json(data);
    });

	app.post('/quiz/getquizbyid', UserAuth, async (req,res,next) => {

        const { quiz_id } = req.body;
        const data = await quizService.getQuizById({ quiz_id }, req);
  
        res.status(data.status_code).json(data);
    });


	app.post('/quiz/quizsetting', UserAuth, async (req, res, next) => {

		const { id, is_limit_attempts, limit_attempt, is_time_limit, time_limit, is_question_time_limit, question_time_limit, passing_type, passing_points, passing_questions, passing_percentage, question_point, negative_point } = req.body;
		const data = await quizService.updateQuizSetting({ id, is_limit_attempts, limit_attempt, is_time_limit, time_limit, is_question_time_limit, question_time_limit, passing_type, passing_points, passing_questions, passing_percentage,  question_point, negative_point }, req);

		res.status(data.status_code).json(data);
	});

	app.post('/quiz/addquizquestion', UserAuth, async (req, res, next) => {

		const { id, question, image, options, tags, points, explanation, thumbnail_image, question_level } = req.body;
		const data = await quizService.addQuizQuestion({ id, question, image, options, tags, points, explanation, thumbnail_image }, req);

		res.status(data.status_code).json(data);
	});

	app.post('/quiz/uploadImage', UserAuth, uploadFile.single('option_image'), async (req, res, next) => {

		let optionImage = req?.file ? (process.env.STORAGE_TYPE == "S3") ? `${process.env.STORAGE_TYPE}/${req?.file?.key}` : `${process.env.STORAGE_TYPE}/${req?.file?.filename}` : null;

		res.status(200).json({
			status: true,
			filename: optionImage
		});
	});

	app.post('/quiz/deleteImage', UserAuth, async (req, res, next) => {

		const { file_name } = req.body;

		if(file_name !== undefined && file_name !== null && file_name !== ''){
			await deleteFile(file_name)
		}

		res.status(200).json({
			status: true
		});
	});

	app.post('/quiz/updatequizquestion', UserAuth, async (req, res, next) => {

		const { questions_id, question, image, options, tags, points, explanation, thumbnail_image, question_level } = req.body;
		const data = await quizService.updateQuizQuestion({ questions_id, question, image, options, tags, points, explanation, thumbnail_image }, req);

		res.status(data.status_code).json(data);
	});

	app.post('/quiz/deletequiz', UserAuth, async (req, res, next) => {
		const { quiz_id } = req.body;
		const data = await quizService.deleteQuiz({ quiz_id }, req);

		res.status(data.status_code).json(data);
	});


	app.post('/quiz/deletequizquestion', UserAuth, async (req, res, next) => {
		const { quiz_id, question_id } = req.body;
		const data = await quizService.deleteQuestion({ quiz_id, question_id }, req);

		res.status(data.status_code).json(data);
	});


	app.post('/quiz/changequestionpostion', UserAuth, async (req, res, next) => {

		const { questions_id } = req.body;
		const data = await quizService.changeQuestionPostion({ questions_id }, req);

		res.status(data.status_code).json(data);
	});


	app.post('/quiz/quizDropdown', UserAuth,async (req,res,next) => {

        const { startToken, endToken, publisher_id, search } = req.body;

        const data = await quizService.quizDropdown({ startToken, endToken, publisher_id, search  }); 

        res.status(data.status_code).json(data);
    });

} 
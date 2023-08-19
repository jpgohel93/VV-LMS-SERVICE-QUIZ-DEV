const { ValidateSignature } = require('../../utils');

module.exports = async (req,res,next) => {
    
    const isAuthorized = await ValidateSignature(req);

    if(isAuthorized){
        let userData = req.user;
        // let route = req.originalUrl.split( "/" )
        // let module = route?.[1] || null
        // let apiname = route?.[2] || null 

        if(userData.user_type === 3 || userData.user_type === 4){
            //publisher or manager
            return next();
        }else if(userData.user_type === 1 || userData.user_type === 2 || userData.user_type === 5 || userData.user_type === 6){
           
            return res.status(403).json({message: 'Not Authorized', status: false, status_code: 403})
        }
    }
    return res.status(403).json({message: 'Not Authorized', status: false, status_code: 403})
}
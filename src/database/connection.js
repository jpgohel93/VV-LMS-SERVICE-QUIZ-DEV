const mongoose = require('mongoose');

module.exports = async() => {
    try {
        var db_url = process.env.DEVELOPER_MODE == "development" ? process.env.DB_URL : process.env.DB_URL_LIVE;
        await mongoose.connect(db_url);
        console.log(`DB is successfully connected in ${process.env.DEVELOPER_MODE} mode.`);
        
    } catch (error) {
        console.error('Error ============ ON DB Connection')
        console.log(error);
    }
};

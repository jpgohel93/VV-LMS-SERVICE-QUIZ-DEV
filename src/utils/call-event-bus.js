const axios = require("axios");

module.exports.CallCourseEvent =  async (event_type, data, token) => {
    
    let header = {
        headers: {
            'Authorization': token 
        }
    }

    let bodyData = data;
    bodyData['event_type'] = event_type;

    return await axios.post(process.env.EVENT_BUS_URL+"/getCoursesRelatedToQuiz",bodyData,header).then((responsedata) => {
        return responsedata?.data?.data || null
    }).catch((err) => {
        console.log("error occured in ademin event bus", err.message);
        return false
    });
}

module.exports.CallQuizEvent =  async (event_type, data, token) => {
    
    let header = {
        headers: {
            'Authorization': token 
        }
    }

    let bodyData = data;
    bodyData['event_type'] = event_type;

    return await axios.post(process.env.EVENT_BUS_URL+"/quizeventbus",bodyData,header).then((responsedata) => {
        return responsedata?.data || null
    }).catch((err) => {
        console.log("error occured in ademin event bus", err.message);
        return false
    });
}

module.exports.CallEventBus =  async (event_type,data) => {

    const signature = data.get("Authorization");
    
    let header = {
        headers: {
            'Authorization': signature 
        }
    }

    let bodyData = data.body

    bodyData['event_type'] = event_type;

    return await axios.post(process.env.EVENT_BUS_URL+"/courseEvents",bodyData,header).then((responsedata) => {
        return responsedata?.data || null
    }).catch((err) => {
        console.log("error occured in ademin event bus", err.message);
        return false
    });
}

module.exports.CallAdminEvent =  async (event_type, data, token) => {
    
    let header = {
        headers: {
            'Authorization': token 
        }
    }

    let bodyData = data;
    bodyData['event_type'] = event_type;

    return await axios.post(process.env.EVENT_BUS_URL+"/adminEvents",bodyData,header).then((responsedata) => {
        return responsedata?.data?.data || null
    }).catch((err) => {
        console.log("error occured in ademin event bus", err.message);
        return false
    });
}

module.exports.CallCourseEvents =  async (event_type, data, token) => {
    
    let header = {
        headers: {
            'Authorization': token 
        }
    }

    let bodyData = data;
    bodyData['event_type'] = event_type;

    return await axios.post(process.env.EVENT_BUS_URL+"/courseEvents",bodyData,header).then((responsedata) => {
        return responsedata?.data?.data || null
    }).catch((err) => {
        console.log("error occured in ademin event bus", err.message);
        return false
    });
}

module.exports.CallPublisherEvents =  async (event_type, data, token) => {
    
    let header = {
        headers: {
            'Authorization': token 
        }
    }

    let bodyData = data;
    bodyData['event_type'] = event_type;
    return await axios.post(process.env.EVENT_BUS_URL+"/publisherEvents", bodyData, header).then((responsedata) => {
        return responsedata?.data?.data || null
    }).catch((err) => {
        console.log("error occured in ademin event bus", err.message);
        return false
    });
}

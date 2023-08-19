const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Utility functions
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    if(signature !== undefined){
      const payload = await jwt.verify(signature.split(" ")[1], process.env.JWT_SECRET_KEY);
      req.user = payload;
      return true;
    }else{
      return false;
    }
  } catch (error) {
    return false;
  }
};

module.exports.CheckPassword = async (password) => {
  var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
  if (regex.test(password)) {
      return true;
  }
  else {
      return false;
  }
};

module.exports.ValidateEmail = async (email) => {
  let regex = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/i;
  return regex.test(String(email).toLowerCase());
};

//verify the mobile no
module.exports.ValidateMobileNumber =  async (mobileNo) => {
  var regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (regex.test(mobileNo)) {
      return true;
  }
  else {
      return false;
  }
}
//generate random String
module.exports.randomString =  async (strLength) => {
  var result = '';
  var charSet = '';

  strLength = strLength || 5;
  charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  while (strLength--) { // (note, fixed typo)
      result += charSet.charAt(Math.floor(Math.random() * charSet.length));
  }

  return result;
}

// get the array index data
module.exports.ArrayColumn = (arr, index) => {
  return arr.map(x => x[index]);
}


const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jsSHA = require('jssha');

async function signIn (info) {
  
  let result = await userModel.getUserInfo(info.name);
  
  if(result[0].password){
    let nowTime = Math.floor(new Date().getTime()/60000);
    let shaObj = new jsSHA('SHA-512','TEXT');
    shaObj.update(result[0].password);
    shaObj.update(nowTime.toString());
    let password = shaObj.getHash('HEX');
    let shaObjBefore = new jsSHA('SHA-512','TEXT');
    shaObjBefore.update(result[0].password);
    shaObjBefore.update((nowTime-1).toString());
    let passwordBefore = shaObjBefore.getHash('HEX');
    let shaObjAfter = new jsSHA('SHA-512','TEXT');
    shaObjAfter.update(result[0].password);
    shaObjAfter.update((nowTime+1).toString());
    let passwordAfter = shaObjAfter.getHash('HEX')
    if((info.password === password) || (info.password === passwordBefore) || (info.password === passwordAfter)){
      let userInfo = {
        fileList: result[0].fileList,
        name: result[0].name
      };
      return userInfo;
    }else{
      return 'INCORRECT_NAME_OR_PASSWORD';
    }
  }else{
    return 'INCORRECT_NAME_OR_PASSWORD';
  }
}

async function signUp (info) {
  
  let result = await userModel.getUserInfo(info.name);

  // if(result.length == 0){
  //   let newUser = {
  //     name: info.name,
  //     password: info.password,
  //     fileList: []
  //     };
	//   userModel.addUser(newUser);
  //   return 'SIGN_UP_SUCCESS';
	// }
  // else{
	//   return 'USER_EXIST';
  // }
  if(result[0].password){
    return 'USER_EXIST';
  }else{
    let findObj = { name: info.name};
    let updatePasswordObj = { password: info.password};
    await userModel.updateUserInfo(findObj, updatePasswordObj);
    return 'SIGN_UP_SUCCESS';
  }
}

async function getSalt(userName){
  let result = await userModel.getUserInfo(userName);
  if(result.length == 0){
    let saltRounds = 10;
    let salt = bcrypt.genSaltSync(saltRounds);
    let newUser = {
      name: userName,
      salt: salt,
      password: '',
      fileList: []
    };
    userModel.addUser(newUser);
    return salt;
  }else{
    return result[0].salt;
  }
}

module.exports = {
  signIn: signIn,
  signUp: signUp,
  getSalt: getSalt
};






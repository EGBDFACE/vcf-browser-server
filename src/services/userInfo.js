const userModel = require('../models/userModel');

async function signIn (info) {
  
  let result = await userModel.getUserInfo(info.name);
  
  if(result.length == 0){
    return 'NO_SUCH_USER';
  }else if(result[0].password === info.password){
    return result[0];
  }else{
    return 'INCORRECT_PASSWORD';
  }

}

async function signUp (info) {
  
  let result = await userModel.getUserInfo(info.name);

  if(result.length == 0){
    
	let newUser = {
	  name: info.name,
	  password: info.password,
	  fileList: []
	  };

	userModel.addUser(newUser);
    	
    return 'SIGN_UP_SUCCESS';

	}
  else{
  	
	return 'USER_EXIST';

	}
}

module.exports = {
  signIn: signIn,
  signUp: signUp
  };






const pullChunkListService = require('../services/listService').getFileList;
const getChunkResult = require('../services/chunkService').getChunkResult;
// const signIn  = require('../services/userInfo').signIn;
// const signUp  = require('../services/userInfo').signUp;
const userService = require('../services/userInfo');

const getPullListRes = async function (ctx) {
  let fileMd5 = ctx.request.body.fileMd5,
      chunksNumber = ctx.request.body.chunksNumber,
	    userName = ctx.request.body.userName,
	    fileName = ctx.request.body.fileName;
  ctx.body = await pullChunkListService (fileMd5, chunksNumber, userName, fileName);
  
}

const getChunkRes = async function (ctx) {
  let chunk = {
    chunkMd5: ctx.request.body.chunkMd5,
    chunkData: ctx.request.body.chunkData,
    chunkNumber: ctx.request.body.chunkNumber,
	  fileMd5: ctx.request.body.fileMd5,
	  chunksNumber: ctx.request.body.chunksNumber
	};
  ctx.body = await getChunkResult(chunk);

}

const getUserInfo = async function (ctx) {
  const body = ctx.request.body;
  let info = {
    name: body.name,
	  password: body.password
	};
  ctx.body = await userService.signIn(info);
  };

const addUser = async function (ctx) {
  const body = ctx.request.body;
  let info = {
    name: body.name,
	  password: body.password
	};
  ctx.body = await userService.signUp(info);
};

const getSalt = async function (ctx) {
  let userName = ctx.request.body.name;
  ctx.body = await userService.getSalt(userName)
}

module.exports = {
  getPullListRes: getPullListRes,
  getChunkRes: getChunkRes,
  getUserInfo: getUserInfo,
  addUser: addUser,
  getSalt: getSalt
};

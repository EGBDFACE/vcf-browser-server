const pullChunkListService = require('../services/listService').getFileList;
const getChunkResult = require('../services/chunkService').getChunkResult;

const getPullListRes = async function (ctx) {
  let fileMd5 = ctx.request.body.fileMd5,
      chunksNumber = ctx.request.body.chunksNumber;

  ctx.body = await pullChunkListService (fileMd5, chunksNumber);
  
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

module.exports = {
  getPullListRes: getPullListRes,
  getChunkRes: getChunkRes
  };

const chunkModel = require('../models/chunkModel');
const listModel = require('../models/listModel');

let runVepOncotator = require('../utils/fileHandle/vepOncotator.js').runVepOncotator;

async function getChunkResult (chunk) {
  
  let chunkResult = [];
  
  if (chunk.chunkData.length !== 0) {
    chunkResult = await runVepOncotator(chunk);
	}
  
  let item = {
    chunkMd5: chunk.chunkMd5,
	chunkNumber: chunk.chunkNumber,
	chunkResult: chunkResult
	};
  await chunkModel.insertChunk(item);

  let result = await listModel.getList (chunk.fileMd5);

  let uploadedChunkList = result[0].uploadedChunkList;
  uploadedChunkList.push(chunk.chunkMd5);
  

  let findObj = {'fileMd5': chunk.fileMd5};
  let updateObj = {
    'uploadedChunkList': uploadedChunkList,
	'fileStatus': 'posting'
	};
  
  if (uploadedChunkList.length === chunk.chunksNumber) {
    updateObj.fileStatus = 'posted';
	}
  
  await listModel.updateItem (findObj, updateObj);
  item.uploadedChunkList = uploadedChunkList; 
  return item;
 }

 module.exports = {
   getChunkResult: getChunkResult
   };

    

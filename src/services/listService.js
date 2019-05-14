const chunkModel = require('../models/chunkModel');
const listModel = require('../models/listModel');
const userModel = require('../models/userModel');

async function getFileList (fileMd5, chunksNumber, userName, fileName) {

  if(userName){
	  
	  let preUserInfo = await userModel.getUserInfo(userName);
	  let preFileList = preUserInfo[0].fileList;
	  
	  if(JSON.stringify(preFileList).indexOf(fileMd5) === -1){
	  	
		let findObj = {name: userName};
		let updateFileListObj = { 
		  fileList: preFileList.concat([{fileName: fileName,fileMd5: fileMd5 }])
		  }

		await userModel.updateUserInfo(findObj, updateFileListObj);
		}
	}

  // 查询数据库文件状态
  let result = await listModel.getList(fileMd5);

  if (result.length === 0){
    let item = {
	  fileMd5: fileMd5,
	  chunksNumber: chunksNumber,
	  fileStatus: 'notPosted',
	  uploadedChunkData: [],
	  uploadedChunkList: []
	  };
	
	listModel.insertItem(item);
	
	return item;
	}
  else{
    let uploadedChunks = await chunkModel.getChunkData(fileMd5);
		let data = [];
    let uploadedChunkList = result[0].uploadedChunkList;

	for (let i=0; i<uploadedChunks.length; i++) {
	  data = data.concat(uploadedChunks[i].chunkResult);
	  }
//    let uploadedChunkList = result[0].uploadedChunkList;
//	let data = [];
//
//	for (let i=0;i<uploadedChunkList.length;i++) {
//	  let chunkItem = await chunkModel.getChunkData(uploadedChunkList[i]);
//	  data = data.concat(chunkItem[0].chunkResult);
//	  }
	
	let item = {
	  fileMd5: fileMd5,
	  chunksNumber: chunksNumber,
	  fileStatus: result[0].fileStatus,
	  uploadedChunkList: uploadedChunkList,
	  uploadedChunkData: data
	  };
    
	return item;
	}
}

module.exports = {
  getFileList: getFileList
  };

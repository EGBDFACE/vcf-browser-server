const chunkModel = require('../models/chunkModel');
const listModel = require('../models/listModel');

async function getFileList (fileMd5, chunksNumber) {
  
  // 查询数据库文件状态
  let result = await listModel.getList(fileMd5);

  if (result.length === 0){
    let item = {
	  fileMd5: fileMd5,
	  chunksNumber: chunksNumber,
	  fileStatus: 'notPosted',
	  uploadedChunkList: []
	  };
	
	listModel.insertItem(item);

	return item;
	}
  else{
    let uploadedChunkList = result[0].uploadedChunkList;
	let data = [];

	for (let i=0;i<uploadedChunkList.length;i++) {
	  let chunkItem = await chunkModel.getChunkData(uploadedChunkList[i]);
	  data = data.concat(chunkItem[0].chunkResult);
	  }
	
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

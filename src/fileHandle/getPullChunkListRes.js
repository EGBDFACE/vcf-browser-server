const fs = require('fs');
const url = require('url');

function getPullChunkListRes(req,res,chunkList){
  
  let params = url.parse(req.url,true).query;

  const DIR_PATH = `/home/jackchu/vcf-browser-server/src/fileUpload/${params.fileMd5}`;
  const FILE_UPLOAD_PATH = '/home/jackchu/vcf-browser-server/src/fileUpload';

  if(chunkList.fileMd5 == params.fileMd5){
	let resData = readCombineFile(chunkList,params);
	res.send(resData);
	}
  else if(chunkList.fileMd5 != params.fileMd5){
    if(chunkList.fileMd5){
      fs.writeFile(FILE_UPLOAD_PATH + `/${chunkList.fileMd5}/list.json`,JSON.stringify(chunkList),err=>{
	    if(err) throw err;
	    });
	  }
	if(fs.existsSync(DIR_PATH+'/list.json')){
	  let listData = JSON.parse(fs.readFileSync(DIR_PATH + '/list.json'));
	  chunkList.fileMd5 = listData.fileMd5;
	  chunkList.fileStatus = listData.fileStatus;
	  chunkList.uploadedChunk = listData.uploadedChunk;
	  chunkList.chunksNumber = listData.chunksNumber;
	  let resData = readCombineFile(chunkList, params)
	  res.send(resData);
	  }
	else{
	  fs.mkdir(DIR_PATH,err=>{
	    if(err) throw err;
		});
	  chunkList.fileMd5 = params.fileMd5;
	  chunkList.fileStatus = 'notposted';
	  chunkList.chunksNumber = params.chunksNumber;
	  chunkList.uploadedChunk = [];
	  let resData = readCombineFile(chunkList, params)
	  res.send(resData);
	  }
  }
}

function readCombineFile(chunkList, params){
  let result = [],list = chunkList.uploadedChunk;
  const DIR_PATH = `/home/jackchu/vcf-browser-server/src/fileUpload/${params.fileMd5}`;
  
  for(let i=0; i< list.length; i++){
    let combineFilePath = `${DIR_PATH}/${list[i].chunkMd5}_combine_data.txt`;
	if(fs.existsSync(combineFilePath)){
	  result = result.concat(JSON.parse(fs.readFileSync(combineFilePath,'utf-8')));
	  }
	}
  let resData = JSON.parse(JSON.stringify(chunkList));
  resData.uploadedChunksCombineData = result;
  console.log(chunkList);
  return resData;
  }

module.exports = {
  getPullChunkListRes : getPullChunkListRes
  }

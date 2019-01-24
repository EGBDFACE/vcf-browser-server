//http.createServer(function (req, res) {
//  res.writeHead(200, {'Content-Type': 'text/plain'});
//  res.end('Hello World\n');
//}).listen(1337,'222.20.79.250');
//console.log('Server running at http://127.0.0.1:1337/');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var url = require('url');

let chunkList = {
  fileMd5:'',
  fileStatus: '',
  chunksNumber: 0,
  uploadedChunk:{
    chunkMd5:'',
	chunkNumber:0
	}
  };
app.all('*',function(req,res,next){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Content-Type','application/json');
  next();
});
app.options('/',function(req,res){
  res.statusCode = 200;
  res.end();
});
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb',extended: true}));
//app.post('/',function(req,res){
////  req.on('data',function(data){
////	console.log(data);
////	console.log('-------------------');
////	obj = JSON.parse(data);
////	console.log(obj);
////  });
//  var params = {chunks:[]};
//  fs.stat(`./fileUpload/${req.body.file.fileMd5}`,function(err,stats){
//	params.fileMd5 = req.body.file.fileMd5;
//	params.total = req.body.file.fileChunks;
//	params.uploaded = 0;
//	if(stats&&stats.isDirectory()){
//	    for(var i = 0;i < params.total;i++){
//		 // (function(j){
//		 //   params.chunks[j] = req.body.chunks[j];
//		 //   fs.stat(`./fileUpload/${params.fileMd5}/${req.body.chunks[j].chunkMd5}`,function(err,stats){
//		 //     if(stats&&stats.isFile()&&(stats.size === 5*1024*1024)){
//		 //     	params.uploaded++;
//		 //   	params.chunks[j].status = 'posted';
//		 //     }else{
////		 //       console.log(params.chunks[j]);
//		 //       params.chunks[j].status = 'posting';
//		 //     }
//		 //   });
//		 // })(i);
//		  params.chunks[i] = req.body.chunks[i];
//		  if(fs.existsSync(`./fileUpload/${params.fileMd5}/${req.body.chunks[i].chunkMd5}`)){
//		  	fs.statSync(`./fileUpload/${params.fileMd5}/${req.body.chunks[i].chunkMd5}`,function(err,stats){
//			  if(stats.size === 5*1024*1024){
//				params.uploaded++;
//				params.chunks[i].status = 'posted';
//			  }
//			});
//		  }else{
//		    params.chunks[i].status = 'posting';
//		  }
//		}
//	}else{
//	    fs.mkdirSync(`./fileUpload/${params.fileMd5}`);
//		for(var i = 0;i < params.total; i++){
//		  params.chunks[i] = req.body.chunks[i];
//		  params.chunks[i].status = 'posting';
////			console.log(params.chunks[i]);
//		}
//	}
//	console.log(params);
////	console.log('*************');
//  });
// // console.log(req.body);
// // console.log('---------------');
// // console.log(params);
//  res.end('preload success');
//});
app.param('fileLabel',function(req,res,next,fileLabel){
	console.log(fileLabel);
//	console.log(req.url);
//	let params = url.parse(req.url,true).query;
//	console.log(params);
////	if(fileLabel === 'upload_file_part'){
////	  let params = url.parse(req.url,true).query;
////	  let chunkMd5 = params.chunkMd5;
////	  try{
////	    fs.accessSync(`./fileUpload/${chunkMd5}`,fs.constants.F_OK);
////
	let params = url.parse(req.url,true).query;
	switch(fileLabel){
	  case 'pullChunkList':
	    if((chunkList.fileMd5 != '')&&(chunkList.fileMd5 == params.fileMd5)){
//		  chunkList.fileStatus = 'posting';
		  res.send(chunkList);
		  }
		else{
	      fs.readFile(`./fileUpload/${params.fileMd5}/list.json`,'utf8',(err,data)=>{
		    if(!data){
		      console.log('file not exist');
			  let sendObj = {
				fileStatus: 'notposted'
			  };
			  res.send(sendObj);
		      fs.mkdir(`./fileUpload/${params.fileMd5}`,(err)=>{
		  	    if(err) throw err;
		  	    });
		  	  if((chunkList.fileMd5 != params.fileMd5)&&(chunkList.fileMd5 != '')){
		  	    fs.writeFile(`./fileUpload/${chunkList.fileMd5}/list.json`,JSON.stringify(chunkList),(err) => {
		  	      if(err) throw err;
		  		  });
		  	    }
		  	  chunkList.fileMd5 = params.fileMd5;
		  	  chunkList.fileStatus = 'posting';
		  	  chunkList.chunksNumber = params.chunksNumber;
		  	  chunkList.uploadedChunk = [];
		  	  //let writeObj = {
		  	  //  fileStatus : 'notposted',
		  	  //  fileMd5: params.fileMd5,
		  	  //  chunksNumber: params.chunksNumber,
		  	  //  };}
		   	  //fs.writeFile(`./fileUpload/${params.fileMd5}/list.json`,JSON.stringify(obj),(err) =>{
		  	  //  if(err) throw err;
		  	  //  });
		      }
		    else{
		     let listObj = JSON.parse(data);
		     res.send(listObj);
		     chunkList = JSON.parse(data);
		     }
		    });
		 }
		break;
	  case 'upload_file_part':
	    console.log('upload file part to next');
	    next();
		break;
	  case 'checkoutInfo':
	    let checkObj = req.body;
		res.send('ok');
	}
});
app.post('/api/:fileLabel',function(req,res,next){
//	console.log('receive request from /api');
//	console.log(req.url);
	let params = url.parse(req.url,true).query;
//	console.log(params);
//	res.send('ok');
	console.log(chunkList);
	fs.writeFile(`./fileUpload/${params.fileMd5}/${params.chunkMd5}`,JSON.stringify(req.body),(err)=>{
	  if(err) throw err;
	  console.log(`${params.chunkMd5} uploaded success`);
	  res.send(`${params.chunkMd5} received success`);
	  });
	let addObj = {
	  chunkMd5: params.chunkMd5,
	  chunkNumber: params.chunkNumber
	  };
	console.log(addObj);
	chunkList.uploadedChunk.push(addObj);
//	console.log('chunkList.uploadedChunk.length'+chunkList.uploadedChunk.length);
//	console.log('chunkList.chunksNumber'+chunkList.chunksNumber);
	if(chunkList.uploadedChunk.length == chunkList.chunksNumber){
	  chunkList.fileStatus = 'posted';
	  console.log('write list file begin');
	  fs.writeFile(`./fileUpload/${chunkList.fileMd5}/list.json`,JSON.stringify(chunkList),(err) => {
	    if(err) throw err;
		});
	  console.log('write file success');
	  }
	//let tempList = fs.readFileSync(`./fileUpload/${params.fileMd5}/list.json`,'utf-8');
	//console.log(tempList);
	//let tempObj = JSON.parse(tempList);
	//console.log(tempObj);
	//let addObj = {
	// chunkMd5 : params.chunkMd5
	// };
	//tempObj.fileStatus = 'posting';
	//tempObj.fileMd5 = params.fileMd5;
	//console.log(tempObj);
	//if(!tempObj.uploadedChunk){
	//  tempObj.uploadedChunk = [];
	//  }
	//tempObj.uploadedChunk.push(addObj);
	//console.log(tempObj);
	//let newJsonFile = JSON.stringify(tempObj);
	//fs.writeFile(`./fileUpload/${params.fileMd5}/list.json`,newJsonFile,(err)=>{
	//  if(err) throw err;
	//  console.log('new json file write');
	//  });
});
app.use(function(err,req,res,next){
  console.error(err.stack);
  res.status(500).send('something broke');
});
var server = app.listen(8081,'222.20.79.250');
console.log('port is running on http://222.20.79.250');

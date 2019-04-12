var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var url = require('url');
var get_knowledge_map= require('./src/knowledgeMap/get_knowledge_map.js');
var exec = require('child_process').exec;
const readline = require('readline');

var getChunkResponse = require('./src/fileHandle/getChunkResponse.js').getChunkResponse;

let chunkList = {
  fileMd5:'',
  fileStatus: '',
  chunksNumber: 0,
  uploadedChunk:{
    chunkMd5:'',
	chunkNumber:0
	}
  };

const genoData = get_knowledge_map.geno_name_id_des_pos;
const transcriptData = get_knowledge_map.transcript_name_id_pos_proteinID;
const SOData = get_knowledge_map.SO_term_description_impact;

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

app.param('fileLabel',function(req,res,next,fileLabel){
	let params = url.parse(req.url,true).query;
	switch(fileLabel){
	  case 'pullChunkList':
	    if((chunkList.fileMd5 != '')&&(chunkList.fileMd5 == params.fileMd5)){
		  res.send(chunkList);
		  }
		else{
	      fs.readFile(`/home/jackchu/vcf-browser-server/src/fileUpload/${params.fileMd5}/list.json`,'utf8',(err,data)=>{
		    if(!data){
			  let sendObj = {
				fileStatus: 'notposted'
			  };
			  res.send(sendObj);
		      fs.mkdir(`/home/jackchu/vcf-browser-server/src/fileUpload/${params.fileMd5}`,(err)=>{
		  	    if(err) throw err;
		  	    });
		  	  if((chunkList.fileMd5 != params.fileMd5)&&(chunkList.fileMd5 != '')){
		  	    fs.writeFile(`/home/jackchu/vcf-browser-server/src/fileUpload/${chunkList.fileMd5}/list.json`,JSON.stringify(chunkList),(err) => {
		  	      if(err) throw err;
		  		  });
		  	    }
		  	  chunkList.fileMd5 = params.fileMd5;
		  	  chunkList.fileStatus = 'posting';
		  	  chunkList.chunksNumber = params.chunksNumber;
		  	  chunkList.uploadedChunk = [];
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
	    next();
		break;
	  case 'checkoutInfo':
	    let checkObj = req.body;
		res.send('ok');
	}
});

app.post('/api/:fileLabel',function(req,res,next){
  (function(req_chunk,res_chunk,chunkList_chunk){
    getChunkResponse(req_chunk,res_chunk,chunkList_chunk);
	})(req,res,chunkList);
});

app.use(function(err,req,res,next){
  console.error(err.stack);
  res.status(500).send('something broke');
});
var server = app.listen(8081,'222.20.79.250');
console.log('port is running on http://222.20.79.250');

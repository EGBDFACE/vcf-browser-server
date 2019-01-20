//http.createServer(function (req, res) {
//  res.writeHead(200, {'Content-Type': 'text/plain'});
//  res.end('Hello World\n');
//}).listen(1337,'222.20.79.250');
//console.log('Server running at http://127.0.0.1:1337/');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

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
app.use(bodyParser.json());
app.post('/',function(req,res){
//  req.on('data',function(data){
//	console.log(data);
//	console.log('-------------------');
//	obj = JSON.parse(data);
//	console.log(obj);
//  });
  var params = {chunks:[]};
  fs.stat(`./fileUpload/${req.body.file.fileMd5}`,function(err,stats){
	params.fileMd5 = req.body.file.fileMd5;
	params.total = req.body.file.fileChunks;
	params.uploaded = 0;
	if(stats&&stats.isDirectory()){
	    for(var i = 0;i < params.total;i++){
		 // (function(j){
		 //   params.chunks[j] = req.body.chunks[j];
		 //   fs.stat(`./fileUpload/${params.fileMd5}/${req.body.chunks[j].chunkMd5}`,function(err,stats){
		 //     if(stats&&stats.isFile()&&(stats.size === 5*1024*1024)){
		 //     	params.uploaded++;
		 //   	params.chunks[j].status = 'posted';
		 //     }else{
//		 //       console.log(params.chunks[j]);
		 //       params.chunks[j].status = 'posting';
		 //     }
		 //   });
		 // })(i);
		  params.chunks[i] = req.body.chunks[i];
		  if(fs.existsSync(`./fileUpload/${params.fileMd5}/${req.body.chunks[i].chunkMd5}`)){
		  	fs.statSync(`./fileUpload/${params.fileMd5}/${req.body.chunks[i].chunkMd5}`,function(err,stats){
			  if(stats.size === 5*1024*1024){
				params.uploaded++;
				params.chunks[i].status = 'posted';
			  }
			});
		  }else{
		    params.chunks[i].status = 'posting';
		  }
		}
	}else{
	    fs.mkdirSync(`./fileUpload/${params.fileMd5}`);
		for(var i = 0;i < params.total; i++){
		  params.chunks[i] = req.body.chunks[i];
		  params.chunks[i].status = 'posting';
//			console.log(params.chunks[i]);
		}
	}
	console.log(params);
//	console.log('*************');
  });
 // console.log(req.body);
 // console.log('---------------');
 // console.log(params);
  res.end('preload success');
});
app.use(function(err,req,res,next){
  console.error(err.stack);
  res.status(500).send('something broke');
});
var server = app.listen(8081,'222.20.79.250');
console.log('port is running on http://222.20.79.250');

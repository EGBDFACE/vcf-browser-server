var express = require('express');
var formidable = require('formidable');
var fs = require('fs');
var app = express();

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
app.post('/',function(req,res){
  upload(req,res);
});
app.get('/',function(req,res){
  res.end('hello,get');
});
function upload(req,res){
  if(!isFormData(req)){
	res.statusCode = 400;
	res.end('wrong request,please use the format of multipart/form-data');
	return;
  }
  var form = new formidable.IncomingForm();
  var fileName = '';
  form.uploadDir = './fileUpload';
  form.keepExtensions = true;
  form.on('field',(field,value) => {
	if(field === 'fileName'){
	  fileName = value;
	}
	console.log(field);
	console.log(value);
  });
  form.on('file',(name,file) => {
	if(fileName !== ''){
	  fs.renameSync(file.path,'./fileUpload/'+fileName);
	  fileName = '';
	}
  });
  form.on('progress',(bytesReceived,bytesExpected) => {
	var percent = Math.floor(bytesReceived/bytesExpected *100);
	console.log(percent);
  });
  form.on('end',()=>{
	res.end('upload success');
  });
  form.on('error',err => {
	console.log(err);
	res.statusCode = 500;
	res.end('error in server');
  });
  form.parse(req);
}  
function isFormData(req){
  let type = req.headers['content-type']||'';
  return type.includes('multipart/form-data');
}
var server = app.listen(8081,'222.20.79.250');
console.log('port is running on http://222.20.79.250:8081');


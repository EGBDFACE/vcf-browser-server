var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var url = require('url');
var fileHandle = require('./fileHandle.js');
var get_knowledge_map= require('./get_knowledge_map.js');
var exec = require('child_process').exec;
const readline = require('readline');

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
	      fs.readFile(`./fileUpload/${params.fileMd5}/list.json`,'utf8',(err,data)=>{
		    if(!data){
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
//	console.log(genoData);
//	console.log(transcriptData);
	let params = url.parse(req.url,true).query;
	console.log(chunkList);
	fs.writeFile(`./fileUpload/${params.fileMd5}/${params.chunkMd5}.vcf`,fileHandle.convertChunkToVCF(req.body),(err)=>{
	  if(err) throw err;
	  (function(fileMd5,chunkMd5){
//		let cmdStr = `/home/jackchu/ensembl/ensembl-vep-release-94.0/./vep -i /home/jackchu/vcf-browser-server/fileUpload/${fileMd5}/${chunkMd5}.vcf -o /home/jackchu/vcf-browser-server/fileUpload/${fileMd5}/${chunkMd5}.txt --cache --dir /mnt/data/jackchu/.vep/ --offline --force_overwrite --no_stats`;
		let cmdStr = `/home/jackchu/ensembl/ensembl-vep-release-94.0/./vep -i /home/jackchu/vcf-browser-server/fileUpload/${fileMd5}/${chunkMd5}.vcf -o /home/jackchu/vcf-browser-server/fileUpload/${fileMd5}/${chunkMd5}.txt --cache --dir /mnt/data/jackchu/.vep/ --offline --force_overwrite --no_stats --json --plugin dbNSFP,/mnt/data/jackchu/dbNSFP/dbNSFP.gz,MetaLR_pred,MetaLR_rankscore,MetaLR_score,MetaSVM_pred,MetaSVM_rankscore,MetaSVM_score`;
		exec(cmdStr,function(err,stdout,stderr){
		  if(err){
			throw err;
			}
		  else{
		  	let inputStream = fs.createReadStream(`/home/jackchu/vcf-browser-server/fileUpload/${fileMd5}/${chunkMd5}.txt`);
			const rl = readline.createInterface({
				input : inputStream
				});
			let tempArray = [];
			rl.on('line',(input)=>{
//				tempArray.push(JSON.parse(input));
				let tempObj = {};
				let temp = JSON.parse(input);
				tempObj.VariantID = temp.id;
				tempObj.VariantStart = temp.start;
				tempObj.VariantEnd = temp.end;
				tempObj.Ref = temp.allele_string.slice(0,temp.allele_string.indexOf('/'));
				tempObj.Alt = temp.allele_string.slice(temp.allele_string.indexOf('/')+1);
				tempObj.most_severe_consequence = temp.most_severe_consequence;
				tempObj.seq_region_name = temp.seq_region_name;
				if(temp.transcript_consequences){
				tempObj.transcript_consequences = [];
				for(let j=0;j<temp.transcript_consequences.length;j++){
					tempObj.transcript_consequences[j]={};
					if(temp.transcript_consequences[j].consequence_terms){
						tempObj.transcript_consequences[j].consequences = [];
						for(let k=0;k<temp.transcript_consequences[j].consequence_terms.length;k++){
							tempObj.transcript_consequences[j].consequences.push({
								consequence_terms: temp.transcript_consequences[j].consequence_terms[k],
								consequence_description: SOData[temp.transcript_consequences[j].consequence_terms[k]]?SOData[temp.transcript_consequences[j].consequence_terms[k]].description:'',
								consequence_impact: SOData[temp.transcript_consequences[j].consequence_terms[k]]?SOData[temp.transcript_consequences[j].consequence_terms[k]].impact:''
								});
							}
						}
					let value = temp.transcript_consequences[j];
					tempObj.transcript_consequences[j].gene_id = value.gene_id;
					if(genoData[value.gene_id]){
						tempObj.transcript_consequences[j].gene_start = genoData[value.gene_id].geno_start;
						tempObj.transcript_consequences[j].gene_end = genoData[value.gene_id].geno_end;
						if(genoData[value.gene_id].geno_description){
							tempObj.transcript_consequences[j].gene_description = genoData[value.gene_id].geno_description;
							}
					}
					tempObj.transcript_consequences[j].transcript_id = value.transcript_id;
					if(transcriptData[value.transcript_id]){
						tempObj.transcript_consequences[j].transcript_start = transcriptData[value.transcript_id].transcript_start;
						tempObj.transcript_consequences[j].transcript_end = transcriptData[value.transcript_id].transcript_end;
						tempObj.transcript_consequences[j].transcript_name = transcriptData[value.transcript_id].transcript_name;
						if(transcriptData[value.transcript_id].protein_id){
							tempObj.transcript_consequences[j].protein_id = transcriptData[value.transcript_id].protein_id;
							}
					}
					if(value.cds_start){
						tempObj.transcript_consequences[j].cds_start = value.cds_start;
						tempObj.transcript_consequences[j].cds_end = value.cds_end;
						}
					if(value.cdna_start){
						tempObj.transcript_consequences[j].cdna_start = value.cdna_start;
						tempObj.transcript_consequences[j].cdna_end = value.cdna_end;
						}
					if(value.protein_start){
						tempObj.transcript_consequences[j].protein_start = value.protein_start;
						tempObj.transcript_consequences[j].protein_end = value.protein_end;
						}
				}
				}
				tempArray.push(tempObj);
				});
			rl.on('close',(err)=>{
				if(err) throw err;
				let addObj = {
					chunkMd5: params.chunkMd5,
					chunkNumber: params.chunkNumber
					};
				chunkList.uploadedChunk.push(addObj);
				if(chunkList.uploadedChunk.length === chunkList.chunksNumber){
					chunkList.fileStatus = 'posted';
					(function(chunkList){
						fs.writeFile(`./fileUpload/${chunkList.fileMd5}/list.json`,JSON.stringify(chunkList),(err)=>{
							if(err) throw err;
							});
						})(JSON.parse(JSON.stringify(chunkList)));
					}
				let responseData = JSON.parse(JSON.stringify(chunkList));
				responseData.data = JSON.stringify(tempArray);
				res.send(responseData);
				});
//			fs.readFile(`/home/jackchu/vcf-browser-server/fileUpload/${fileMd5}/${chunkMd5}.txt`,'utf8',(err,data)=>{
//			 if(err) throw err;
//			 let addObj = {
//			  chunkMd5: params.chunkMd5,
//			  chunkNumber: params.chunkNumber
//			  };
//			 console.log(addObj);
//			 chunkList.uploadedChunk.push(addObj);
//			 if(chunkList.uploadedChunk.length == chunkList.chunksNumber){
//			  chunkList.fileStatus = 'posted';
//			  console.log('write list file begin');
//			  (function(chunkList){
//				fs.writeFile(`./fileUpload/${chunkList.fileMd5}/list.json`,JSON.stringify(chunkList),(err) => {
//				  if(err) throw err;
//				  console.log('assemble chunks'+chunkList.fileMd5);
//				  });
//			  })(JSON.parse(JSON.stringify(chunkList)));
//			  console.log('write file success');
//			  }
//			 let responseData = JSON.parse(JSON.stringify(chunkList));
//			 responseData.data = data;
//			 res.send(responseData);
//			  });
//	   		console.log(`${params.chunkMd5} uploaded success`);
		   }
		 });
		})(params.fileMd5,params.chunkMd5);
	});
});

app.use(function(err,req,res,next){
  console.error(err.stack);
  res.status(500).send('something broke');
});
var server = app.listen(8081,'222.20.79.250');
console.log('port is running on http://222.20.79.250');

const fs = require('fs');
const exec = require('child_process').exec;
const readline = require('readline');
const url = require('url');
const convertChunk = require('./chunkFileHandle.js');
const knowledgeMap = require('../knowledgeMap/get_knowledge_map.js');

const genoData = knowledgeMap.geno_name_id_des_pos;
const transcriptData = knowledgeMap.transcript_name_id_pos_proteinID;
const SoData = knowledgeMap.SO_term_description_impact;

var combineVepOncotator = require('./combineVepOncotator.js').combineVepOncotator;

function getChunkResponse(req,res,chunkList){
  
  let params = url.parse(req.url,true).query;

  let fileMd5 = params.fileMd5,chunkMd5 = params.chunkMd5;

  const promise_vep = new Promise(function(resolve,reject){
  	
	fs.writeFile(`/home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/${chunkMd5}_vep.vcf`,convertChunk.convertChunkToVCF(req.body),(err)=>{
	  if(err) throw err;
//	  let cmdStrVep = `nohup /home/jackchu/ensembl/ensembl-vep-release-94.0/./vep -i ${chunkMd5}_vep.vcf -o ${chunkMd5}_vep_result.txt --cache --dir /mnt/data/jackchu/.vep/ --offline --force_overwrite --no_stats --json --plugin dbNSFP,/mnt/data/jackchu/dbNSFP/dbNSFP.gz,MetaLR_pred,MetaLR_rankscore,MetaLR_score,MetaSVM_pred,MetaSVM_rankscore,MetaSVM_score > ${chunkMd5}.log 2>&1 &`;
//	  let cmdStrVep = `/home/jackchu/ensembl/ensembl-vep-release-94.0/./vep -i /home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/${chunkMd5}_vep.vcf -o /home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/${chunkMd5}_vep_result.txt --cache --dir /mnt/data/jackchu/.vep/ --offline --force_overwrite --no_stats --json --plugin dbNSFP,/mnt/data/jackchu/dbNSFP/dbNSFP.gz,MetaLR_pred,MetaLR_rankscore,MetaLR_score,MetaSVM_pred,MetaSVM_rankscore,MetaSVM_score`;
//	  let cmdStrVep = `/home/jackchu/ensembl/ensembl-vep-release-94.0/./vep -i ${chunkMd5}_vep.vcf -o ${chunkMd5}_vep_result.txt --cache --dir /mnt/data/jackchu/.vep/ --offline --force_overwrite --no_stats --json --plugin dbNSFP,/mnt/data/jackchu/dbNSFP/dbNSFP.gz,MetaLR_pred,MetaLR_rankscore,MetaLR_score,MetaSVM_pred,MetaSVM_rankscore,MetaSVM_score`;
//	  exec(cmdStrVep,err=>{
	  let cmdStrVep = `/home/jackchu/ensembl/ensembl-vep-release-94.0/./vep -i ${chunkMd5}_vep.vcf -o ${chunkMd5}_vep_result.txt --cache --dir /mnt/data/jackchu/.vep/ --offline --force_overwrite --no_stats --json --plugin dbNSFP,/mnt/data/jackchu/dbNSFP/dbNSFP.gz,MetaLR_pred,MetaLR_rankscore,MetaLR_score,MetaSVM_pred,MetaSVM_rankscore,MetaSVM_score > ${chunkMd5}_vep.log 2>&1`;
	  exec(cmdStrVep,{cwd:`/home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/`},err=>{
	    if(err) throw err;
		let inputStream = fs.createReadStream(`/home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/${chunkMd5}_vep_result.txt`);
//		let inputStream = fs.createReadStream(`${chunkMd5}_vep_result.txt`);
		let vep_result = [];
		const rl_vep = readline.createInterface({
		  input: inputStream
		});
		rl_vep.on('line',input=>{
		  vep_result.push(JSON.parse(input));
		  });
		rl_vep.on('close',err=>{
		  if(err) throw err;
	      return resolve(vep_result);
		  });
		});
	});
  });

  const promise_oncotator = new Promise(function(resolve,reject){
    fs.writeFile(`/home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/${chunkMd5}_oncotator.txt`,convertChunk.convertChunkToOncotator(req.body),err=>{
	  if(err) throw err;
	  let cmdStrOncotator = `oncotator -v --db-dir /mnt/data/jackchu/temp/oncotator_v1_ds_April052016 ${chunkMd5}_oncotator.txt ${chunkMd5}_oncotator_result.tsv hg19 > ${chunkMd5}_oncotator.log 2>&1`;
//	  let cmdStrOncotator = `oncotator -v --db-dir /mnt/data/jackchu/temp/oncotator_v1_ds_April052016 /home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/${chunkMd5}_oncotator.txt /home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/${chunkMd5}_oncotator_result.tsv hg19`;
//	  exec(cmdStrOncotator,err=>{
	  exec(cmdStrOncotator,{cwd : `/home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/`,timeout: 40000},err=>{  
		if(err) throw err;
// 		console.error(err);
		let inputStream = fs.createReadStream(`/home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/${chunkMd5}_oncotator_result.tsv`);
		const rl_oncotator = readline.createInterface({
		  input: inputStream
		  });
		let headerObj = {},oncotator_result = [];;
		rl_oncotator.on('line',input=>{
		  if(input.indexOf('Hugo_Symbol') === 0){
		    let headerArray = input.split('\t');
			for(let i=0;i<headerArray.length;i++){
			  headerObj[headerArray[i]] = i;
			}
		  }else if(input.indexOf('#') === -1){
		    let itemArray = input.split('\t');
			if((itemArray[headerObj.dbNSFP_LR_pred] === 'T')||(itemArray[headerObj.dbNSFP_LR_pred] === 'D')){
			  oncotator_result[itemArray[headerObj.dbSNP_RS]] = {
				dbNSFP_LR_pred : resolveMultiScore(itemArray[headerObj.dbNSFP_LR_pred]),
				dbNSFP_LR_rankscore: resolveMultiScore(itemArray[headerObj.dbNSFP_LR_rankscore]),
				dbNSFP_LR_score: resolveMultiScore(itemArray[headerObj.dbNSFP_LR_score]),
				dbNSFP_RadialSVM_pred: resolveMultiScore(itemArray[headerObj.dbNSFP_RadialSVM_pred]),
				dbNSFP_RadialSVM_rankscore: resolveMultiScore(itemArray[headerObj.dbNSFP_RadialSVM_rankscore]),
				dbNSFP_RadialSVM_score:resolveMultiScore(itemArray[headerObj.dbNSFP_RadialSVM_score])
			  };
			}
		  }
		});
		rl_oncotator.on('close',err=>{
		  if(err) throw err;
		  return resolve(oncotator_result);
		  });
	  });
    });
  });
  
  const promist_both = Promise.all([promise_vep,promise_oncotator]).then(posts => {
    let vepOncotatorData = combineVepOncotator(posts[0],posts[1]);
	fs.writeFile(`/home/jackchu/vcf-browser-server/src/fileUpload/${params.fileMd5}/${params.chunkMd5}_combine_data.txt`, JSON.stringify(vepOncotatorData), err=>{
		if(err) throw err;
		});
	let itemChunkList = {
	  chunkMd5 : params.chunkMd5,
//	  chunkNumber : params.chunkNumber
	  };
//	console.log('combine');
	console.log(`[chunk] ${params.chunkMd5} posted`);
	chunkList.uploadedChunk.push(itemChunkList);
	if(chunkList.uploadedChunk.length == params.chunksNumber){
	  chunkList.fileStatus = 'posted';
	  console.log(`[file] ${chunkList.fileMd5} posted`);
	  fs.writeFile(`/home/jackchu/vcf-browser-server/src/fileUpload/${chunkList.fileMd5}/list.json`,JSON.stringify(chunkList),err=>{
	    if(err) throw err;
		});
	  }
	let responseData = JSON.parse(JSON.stringify(chunkList));
	responseData.data = JSON.stringify(vepOncotatorData);
	res.send(responseData);
    });
}

function resolveMultiScore(value){
  if(value.indexOf('|') != -1){
    return value.slice(0,value.indexOf('|'));
  }
  else{
    return value;
  }
}

module.exports = {
  getChunkResponse : getChunkResponse
  }

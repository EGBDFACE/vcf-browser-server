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

const BASE_DIR = '/home/jackchu/vcf-browser-server/src/assets/fileUpload';

function runVepOncotator (chunk) {
 return new Promise(function(resolve,reject){
  let fileMd5 = chunk.fileMd5,chunkMd5 = chunk.chunkMd5;
  
  if (!fs.existsSync(`${BASE_DIR}/${fileMd5}`)) {
    fs.mkdir (`${BASE_DIR}/${fileMd5}`, err => {
	  if (err) throw err;
	  });
	}

  const promise_vep = new Promise(function(resolve,reject){
  	
	fs.writeFile(`${BASE_DIR}/${fileMd5}/${chunkMd5}_vep.vcf`,convertChunk.convertChunkToVCF(chunk.chunkData),(err)=>{
	  if(err) throw err;
	  let cmdStrVep = `/home/jackchu/ensembl/ensembl-vep-release-94.0/./vep -i ${chunkMd5}_vep.vcf -o ${chunkMd5}_vep_result.txt --cache --dir /mnt/data/jackchu/.vep/ --offline --force_overwrite --no_stats --json --plugin dbNSFP,/mnt/data/jackchu/dbNSFP/dbNSFP.gz,MetaLR_pred,MetaLR_rankscore,MetaLR_score,MetaSVM_pred,MetaSVM_rankscore,MetaSVM_score > ${chunkMd5}_vep.log 2>&1`;
	  exec(cmdStrVep,{cwd:`${BASE_DIR}/${fileMd5}/`},err=>{
		if(err) {
		  console.error(`[ERR] ${err.message}`);
		  }
		let inputStream = fs.createReadStream(`${BASE_DIR}/${fileMd5}/${chunkMd5}_vep_result.txt`);
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
    fs.writeFile(`${BASE_DIR}/${fileMd5}/${chunkMd5}_oncotator.txt`,convertChunk.convertChunkToOncotator(chunk.chunkData),err=>{
	  if(err) {
	    console.error(`[ERR] ${err.message}`);
		}
	  let cmdStrOncotator = `oncotator -v --db-dir /mnt/data/jackchu/temp/oncotator_v1_ds_April052016 ${chunkMd5}_oncotator.txt ${chunkMd5}_oncotator_result.tsv hg19 > ${chunkMd5}_oncotator.log 2>&1`;
	  exec(cmdStrOncotator,{cwd : `${BASE_DIR}/${fileMd5}/`,timeout: 40000},err=>{  
		if(err) console.error(`[ERR] ${err.message}`);
		let inputStream = fs.createReadStream(`${BASE_DIR}/${fileMd5}/${chunkMd5}_oncotator_result.tsv`);
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
    resolve(vepOncotatorData);
	});
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
  runVepOncotator : runVepOncotator
  }

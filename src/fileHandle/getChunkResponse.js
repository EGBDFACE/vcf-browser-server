const fs = require('fs');
const exec = require('child_process').exec;
const readline = require('readline');i
const url = require('url');
const convertChunk = require('./chunkFileHandle.js');
const knowledgeMap = require('../knowledgeMap/get_knowledge_map.js');

const genoData = knowledgeMap.geno_name_id_des_pos;
const transcriptData = knowledgeMap.transcript_name_id_pos_proteinID;
const SoData = knowledgeMap.SO_term_description_impact;

function getChunkResponse(req,res,chunkList){
  
  let params = url.parse(req.url,true).query;

  let fileMd5 = params.fileMd5,chunkMd5 = params.chunkMd5;
  
  let vep_result = [],oncotator_result = [];

  const promise_vep = new Promise(function(resolve,reject){
  	
	fs.writeFile(`/home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/${chunkMd5}_vep.vcf`,convertChunk.convertChunkToVCF(req.body),(err)=>{
	  if(err) throw err;
	  let cmdStrVep = `/home/jackchu/ensembl/ensembl-vep-release-94.0/./vep -i /home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/${chunkMd5}_vep.vcf -o /home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/${chunkMd5}_vep_result.txt --cache --dir /mnt/data/jackchu/.vep/ --offline --force_overwrite --no_stats --json --plugin dbNSFP,/mnt/data/jackchu/dbNSFP/dbNSFP.gz,MetaLR_pred,MetaLR_rankscore,MetaLR_score,MetaSVM_pred,MetaSVM_rankscore,MetaSVM_score`;
	  exec(cmdStr_vep,err=>{
	    if(err) throw err;
		
		let inputStream = fs.createReadStream(`/home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/${chunkMd5}_vep_result.txt`);
		const rl_vep = readline.createInterface({
		  input: inputStream
		});
		rl_vep.on('line',input=>{
		  vep_result.push(JSON.parse(input));
		  });
		rl_vep.on('close',err=>{
		  if(err) throw err;
	      return resolve();
		  });
		});
	});
  });

  const promise_oncotator = new Promise(function(resolve,reject){

    fs.writeFile(`/home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/${chunkMd5}_oncotator.txt`,convertChunk.convertChunkToOncotator(req.body),err=>{
	  if(err) throw err;
	  let cmdStrOncotator = `/home/jackchu/oncotator-1.9.9.0/oncotator -v --db-dir /mnt/data/jackchu/temp/oncotator_v1_ds_April052016 /home/jackchu/vcf-vrowser-server/src/fileUpload/${fileMd5}/${chunkMd5}_oncotator.txt /home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/${chunkMd5}_oncotator_result.tsv hg19`;
	  exec(cmdStrOncotator,err=>{
	    if(err) throw err;

		let inputStream = fs.createReadStream(`/home/jackchu/vcf-browser-server/src/fileUpload/${fileMd5}/${chunkMd5}_oncotator_result.tsv`);
		const rl_oncotator = readline.createInterface({
		  input: inputStream
		  });
		let headerObj = {};
		rl_oncotator.on('line',input=>{
		  if(input.indexOf('Hugo_Symbol') === 0){
		    let headerArray = input.split('\t');
			for(let i=0;i<headerArray.length;i++){
			  headerObj[headerArray[i]] = i;
			}
		  }else if(input.indexOf('#') === -1){
		    let tempArray = input.split('\t');
			if(itemArray[headerObj.dbNSFP_LR_pred] != ''){
			  let itemObj = {
			    dbSNP_RS : itemArray[headerObj.dbSNP_RS],
				dbNSFP_LR_pred : resolveMultiScore(itemArray[headerObj.dbNSFP_LR_pred]),
				dbNSFP_LR_rankscore: resolveMultiScore(itemArray[headerObj.dbNSFP_LR_rankscore]),
				dbNSFP_LR_score: resolveMultiScore(itemArray[headerObj.dbNSFP_LR_score]),
				dbNSFP_RadialSVM_pred: resolveMultiScore(itemArray[headerObj.dbNSFP_RadialSVM_pred]),
				dbNSFP_RadialSVM_rankscore: resolveMultiScore(itemArray[headerObj.dbNSFP_RadialSVM_rankscore]),
				dbNSFP_RadialSVM_score:resolveMultiScore(itemArray[headerObj.dbNSFP_RadialSVM_score])
			  };
			  oncotator_result.push(itemObj);
			}
		  }
		});
		rl_oncotator.on('close',err=>{
		  if(err) throw err;
		  return resolve(promise_vep);
		  });
	  });
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


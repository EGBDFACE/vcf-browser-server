const fs = require('fs');
const exec = require('child_process').exec;
const assert = require('assert').strict;

function convertChunkToVCF(currentChunk){
  let chunk = '##fileformat=VCFv4.1'+'\n'+'#CHROM'+'\t'+'POS'+'\t'+'ID'+'\t'+'REF'+'\t'+'ALT'+'\t'+'QUAL'+'\t'+'FILTER'+'\t'+'INFO'+'\n';
  let body = currentChunk;
  for(let i=0;i<body.length;i++){
    chunk += body[i].CHROM+'\t'+body[i].POS+'\t'+body[i].ID+'\t'+body[i].REF+'\t'+body[i].ALT+'\t'+body[i].QUAL+'\t'+body[i].FILTER+'\t'+body[i].INFO+'\n';
  }
  return chunk;
}

function convertChunkToOncotator(value){
  let chunk = 'chr'+'\t'+'start'+'\t'+'end'+'\t'+'ref_allele'+'\t'+'alt_allele'+'\n';
//  let body = value.chunkFile.body;
  let body = value;
  for(let i=0;i<body.length;i++){
  	let start = body[i].POS;
	let alt = body[i].ALT.split(',');
	for(let j=0;j<alt.length;j++){
		let end = start;
		if(body[i].REF.length >= alt[j].length){
			chunk += 'chr' + body[i].CHROM + '\t' + start + '\t' + end + '\t' + body[i].REF + '\t' + alt[j] +'\n';
		}
		else{
			end = alt[j].length - body[i].REF.length + parseInt(start) ;
			chunk += 'chr' + body[i].CHROM + '\t' + start + '\t' + end + '\t' + body[i].REF + '\t' + alt[j] + '\n';
		}
	}
  }
  return chunk;
}

module.exports = {
  convertChunkToVCF : convertChunkToVCF,
  convertChunkToOncotator : convertChunkToOncotator
  }

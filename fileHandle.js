const fs = require('fs');
const exec = require('child_process').exec;
const assert = require('assert').strict;

function assemble(currentFileMd5){
//	var currentFileMd5 = '8cd01a88432d22671cd09f399e4f7175';
	var chunkListString = fs.readFileSync(`./fileUpload/${currentFileMd5}/list.json`,'utf8');
	//console.log(chunkListString);
	//console.log(JSON.parse(chunkListString));
	var chunkList = JSON.parse(chunkListString);
//	console.log(chunkList);
	chunkList.uploadedChunk.sort(compare('chunkNumber'));
	//console.log(chunkList);
	var writeStream = fs.createWriteStream(`./fileUpload/assembleFile/${currentFileMd5}.vcf`);
	//console.log(readStream);
	// if(chunkList.chunksNumber != chunkList.uploadedChunk.length){
	// }
	for(var i =0 ;i< chunkList.chunksNumber;i++){
		let chunkString = fs.readFileSync(`./fileUpload/${currentFileMd5}/${chunkList.uploadedChunk[i].chunkMd5}`,'utf8');
	  let chunk = JSON.parse(chunkString);
		let tempString='';
//		console.log('i' + i);
	  if(i == 0){
	//		tempString = chunk.chunkFile.startLine + '\n' + chunk.chunkFile.Chrom+'\n';
			tempString = chunk.chunkFile.startLine + '\n' + '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n';
		}
		else{
			let tempStartLine = chunk.chunkFile.startLine;
			let tempStartLineArray = tempStartLine.split('\t');
			let preTempEndLine = JSON.parse(fs.readFileSync(`./fileUpload/${currentFileMd5}/${chunkList.uploadedChunk[i-1].chunkMd5}`,'utf8')).chunkFile.endLine;
			if((((+tempStartLineArray[0]<23)&&(+tempStartLineArray[0]>0))||(tempStartLineArray[0] == 'X')||(tempStartLineArray[0] == 'Y')||(tempStartLineArray[0].indexOf('hs') == 0)||(tempStartLineArray[0].indexOf('CHR') == 0)||(tempStartLineArray[0].indexOf('GL') == 0)||(tempStartLineArray[0].indexOf('MT') == 0)||(tempStartLineArray[0].indexOf('NC')==0))&&((tempStartLineArray[3].indexOf('A')!=-1)||(tempStartLineArray[3].indexOf('T')!=-1)||(tempStartLineArray[3].indexOf('C')!= -1)||(tempStartLineArray[3].indexOf('G') != -1))){
				tempString = tempString + dealUnsolvedLine(tempString,preTempEndLine) + '\n';
				tempString = tempString + dealUnsolvedLine(tempString,tempStartLine) + '\n';
			}
			else{
				tempString = tempString + dealUnsolvedLine(tempString,preTempEndLine + tempStartLine) +'\n';
			}
		}
//		console.log('1'+tempString)
		var body = chunk.chunkFile.body;
	//	console.log(body);
		for(var j=0;j< chunk.chunkFile.body.length;j++){
			tempString = tempString + body[j].CHROM + '\t' + body[j].POS + '\t' + body[j].ID + '\t' + body[j].REF + '\t' + body[j].ALT + '\t' + body[j].QUAL + '\t' + body[j].FILTER + '\t' + body[j].INFO + '\n';
		}
//		console.log('2'+tempString);
		if(i == chunkList.chunksNumber-1){
	//		let tempEndLine = chunk.chunkFile.endLine.split('\t');
	//		tempString = tempString + tempEndLine[0] + '\t' + tempEndLine[1] +'\t' + tempEndLine[2] + '\t' + tempEndLine[3] + '\t' + tempEndLine[4] + '\t' + tempEndLine[5] + '\t'+ tempEndLine[6] + '\t';
	//    let indexINS = tempEndLine[4].indexOf('INS');
	//		let indexDEL = tempEndLine[4].indexOf('DEL');
	//		let indexDUP = tempEndLine[4].indexOf('DUP');
	//		let indexTDUP = tempEndline[4].indexOf('TDUP');
	//		let indexEND = tempEndLine[7].indexOf('END');
	//		if(indexINS + indexDEL + indexDUP + indexTDUP == -4){
	//		  tempString = tempString + '.';
	//		}
	//		else{
	//		tempString = tempString + chunk.chunkFile.endLine;
			let tempEndLine = chunk.chunkFile.endLine;
//			tempString = tempString + dealUnsolvedLine(tempString,tempEndLine);
  			tempString = dealUnsolvedLine(tempString,tempEndLine);
//			console.log('3'+tempString);
		}
	//	let chunkReadStream = fs.createReadStream(tempString);
	//  writeStream.on('pipe',(src) => {
	//		console.log(`writing to writer through pipe ${i}`);
	//		assert.equal(src,chunkReadStream);
	//	});
	//	chunkReadStream.pipe(writeStream);
	//	console.log(i);
	//	console.log(chunkReadStream);
	//	chunkReadStream.unpipe(writeStream);
	//	console.log(writeStream);
//	 console.log('4'+ tempString);	 
	 writeStream.write(tempString);
	}
}
function dealUnsolvedLine(totalString,lineString){
	let tempLineString = lineString.split('\t');
	console.log('tempLineString:'+tempLineString);
	totalString = totalString + tempLineString[0] + '\t' + tempLineString[1] + '\t' + tempLineString[2] + '\t' + tempLineString[3] + '\t' + tempLineString[4] + '\t' + '.' + '\t' + '.' + '\t';
	let indexINS = tempLineString[4].indexOf('INS');
	let indexDEL = tempLineString[4].indexOf('DEL');
	let indexDUP = tempLineString[4].indexOf('DUP');
	let indexTDUP = tempLineString[4].indexOf('TDUP');
	let indexEND = tempLineString[7].indexOf('END');
	if(indexINS + indexDEL + indexDUP + indexTDUP == -4){
		totalString = totalString + '.';
	}
	else{
		let k = 0;
		while((tempLineString[7].charAt(indexEND+k) != ';')&&(k<=tempLineString[7].length)){
			k++;
		}
		if(indexINS != -1){
			totalString = totalString + 'SVTYPE=INS;' ;
		}
		else if(indexDEL != -1){
			totalString = totalString + 'SVTYPE=DEL;' ;
		}
		else if(indexDUP != -1){
			totalString = totalString + 'SYTYPE=DUP;' ;
		}
		else if(indexTDUP != -1){
			totalString = totalString + 'SYTYPE=TDUP;' ;
		}
		totalString = totalString + tempLineString[7].slice(indexEND,indexEND+k+1);
	}
	return totalString;
}

function compare(propertyName){
	return function (obj1,obj2){
		var value1 = +obj1[propertyName];
		var value2 = +obj2[propertyName];
		if(value1 < value2){
			return -1;
		}else if(value1 > value2){
			return 1;
		}else{
			return 0;
		}
	};
}
function runVep(fileMd5,currentFileMd5){
  var inputFilePath = `./fileUpload/${fileMd5}/${currentFileMd5}.vcf`;
  var outputFilePath = `./fileUpload/${fileMd5}/${currentFileMd5}.txt`;
//  var cmdStr = `/home/jackchu/ensembl-vep/./vep -i ${inputFilePath} -o ${outputFilePath} --cache --cache_version 94 --dir /mnt/data/jackchu/.vep --force_overwrite`;
  //var cmdStr = `/home/jackchu/ensembl-vep/./vep -i ${inputFilePath} -o ${outputFilePath} --cache --dir /mnt/data/jackchu/cacheFile/ --force_overwrite`;
  var cmdStr = `/home/jackchu/ensembl/ensembl-vep-release-94.2/./vep -i ${inputFilePath} -o ${outputFilePath} --cache --dir /mnt/data/jackchu/.vep`;
 exec(cmdStr,function(err,stdout,stderr){
    if(err){
	  throw err;
	  }
	else{
	  console.log('run vep success');
	  console.log(stdout);
	  }
  });
}

function convertChunkToVCF(currentChunk){
  let chunk = '##fileformat=VCFv4.1'+'\n'+'#CHROM'+'\t'+'POS'+'\t'+'ID'+'\t'+'REF'+'\t'+'ALT'+'\t'+'QUAL'+'\t'+'FILTER'+'\t'+'INFO'+'\n';
  for(let i=0;i<currentChunk.chunkFile.body.length;i++){
    chunk += currentChunk.chunkFile.body[i].CHROM+'\t'+currentChunk.chunkFile.body[i].POS+'\t'+currentChunk.chunkFile.body[i].ID+'\t'+currentChunk.chunkFile.body[i].REF+'\t'+currentChunk.chunkFile.body[i].ALT+'\t'+currentChunk.chunkFile.body[i].QUAL+'\t'+currentChunk.chunkFile.body[i].FILTER+'\t'+currentChunk.chunkFile.body[i].INFO+'\n';
  }
  return chunk;
}

module.exports = {
  assemble : assemble,
  runVep : runVep,
  convertChunkToVCF : convertChunkToVCF
  }

const url = 'mongodb://localhost:27017/';
const MongoClient = require('mongodb').MongoClient;


function getChunkData (fileMd5) {
 return new Promise(function(resolve,reject){
  MongoClient.connect (url, { useNewUrlParser: true }, function (err, db) { 
    if (err) throw err;
	
	let dbase = db.db('vcf_browser_server');
    let findObj = {'fileMd5': fileMd5};

	dbase.collection('chunkFile').find(findObj).toArray(function (err, result) {
	  if (err) throw err;

	  db.close();
	  resolve(result);
	  });
	
	});
 });
}

function insertChunk (chunk) {
  
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) { 
    if (err) throw err;

	let dbo = db.db('vcf_browser_server');
    
	dbo.collection('chunkFile').insertOne(chunk, function(err, res) {
	  if (err) throw err;
	  db.close();
	  });
	});
  }

module.exports = {
  getChunkData: getChunkData,
  insertChunk: insertChunk
  };

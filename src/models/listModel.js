const monk = require('monk');
const url = 'mongodb://localhost:27017/';
const db = monk(url);
const MongoClient = require('mongodb').MongoClient

const totalFile = db.get('totalFile');

function getList (fileMd5) {
  return new Promise(function(resolve,reject) {
    MongoClient.connect (url, { useNewUrlParser: true }, function (err, db) {
	  if (err) throw err;
	  
	  let dbase = db.db('vcf_browser_server');
	  let findObj = {'fileMd5': fileMd5};
	  
	  dbase.collection('totalFile').find(findObj).toArray(function (err, result) {
	    if (err) throw err;
		db.close()
		resolve(result);
		});
	  });
	});
  }

// 插入文档
function insertItem (item) {
  MongoClient.connect (url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;

	let dbase = db.db('vcf_browser_server');

	dbase.collection('totalFile').insertOne (item, function (err, res) {
	  if (err) throw err;
	  db.close();
	  });
	});
  }

function updateItem (whereStr, updateObj) {
  
  MongoClient.connect (url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;

	let dbase = db.db('vcf_browser_server');
	let updateStr = {$set: updateObj};

	dbase.collection('totalFile').updateOne(whereStr, updateStr, function (err, res) {
	  if (err) throw err;
	  db.close();
	  });

	});
}
module.exports = {
  getList : getList,
  insertItem: insertItem,
  updateItem: updateItem
};


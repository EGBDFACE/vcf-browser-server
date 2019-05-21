const url = 'mongodb://localhost:27017';
const MongoClient = require('mongodb').MongoClient;

function getUserInfo (name) {
  return new Promise(function(resolve,reject) {
    MongoClient.connect (url, { useNewUrlParser: true }, function (err, db) {
	  if (err) throw err;

	  let dbase = db.db('vcf_browser_server');
	  let findObj = {'name': name};

	  dbase.collection('userInfo').find(findObj).toArray(function(err,result) {
	    if(err) throw err;
		db.close();
		resolve(result);
		});
	});
  });
 }

function addUser (info) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;

	let dbase = db.db('vcf_browser_server');

	dbase.collection('userInfo').insertOne (info, function (err, res) {
	  if (err) throw err;
	  db.close();
	  });
	});
  }

function updateUserInfo(whereStr, updateObj) {
  MongoClient.connect (url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;

	let dbase = db.db('vcf_browser_server');
	let updateStr = {$set: updateObj};

	dbase.collection('userInfo').updateOne(whereStr, updateStr, function (err, res) {
	  if (err) throw err;
	  db.close();
	  });
	});
  }

module.exports = {
  getUserInfo: getUserInfo,
  addUser: addUser,
  updateUserInfo: updateUserInfo
};

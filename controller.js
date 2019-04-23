const fs = require('fs');

function addMapping (router, method, path, func) {
  switch (method) {
    case 'GET':
	  router.get (path, func);
	  return;
	case 'POST':
	  router.post (path, func);
	  return;
	case 'PUT':
	  //router.put (path, func);
	  console.log('[ERR] no such method');
	  return;
	case 'DELETE':
	  //router.del (path, func);
	  console.log('[ERR] no such method');
	  return;
	default: 
	  console.log(`[ERR] invalid method: ${method} with path: ${path}`);
	  return;
  }
}

function addControllers (router, dir) {
  let files = fs.readdirSync (__dirname + '/controllers');
  let jsFiles = files.filter ( f => {
    return f.endsWith('.js');
	});
  
  for (let f of jsFiles) {
    let mappingList = require(__dirname + '/controllers/' + f);
	mappingList.forEach( mapping => {
	  addMapping(router, mapping.method, mapping.path, mapping.func);
	  });
	}
}

module.exports = function (dir) {
  let 
       controllersDir = dir || 'controllers',
	   router = require('koa-router')();
  
  addControllers(router, controllersDir);
  return router.routes();

};


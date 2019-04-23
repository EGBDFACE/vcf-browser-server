const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
//const router = require('koa-router')();
const controller = require('./controller');

var getChunkResponse = require('./src/fileHandle/getChunkResponse.js').getChunkResponse;
var getPullChunkListRes = require('./src/fileHandle/getPullChunkListRes.js').getPullChunkListRes;

const app = new Koa();

// corss-domain
app.use(cors({ origin: '*'}));

// use bodyparse
app.use(bodyParser());

// add url-router
//router.post('/api/pullChunkList', async (ctx, next) => {
//  let fileMd5 = ctx.request.body.fileMd5,
//  	  chunksNumber = ctx.request.body.chunksNumber;
//  console.log(`[pullChunkList] fileMd5:${fileMd5}`);
//});
//
//router.pust('/api/uploadChunkFile', async (ctx, next) => {
//  let fileMd5 = ctx.request.body.fileMd5,
//      chunkMd5 = ctx.request.body.chunkMd5,
//	  chunksNumber = ctx.request.body.chunksNumber,
//	  chunkData = ctx.request.body.chunkData;
//  console.log(`[uploadChunkFile] chunkMd5: ${chunkMd5} chunkNumber/chunksNumber: ${chunkNumber}/${chunksNumber}`);
//}):

// use controller 
app.use(controller());

app.listen(8081,'222.20.79.250',()=>{
  console.log('port is running on http://222.20.79.250:8081');
  });

var fn_pullChunkList = async (ctx, next) => {
  let fileMd5 = ctx.request.body.fileMd5,
      chunksNumber = ctx.request.body.chunksNumber;

  console.log(`[pullChunkList] fileMd5: ${fileMd5} chunksNumber: ${chunksNumber}`);

};

var fn_uploadChunkFile = async (ctx, next) => {
  let fileMd5 = ctx.request.body.fileMd5,
      chunkMd5 = ctx.request.body.chunkMd5,
	  chunkData = ctx.request.body.chunkData,
	  chunksNumber = ctx.request.body.chunksNumber;
  
  console.log(`[uploadChunkFile] chunkMd5: $[chunkMd5] chunkNumber/chunksNumber: ${chunkNumber}/${chunksNumber}`);

};

module.exports = [
  {
    method: 'POST',
	path: '/api/pullChunkList',
	func: fn_pullChunkList
  },
  {
    method: 'POST',
	path: '/api/uploadChunkFile',
	func: fn_uploadChunkFile
  }
]

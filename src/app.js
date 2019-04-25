const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const route = require('./route');

const app = new Koa();

// corss-domain
app.use(cors({ origin: '*'}));

// use bodyparse
app.use(bodyParser());

// use route 
app.use(route());

app.listen(8081,'222.20.79.250',()=>{
  console.log('port is running on http://222.20.79.250:8081');
  });

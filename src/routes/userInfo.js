const controller = require('../controllers');

let fn_signIn = async (ctx, next) => {
  let userName = ctx.request.body.name;
  let userPassword = ctx.request.body.password;

  console.log(`[sign in] name: ${userName} password: ${userPassword}`);

  await controller.getUserInfo(ctx);
};

let fn_signUp = async (ctx, next) => {
  let userName = ctx.request.body.name;
  let userPassword = ctx.request.body.password;

  console.log(`[sign up] name: ${userName} password: ${userPassword}`);

  await controller.addUser(ctx);
};

module.exports = [
  {
    method: 'POST',
	path: '/api/signIn',
	func: fn_signIn
  },
  {
    method: 'POST',
	path: '/api/signUp',
	func: fn_signUp
  }
]


'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  // Auth
  Route.post('user/register', 'AuthController.register')
  Route.post('user/login', 'AuthController.login')
  Route.post('user/refresh', 'AuthController.refreshToken')
  Route.delete('user/logout', 'AuthController.logout')
  Route.post('user/reset', 'AuthController.reset')
  Route.post('user/hash', 'AuthController.verifyHash')
  Route.post('user/reset/password', 'AuthController.resetPassword')
  // User
  Route.get('user', 'UserController.show')
  Route.post('user/update', 'UserController.update').middleware('auth')
  // Settings
  Route.get('settings', 'SettingController.show')
  Route.post('settings', 'SettingController.update').middleware('auth')
  // Newsletter
  Route.get('newsletters', 'NewsLetterController.newsLetters').middleware('auth')
  Route.post('newsletter/store', 'NewsLetterController.createNL').middleware('auth')
  Route.post('newsletter/upload', 'NewsLetterController.upload').middleware('auth')
  Route.post('newsletter/publish/:id', 'NewsLetterController.publishNL').middleware('auth')
  Route.get('subscribers', 'NewsLetterController.subscribers').middleware('auth')
  Route.get('subscribe', 'NewsLetterController.subscribe')
  Route.get('confirm', 'NewsLetterController.confirmSubscription')
}).prefix('api/v1')

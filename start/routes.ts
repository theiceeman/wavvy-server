/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})


Route.post('/user/:walletAddress', 'UsersController.create')


Route.group(() => {
  Route.post('/new', 'CollectionsController.create')
  Route.post('/status/:id', 'CollectionsController.status')
  Route.get('/active', 'CollectionsController.view')
}).prefix('/collections')


Route.group(() => {
  Route.get('/get/:collectionId/:tokenId', 'TokensController.tokenDetails')
}).prefix('/tokens')


Route.group(() => {
  // buy with qredos modal endpoint
  Route.post('/create', 'PurchasesController.create')
  // update purchase status
}).prefix('/purchase')


Route.group(() => {
  Route.get('/totalVolume', 'PoolsController.totalVolumeInPools')
  Route.get('/totalLiquidityBorrowed', 'LoansController.totalLoansBorrowed')
  Route.get('/totalLiquidityAvailable', 'PoolsController.totalVolumeAvailableInPools')

  Route.get('/', 'PoolsController.view')
  Route.get('/:uniqueId', 'PoolsController.single') // get single pool detail
  Route.get('/user/:userAddress', 'PoolsController.user') // get all pools by a user

  Route.post('/create', 'PoolsController.create')
  Route.post('/status/:uniqueId', 'PoolsController.status')
  Route.post('/fund/:contractPoolId', 'PoolFundingsController.create')


  // total volume
  // total liquidity borrowed
  // total liquidity available
}).prefix('/pools')

//


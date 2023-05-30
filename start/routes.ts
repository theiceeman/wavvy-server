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
import OpenSea from 'App/Controllers/Marketplace/OpenSea'
import { supportedChains } from 'App/Controllers/types'



Route.get('/', async () => {
  return { hello: 'world' }
})


Route.get('/collections/active', 'CollectionsController.view')


Route.group(() => {
Route.post('/:walletAddress', 'UsersController.create')
Route.get('/viewAll', 'UsersController.viewAll')
}).prefix('/user')


Route.group(() => {
  Route.get('/', 'CollectionsController.view')

  Route.post('/new', 'CollectionsController.create')
  Route.post('/status/:id', 'CollectionsController.status')

  Route.get('/viewAll', 'CollectionsController.viewAll')

  Route.get('/:collectionId', 'CollectionsController.single')
}).prefix('/collections')


Route.group(() => {
  Route.get('/get/:collectionId/:tokenId', 'TokensController.tokenDetails')
}).prefix('/tokens')


Route.group(() => {
  Route.post('/create', 'PurchasesController.create')
  Route.get('/user/projects/:userId', 'PurchasesController.userPurchases')  // my projects
  Route.get('/recent', 'PurchasesController.recent')
  Route.get('/viewAll', 'PurchasesController.viewAll')
}).prefix('/purchase')


Route.group(() => {
  Route.get('/totalVolume', 'PoolsController.totalVolumeInPools')
  Route.get('/totalLiquidityBorrowed', 'LoansController.totalLoansBorrowed')
  Route.get('/totalLiquidityAvailable', 'PoolsController.totalVolumeAvailableInPools')

  Route.get('/viewAll', 'PoolsController.viewAll')
  Route.get('/fundings/viewAll', 'PoolFundingsController.viewAll')

  Route.get('/active', 'PoolsController.viewActive')
  Route.get('/:uniqueId', 'PoolsController.single')
  Route.get('/user/:userAddress', 'PoolsController.user')

  Route.post('/create', 'PoolsController.create')
  Route.post('/status/:uniqueId', 'PoolsController.status')
  Route.post('/fund', 'PoolFundingsController.create')
}).prefix('/pools')


Route.group(() => {
  // buy with qredos modal endpoint
  Route.get('/terms/:poolUniqueId/:collectionUniqueId/:tokenId', 'LoansController.loanTerms')
  Route.get('/viewAll', 'LoansController.viewAll')

  Route.post('/create', 'LoansController.create')
}).prefix('/loan')


Route.group(() => {
  Route.get('/timeline/:loanUniqueId', 'LoanRepaymentsController.timeline')   // loan schedule
  Route.get('/amount/:loanUniqueId', 'LoanRepaymentsController.amountToPay')

  Route.get('/viewAll', 'LoanRepaymentsController.viewAll')

  Route.post('/', 'LoanRepaymentsController.create')
}).prefix('/repayment')


Route.get('/test', async () => {
  return await new OpenSea(supportedChains.ethereum).createPurchase('0xA642375Cc15249A81da9c435fB4eDD8A9343ce7F', '10')
})

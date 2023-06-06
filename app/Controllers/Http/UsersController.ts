import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { formatErrorMessage } from "../Helpers/utils";
import User from 'App/Models/User';
import Database from '@ioc:Adonis/Lucid/Database';


export default class UsersController {

  public async create({ params, response }: HttpContextContract) {
    try {

      const { walletAddress } = params;

      let user = await Database.from("users")
        .where('wallet_address', walletAddress)
      if (user.length > 0) {
        response.status(200).json(user[0].unique_id);
        return;
      }

      const result = await User.create({
        walletAddress: walletAddress
      });

      if (result === null) {
        throw new Error("Registration failed!");
      }
      user = await Database.from("users")
        .where('wallet_address', walletAddress)


      response.status(200).json(user[0].unique_id);


    } catch (error) {
      let data = await formatErrorMessage(error)
      response.status(400).json({ data })
    }
  }


  public async viewAll({
    response
  }: HttpContextContract) {
    try {
      let data = await Database.from("users")


      response.status(200).json({ data });
    } catch (error) {
      response.status(400).json({ data: error.message });
    }
  }



}

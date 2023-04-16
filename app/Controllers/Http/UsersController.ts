import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { formatErrorMessage } from "../Helpers/utils";
import User from 'App/Models/User';


export default class UsersController {

  public async create({ params, response }: HttpContextContract) {
    try {
      const { walletAddress } = params;
      const result = await User.create({
        walletAddress: walletAddress
      });

      if (result === null) {
        throw new Error("Registration failed!");
      } else {
        response.status(200).json({ data: walletAddress });
      }

    } catch (error) {
      let data = await formatErrorMessage(error)
      response.status(400).json({ data })
    }
  }



}

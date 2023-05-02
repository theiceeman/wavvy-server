// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Database from "@ioc:Adonis/Lucid/Database";

export default class LoansController {



  public async totalLoansBorrowed() {
    let volumeBorrowed = 0;
    let loans = await Database.from("loans")

    for (const each of loans) {
      volumeBorrowed += each.principal
    }

    return volumeBorrowed
  }



}

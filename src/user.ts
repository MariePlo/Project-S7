import { LevelDB } from "./leveldb"
import WriteStream from 'level-ws'

export class UserHandler {
  public db: any

  constructor(path: string) {
    this.db = LevelDB.open(path)
  }

  public closeDB() {
    this.db.close();
  }

  public get(username: string, callback: (err: Error | null, result?: User) => void) {
    this.db.get(`user:${username}`, function (err: Error, data: any) {
        if (err) callback(err)
        else if (data === undefined) callback(null, data)
        else callback(null, User.fromDb(username, data))
    })
  }

  //get all the users' data
  public getAll(callback: (err: Error | null, result?: User[]) => void) {
    let users: User[] = [];
    this.db.createReadStream()
        .on('data', function (data) {
            let username: string = data.key.split(':')[1];
            users.push(User.fromDb(username, data.value));
        })
        .on('error', function (err) {
            //console.log('Oh my!', err);
            callback(err);
        })
        .on('close', function () {
            //console.log('Stream closed');
            callback(null, users);
        })
        .on('end', function () {
            //console.log('Stream ended')
        });
}

  //add a new user in the dayabase 
  public save(user: User, callback: (err: Error | null) => void) {
    this.db.put(`user:${user.username}`, `${user.password}:${user.email}`, (err: Error | null) => {
      callback(err)
    })
  }

  //Delete an user in the database
  public delete(username: string, callback: (err: Error | null) => void) {
    let key: string = `user:${username}`;
        this.db.del(key, function (err) {
            callback(err);
        });
  }
}



export class User {
  public username: string
  public email: string
  public password: string = ""

  constructor(username: string, email: string, password: string, passwordHashed: boolean = false) {
    this.username = username
    this.email = email

    if (!passwordHashed) {
      //console.log("USERNAME : "+username)
      //console.log("EMAIL : "+email)
      //console.log("PASSWORD : "+password)
      this.setPassword(password)
    } else this.password = password
  }

  static fromDb(username: string, value: any): User {
    const [password, email] = value.split(":")
    //console.log(value)
    return new User(username, email, password)
  }

  public setPassword(toSet: string): void {
    // Hash and set password
    this.password = toSet
  }

  public getPassword(): string {
    return this.password
  }

  public validatePassword(toValidate: String): boolean {
    //return comparison with hashed password
    //console.log("Entered password :"+toValidate)
    //console.log("user's password : "+this.password)
    //4console.log(this.password === toValidate)
    return this.password == toValidate

  }

}
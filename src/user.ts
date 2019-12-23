//import functions
import { LevelDB } from "./leveldb"
import WriteStream from 'level-ws'

//Declaration class UserHandler
export class UserHandler {
  public db: any

  constructor(path: string) {
    this.db = LevelDB.open(path)
  }

  public closeDB() {
    this.db.close();
  }

  //Get user data
  public get(username: string, callback: (err: Error | null, result?: User) => void) {
    this.db.get(`user:${username}`, function (err: Error, data: any) {
        if (err) callback(err)
        else if (data === undefined) callback(null, data)
        else callback(null, User.fromDb(username, data))
    })
  }

  //get users data
  public getAll(callback: (err: Error | null, result?: User[]) => void) {
    let users: User[] = [];
    this.db.createReadStream()
        .on('data', function (data) {
            let username: string = data.key.split(':')[1];
            users.push(User.fromDb(username, data.value));
        })
        .on('error', function (err) {
            callback(err);
        })
        .on('close', function () {
            callback(null, users);
        })
        .on('end', function () {
        });
}

  //Add new user
  public save(user: User, callback: (err: Error | null) => void) {
    this.db.put(`user:${user.username}`, `${user.password}:${user.email}`, (err: Error | null) => {
      callback(err)
    })
  }

  //Delete user
  public delete(username: string, callback: (err: Error | null) => void) {
    let key: string = `user:${username}`;
        this.db.del(key, function (err) {
            callback(err);
        });
  }
}

//Declaration class User
export class User {
  public username: string
  public email: string
  public password: string = ""

  constructor(username: string, email: string, password: string, passwordHashed: boolean = false) {
    this.username = username
    this.email = email

    if (!passwordHashed) {
      this.setPassword(password)
    } else this.password = password
  }

  //New
  static fromDb(username: string, value: any): User {
    const [password, email] = value.split(":")
    return new User(username, email, password)
  }

  //Set password
  public setPassword(toSet: string): void {
    this.password = toSet
  }

  //Get password
  public getPassword(): string {
    return this.password
  }

  //Check password
  public validatePassword(toValidate: String): boolean {
    return this.password == toValidate

  }

}
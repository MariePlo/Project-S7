import {expect} from 'chai'
import {LevelDB} from "../leveldb"
import {UserHandler, User} from "../user";

const dbPath: string = './db/test/users';
var dbUser: UserHandler;


describe('Users', function () {
    before(function () {
        LevelDB.clear(dbPath);
        dbUser = new UserHandler(dbPath)
    });

    describe('#get', function () {
        it('should not find the user and get an error', function (done) {
            dbUser.get("jkvbreig", function (err: Error | null, result?: User) {
                expect(err).to.not.be.null;
                expect(result).to.be.undefined;
                done()
            })
        });
    })

    describe('#save', function () {
        it('should save a new user and get it', function (done) {
            const user1 : User = new User("elisabeth", "elisabeth2.TheQueen@gmail.com", "123456")
            const user2 : User = new User("Charles", "charles.PrinceOfWales.com", "123456")
            let users : User[] = []
            users.push(user1);
            users.push(user2);

            dbUser.save(user1, function (err: Error | null) {
                dbUser.save(user2, function (err: Error | null) {
                    dbUser.getAll( function (error: Error | null, result?: User []) {
                        expect(error).to.be.null;
                        expect(result).to.not.be.undefined;
                        expect(result).to.be.an('array')
                        expect(result).to.have.lengthOf(2)
                        expect(result).to.deep.include.members(users)
                        console.log(result)
                        done()
                    })
                })
            })
        });
        
    })

    describe('#delete', function () {
        it('should fail if user does not exist', function (done) {
            dbUser.delete('William', function (err: Error | null) {
                expect(err).to.not.be.null;
                done()
            })
        })

        it('should delete the user from the database', function (done) {
            dbUser.delete('elisabeth', function (err: Error | null) {
                expect(err).to.be.undefined;
                dbUser.getAll( function (error: Error | null, result?: User []) {
                    expect(error).to.be.null;
                    expect(result).to.not.be.undefined;
                    expect(result).to.be.an('array')
                    expect(result).to.have.lengthOf(1)
                    console.log(result)
                    done()
                })
                
            })
        })
    })
    

    after(function () {
        dbUser.closeDB()
    })

});
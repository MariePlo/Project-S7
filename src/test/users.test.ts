//import functions
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

	//Get non existing user
    describe('#get info from non existing user', function () {
        it('sends error', function (done) {
            dbUser.get("Marie", function (err: Error | null, result?: User) {
                expect(err).to.not.be.null;
                expect(result).to.be.undefined;
                done()
            })
        })
    })

	//Save users
    describe('#save new users', function () {
        it('saves two new users and returns them right', function (done) {
            const user1 : User = new User("Thomas", "thomas.virondaud@edu.ece.fr", "1212")
            const user2 : User = new User("Marie", "marie.ploteau@edu.ece.fr", "2121")
            let users : User[] = []
            users.push(user1);
            users.push(user2);

            dbUser.save(user1, function (err: Error | null) {
                dbUser.save(user2, function (err: Error | null) {
                    dbUser.getAll( function (error: Error | null, result?: User []) {
                        expect(result).to.be.an('array')
                        expect(result).to.have.lengthOf(2)
                        expect(result).to.deep.include.members(users)
                        console.log(result)
                        done()
                    })
                })
            })
        })
        
    })

	//Delete user, existing and non existing
    describe('#delete user', function () {

		//non existing
        it('sends error if user does not already exist', function (done) {
            dbUser.delete('Tomas', function (err: Error | null) {
                expect(err).to.not.be.null;
                done()
            })
        })

		//existing
        it('deletes user if he exists', function (done) {
            dbUser.delete('Thomas', function (err: Error | null) {
                expect(err).to.be.undefined;
                dbUser.getAll( function (error: Error | null, result?: User []) {
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
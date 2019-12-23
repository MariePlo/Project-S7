//import functions
import {expect} from'chai'
import {Metric, MetricsHandler} from '../metrics'
import {LevelDB} from "../leveldb"

const dbPath: string = './db/test/metrics';
var dbMet: MetricsHandler;

describe('Metrics', function () {
    before(function () {
        LevelDB.clear(dbPath)
        dbMet = new MetricsHandler(dbPath)
      })

	//Get metrics from user not signed in
    describe('#get', function () {
        it('returns empty array', function (done) {
            dbMet.getAll("Marie", function (err: Error | null, result?: Metric[]| null) {
                expect(err).to.be.null
                expect(result).to.not.be.undefined
                expect(result).to.be.empty
                done()
            })
        })
    })

	//Save metrics
    describe('#save', function () {
        it("saves and gets metrics", function (done) {
            let metrics: Metric[] = [];
            const username: string = "Thomas";
            const met = [
                new Metric(`${new Date('2019-12-24 20:00 UTC').getTime()}`, "1"),
				new Metric(`${new Date('2019-12-25 20:00 UTC').getTime()}`, "2")
            ]
            met.forEach((metric)=> metrics.push(metric));
            dbMet.save(username, metrics, function (err: Error | null, result?: Metric[]) {
                dbMet.getAll(username, function (err: Error | null, result?: Metric[] | null) {
                    expect(err).to.be.null;
                    expect(result).to.not.be.undefined;
                    expect(result).to.not.be.empty;
                    expect(result).to.be.an("array");
                    expect(result).to.have.lengthOf(2)
                    expect(result).to.deep.include.members([
                        {timestamp: '1577217600000', value: '1'},
						{timestamp: '1577304000000', value: '2'},
                    ]);
                    console.log(result)
                    done()
                })
            })
        })

		//Update metrics
        it("updates metric", function (done) {
            const username: string = "Thomas";
            const timestamp: string = "1577217600000";
            const value: string = "3";
            dbMet.add(username, timestamp, value)
            dbMet.getAll(username, function (err: Error | null, data?: Metric[] | null) {
                expect(err).to.be.null;
                expect(data).to.not.be.undefined;
                expect(data).to.not.be.empty;
                expect(data).to.be.an("array");
                expect(data).to.have.lengthOf(2)
                expect(data).to.deep.include.members([
                    {timestamp: '1577217600000', value: '3'}
                ]);
                console.log(data)
                done()
            })
        })
    })

	//Delete metrics from existing user and non existing user
    describe('#delete', function () {

		//existing user
        it("deletes metric", function (done) {
            const username: string = "Thomas";
            const timestamp: string = "1577217600000";
            dbMet.delete(username, timestamp, function (err: Error | null) {
                dbMet.getAll(username, function (err: Error | null, data?: Metric[] | null) {
                    expect(err).to.be.null;
                    expect(data).to.not.be.undefined;
                    expect(data).to.not.be.empty;
                    expect(data).to.be.an("array");
                    expect(data).to.have.lengthOf(1)
                    expect(data).to.deep.include.members([{timestamp: '1577304000000', value: '2' }]);
                    console.log(data)
                    done()
                })
            })
    })

	//non existing user	
    it('sends error', function (done) {
        dbMet.delete('Marie', '1577304000000', function (err: Error | null) {
            expect(err).to.be.undefined;
            done()
        })
    })
})

    after(function () {
        dbMet.closeDB()
    })
})
//import functions
import {expect} from'chai'
import {Metric, MetricsHandler} from '../metrics'
import {LevelDB} from "../leveldb"

const dbPath: string = './db/test/metrics';
var met: MetricsHandler;

describe('Tests on metrics', function () {
    before(function () {
        LevelDB.clear(dbPath)
        met = new MetricsHandler(dbPath)
      })

	//Get metrics from user not signed in
    describe('#get metrics from non existing user', function () {
        it('returns an empty array', function (done) {
            met.getAll("Marie", function (err: Error | null, result?: Metric[]| null) {
                expect(result).to.be.empty
				console.log("result: " + result)
                done()
            })
        })
    })

	//Save new metrics
    describe('#save metrics', function () {
        it("saves two new metrics and returns them right", function (done) {
            let metrics: Metric[] = [];
            const username: string = "Thomas";
            const tab = [
                new Metric(`${new Date('2019-12-24 20:00 UTC').getTime()}`, "1"),
				new Metric(`${new Date('2019-12-25 20:00 UTC').getTime()}`, "2")
            ]
            tab.forEach((metric)=> metrics.push(metric));
            met.save(username, metrics, function (err: Error | null, result?: Metric[]) {
                met.getAll(username, function (err: Error | null, result?: Metric[] | null) {
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
	})


	//Delete metrics from existing user and non existing user
    describe('#delete metrics', function () {

		//existing user
        it("deletes metric if user exists", function (done) {
            const username: string = "Thomas";
            const timestamp: string = "1577217600000";
            met.delete(username, timestamp, function (err: Error | null) {
                met.getAll(username, function (err: Error | null, data?: Metric[] | null) {
                    expect(data).to.be.an("array");
                    expect(data).to.have.lengthOf(1)
                    expect(data).to.deep.include.members([{timestamp: '1577304000000', value: '2' }]);
                    console.log(data)
                    done()
                })
            })
    })

	//non existing user	
    it('sends error if user does not exist', function (done) {
        met.delete('Marie', '1577304000000', function (err: Error | null) {
            expect(err).to.be.undefined;
            done()
        })
    })
})

    after(function () {
        met.closeDB()
    })
})
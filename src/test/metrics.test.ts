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


    describe('#get', function () {
        it('should get an empty array on non existing user', function (done) {
            dbMet.getAll("uvhviu", function (err: Error | null, result?: Metric[]| null) {
                expect(err).to.be.null
                expect(result).to.not.be.undefined
                expect(result).to.be.empty
                done()
            })
        })
    })

    describe('#save', function () {
        it("should save and get user's metrics", function (done) {
            let metrics: Metric[] = [];
            const username: string = "elisabeth";
            const met = [
                new Metric(`${new Date('2019-12-20 12:00 UTC').getTime()}`, "20"),
                new Metric(`${new Date('2019-12-21 12:00 UTC').getTime()}`, "50")
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
                        {timestamp: '1576843200000', value: '20'},
                        {timestamp: '1576929600000', value: '50' }
                    ]);
                    console.log(result)
                    done()
                })
            })
        })

        it("should update one metric value", function (done) {
            const username: string = "elisabeth";
            const timestamp: string = "1576843200000"; // before updating this metric, its value was equal to 20. See above
            const value: string = "100";
            dbMet.add(username, timestamp, value)
            console.log("Data is updating") //DO NOT COMMIT THIS LINE!!
            dbMet.getAll(username, function (err: Error | null, data?: Metric[] | null) {
                expect(err).to.be.null;
                expect(data).to.not.be.undefined;
                expect(data).to.not.be.empty;
                expect(data).to.be.an("array");
                expect(data).to.have.lengthOf(2)
                expect(data).to.deep.include.members([
                    {timestamp: '1576843200000', value: '100'},
                    {timestamp: '1576929600000', value: '50' }
                ]);
                console.log(data)
                done()
            })
        })
    })


    describe('#delete', function () {
        it("should delete one metric in user's data", function (done) {
            const username: string = "elisabeth";
            const timestamp: string = "1576843200000"; //this timestamp already exists in the database
            dbMet.delete(username, timestamp, function (err: Error | null) {
                console.log("Data is updating")
                dbMet.getAll(username, function (err: Error | null, data?: Metric[] | null) {
                    expect(err).to.be.null;
                    expect(data).to.not.be.undefined;
                    expect(data).to.not.be.empty;
                    expect(data).to.be.an("array");
                    expect(data).to.have.lengthOf(1)
                    expect(data).to.deep.include.members([{timestamp: '1576929600000', value: '50' }]);
                    console.log(data)
                    done()
                })
            })
    })

    it('should not fail if data does not exist', function (done) {
        dbMet.delete('zeihvizjkvb', '1576929600000', function (err: Error | null) {
            expect(err).to.be.undefined;
            done()
        })
    })
})


    after(function () {
        dbMet.closeDB()
    })
})
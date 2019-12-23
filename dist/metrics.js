"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var leveldb_1 = require("./leveldb");
var level_ws_1 = __importDefault(require("level-ws"));
var Metric = /** @class */ (function () {
    function Metric(ts, v) {
        this.timestamp = ts;
        this.value = v;
    }
    return Metric;
}());
exports.Metric = Metric;
var MetricsHandler = /** @class */ (function () {
    function MetricsHandler(dbPath) {
        this.db = leveldb_1.LevelDB.open(dbPath);
    }
    /*Save several metrics at once */
    MetricsHandler.prototype.save = function (key, metrics, callback) {
        var stream = level_ws_1.default(this.db);
        stream.on('error', callback);
        stream.on('close', callback);
        metrics.forEach(function (m) {
            stream.write({ key: "metric:" + key + ":" + m.timestamp, value: m.value });
        });
        console.log(metrics);
        stream.end();
    };
    /*Get all the metrics from the user with key*/
    MetricsHandler.prototype.getAll = function (key, callback) {
        // Read
        var metrics = [];
        this.db.createReadStream()
            .on('data', function (data) {
            //console.log(key)
            var id = data.key.split(':')[1];
            //console.log(data.key)
            //console.log(id)
            if (id == key) {
                var timestamp = data.key.split(':')[2];
                //console.log('data.key.split2 : '+data.key.split(':')[2])
                var oneMetric = new Metric(timestamp, data.value);
                metrics.push(oneMetric);
            }
        })
            .on('error', function (err) {
            //console.log('Oh my!', err)
            callback(err, null);
        })
            .on('close', function () {
            //console.log('Stream closed')
            callback(null, metrics);
        })
            .on('end', function () {
            //console.log('Stream ended')
        });
    };
    //Delete user's metric in the database
    MetricsHandler.prototype.delete = function (user, timestamp) {
        var key = "metric:" + user + ":" + timestamp + "";
        this.db.del(key, function (err) { return null; });
    };
    //Add a new metric in user's database
    MetricsHandler.prototype.add = function (user, timestamp, value) {
        var key = "metric:" + user + ":" + timestamp + "";
        var Value = value;
        this.db.put(key, Value, function (err) { return null; });
    };
    return MetricsHandler;
}());
exports.MetricsHandler = MetricsHandler;

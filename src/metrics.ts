//import functions
import { LevelDB } from './leveldb'
import WriteStream from 'level-ws'

//Declaration class Metrics
export class Metric {
  public timestamp: string
  public value: string

  constructor(ts: string, v: string) {
    this.timestamp = ts
    this.value = v
  }
}

//Declaration class MetricsHandler
export class MetricsHandler {

  private db: any

  constructor(dbPath: string) {
    this.db = LevelDB.open(dbPath)
  }

  //To close database
  public closeDB() {
    this.db.close();
  }

  //To save multiple metrics
  public save(key: string, metrics: Metric[], callback: (error: Error | null) => void) {
    const stream = WriteStream(this.db)
    stream.on('error', callback)
    stream.on('close', callback)
    metrics.forEach((m: Metric) => {
      stream.write({ key: `metric:${key}:${m.timestamp}`, value: m.value })
    })
    stream.end()
  }

  //To get the metrics
  public getAll(key: string, callback: (error: Error | null, result: Metric[] | null) => void) {
    // Read
    let metrics: Metric[] = [];
    this.db.createReadStream()
      .on('data', function (data) {
        let id: string = data.key.split(':')[1]
        if( id == key )
        {
          let timestamp: string = data.key.split(':')[2]
          let oneMetric: Metric = new Metric(timestamp, data.value)
          metrics.push(oneMetric)
        }
        
      })
      .on('error', function (err) {
        callback(err, null)
      })
      .on('close', function () {
        callback(null, metrics)
      })
      .on('end', function () {
      })
  }

  //To delete the metrics
  public delete(user : string, timestamp: string, callback: (error: Error | null) => void) {
    let key : string = "metric:"+user+":"+timestamp+""
    this.db.del(key,function (err) {
      callback(err);
  });
  }

  //To add a metrics
  public add(user : string, timestamp: string, value : string) {
    let key : string = "metric:"+user+":"+timestamp+""
    let Value : string = value
    this.db.put(key,Value, (err)=>null)
  }
  
}

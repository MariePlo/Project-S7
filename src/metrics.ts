import { LevelDB } from './leveldb'
import WriteStream from 'level-ws'

export class Metric {
  public timestamp: string
  public value: string

  constructor(ts: string, v: string) {
    this.timestamp = ts
    this.value = v
  }
}

export class MetricsHandler {

  private db: any

  constructor(dbPath: string) {
    this.db = LevelDB.open(dbPath)
  }

  /*Save several metrics at once */
  public save(key: string, metrics: Metric[], callback: (error: Error | null) => void) {
    const stream = WriteStream(this.db)
    stream.on('error', callback)
    stream.on('close', callback)
    metrics.forEach((m: Metric) => {
      stream.write({ key: `metric:${key}:${m.timestamp}`, value: m.value })
    })
    console.log(metrics);
    stream.end()
  }

  /*Get all the metrics from the user with key*/
  public getAll(key: string, callback: (error: Error | null, result: Metric[] | null) => void) {
    // Read
    let metrics: Metric[] = [];
    this.db.createReadStream()
      .on('data', function (data) {
        //console.log(key)
        let id: string = data.key.split(':')[1]
        //console.log(data.key)
        //console.log(id)
        if( id == key )
        {
          let timestamp: string = data.key.split(':')[2]
          //console.log('data.key.split2 : '+data.key.split(':')[2])
          let oneMetric: Metric = new Metric(timestamp, data.value)
          metrics.push(oneMetric)
        }
        
      })
      .on('error', function (err) {
        //console.log('Oh my!', err)
        callback(err, null)
      })
      .on('close', function () {
        //console.log('Stream closed')
        callback(null, metrics)
      })
      .on('end', function () {
        //console.log('Stream ended')
      })
  }

  //Delete user's metric in the database
  public delete(user : string, timestamp: string) {
    let key : string = "metric:"+user+":"+timestamp+""
    this.db.del(key, (err)=>null)
  }

  //Add a new metric in user's database
  public add(user : string, timestamp: string, value : string) {
    let key : string = "metric:"+user+":"+timestamp+""
    let Value : string = value
    this.db.put(key,Value, (err)=>null)
  }
  
}

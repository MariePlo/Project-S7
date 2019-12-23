import { Metric, MetricsHandler } from '../src/metrics'
import {UserHandler, User} from "../src/user";

/*
const met = [
  new Metric(`${new Date('2013-11-04 14:00 UTC').getTime()}`, 12),
  new Metric(`${new Date('2013-11-04 14:15 UTC').getTime()}`, 10),
  new Metric(`${new Date('2013-11-04 14:30 UTC').getTime()}`, 8)
]*/

const dbMet: MetricsHandler = new MetricsHandler('./db/metrics') //create or open a levelDB database
const dbUser: UserHandler = new UserHandler('./db/users') //create or open a levelDB database

//create an array of users
const users = [
  new User("loic", "huangloic@hotmail.com", "123456"),
  new User("chirag", "chiraggupta199806@gmail.com", "123456")
];


/*we could write "metrics_loic" like the variable "met" above (put in comment) 
But during the project, we had already filled the database. 
So to be fast and keep the same metrics, that's why we decide to write like that (see metrics_loic and metrics_chirag below)
*/
const metrics_loic = [
  {"timestamp":"1575867600000","value":"42"},
  {"timestamp":"1575932400000","value":"35"},
  {"timestamp":"1575968400000","value":"20"},
  {"timestamp":"1576004400000","value":"50"},
  {"timestamp":"1576062000000","value":"45"},
  {"timestamp":"1576148400000","value":"30"}
]

const metrics_chirag = [
  {"timestamp":"1575154800000","value":"10"},
  {"timestamp":"1575241200000","value":"15"},
  {"timestamp":"1575327600000","value":"40"},
  {"timestamp":"1575345600000","value":"80"},
  {"timestamp":"1575414000000","value":"50"},
  {"timestamp":"1575457200000","value":"45"},
  {"timestamp":"1575673200000","value":"45"}
]

//Add users' data
users.forEach(user => {
  // Save user
  console.log('Initialize the database - User ' + user.username +  '  added');
  dbUser.save(user, (err: Error | null) => {
      if (err) throw err;
  });

  if (user.username === "loic") {
    metrics_loic.forEach(metrics => {
      dbMet.add(user.username,metrics.timestamp, metrics.value)
    })
    console.log(user.username+"'s metrics added")
  }
  else {
    metrics_chirag.forEach(metrics => {
      dbMet.add(user.username,metrics.timestamp, metrics.value)
    })
    console.log(user.username+"'s metrics added")
  }
})
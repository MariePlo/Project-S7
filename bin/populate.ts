import { Metric, MetricsHandler } from '../src/metrics'
import {UserHandler, User} from "../src/user";

const dbMet: MetricsHandler = new MetricsHandler('./db/metrics') //create or open a levelDB database
const dbUser: UserHandler = new UserHandler('./db/users') //create or open a levelDB database

//create an array of users with two users
const users = [
  new User("user", "user@ece.com", "password"),
  new User("user2", "user2@ece.com", "password2")
];


const metrics_user = [
  {"timestamp":"1575867600000","value":"42"},
  {"timestamp":"1575932400000","value":"35"},
  {"timestamp":"1575968400000","value":"20"},
  {"timestamp":"1576004400000","value":"50"},
  {"timestamp":"1576062000000","value":"45"},
  {"timestamp":"1576148400000","value":"30"}
]

const metrics_user2 = [
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

  if (user.username === "user") {
    metrics_user.forEach(metrics => {
      dbMet.add(user.username,metrics.timestamp, metrics.value)
    })
    console.log(user.username+"'s metrics have been added")
  }
  else {
    metrics_user2.forEach(metrics => {
      dbMet.add(user.username,metrics.timestamp, metrics.value)
    })
    console.log(user.username+"'s metrics have been added")
  }
})
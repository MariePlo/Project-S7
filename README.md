# ECE NodeJS Project 2019-2020

## Authors
- CHEONG Loïc : huangloic@hotmail.com
- GUPTA Chirag : chiraggupta199806@gmail.com

ECE's students in the group ING 4 SI 03 Inter 

## About this work
This work is the final project in NodeJS  for the Web Technology course at ECE Paris-Lyon, ING4.

There are : 
- Home page
- Sign In / Sign Up / Sign Out
- Insert/update/delete metrics once logged in
- Retrieve the user’s metrics and display it in a graph
- Only access the user’s metrics, not the other ones

## Users' credentials:
- username : loic ; password : 123456
- username : chirag ; password : 123456

NB: 
    - Don't hesitate to play with the UI (User Interface). Enter a wrong username or password to display an error message in the front.
    - Moreover don't forget to use `npm run populate`, otherwise these ceredentials won't work.

## List of routes

* GET
    - http://localhost:8082/ 
    - http://localhost:8082/login
    - http://localhost:8082/logout
    - http://localhost:8082/signup
    - http://localhost:8082/metrics/:usename read raw metrics being unlogged
    - http://localhost:8082/user/:username read user's credentials

* POST
    - http://localhost:8082/metrics/:usename insert metrics unlogged from Postman
    - http://localhost:8082/login
    - http://localhost:8082/signup
    - http://localhost:8082/delete Delete a metric when connected
    - http://localhost:8082/add Add a new metric when connected
    - http://localhost:8082/convert Convert datetime into timestamp
    - http://localhost:8082/convert2 Convert timestamp into datetime
    - http://localhost:8082/user/ Add a new user from Postman



## Run instructions
After you cloned the repository , execute those commands :
- `cd Final-Project-NodeJS`
- `npm install` Install all the dependencies
- `npm run populate` Populate the database
- `npm run build` Build to convert .ts files into .js files in /dist folder
- `npm start` (run the app) or `npm run dev` (reload the page when changes occurs in the source code)

Then open a browser with the link below http://localhost:8082/


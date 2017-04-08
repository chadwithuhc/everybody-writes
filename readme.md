# Everybody Writes

> A real-time classroom feedback tool in your browser

## Features

__Note: Only compatible in ES6 browsers (Chrome)__

- [x] Anyone with URL can join
  - [x] Joining a room available from homepage
  - [x] First person is considered owner
  - [x] Owner can be switched by owner
  - [x] If owner leaves, next earliest user is promoted
- [ ] Option of input type
  - [x] Textarea
  - [ ] Code Editor
  - [ ] Drawing
- [ ] Show all available answers


## Technologies

NodeJS, Express, Socket.io, Handlebars, ES6

#### Techniques used

DOM Manipulation, HOF, Event Delegation


## Running an exercise locally

Clone repo:  
```
git clone https://github.com/chadwithuhc/everybody-writes.git
npm install
nodemon
# OR
npm start
```

## Developers

You can turn on Mock Data by appending `?mockData=1` to a room URL. For example:
```
http://localhost:3000/rooms/debugging?mockData=1
```

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
  - [ ] Whiteboard
  - [ ] Markdown
- [x] Show all available answers
- [ ] Show main question
- [ ] Highlight a good answer
- [ ] Accepted vs non-accepted answers
- [ ] BUG: Case insensitive URLs


## Technologies

**Server**
- NodeJS
- Express
- Socket.io

**Client**
- ES6
- Handlebars

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

[Developer Docs](./docs) are available if you are interested in contributing

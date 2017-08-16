# Everybody Writes

> A real-time classroom feedback tool in your browser

## Features

__Note: Only compatible in ES6 browsers (Chrome)__

- [x] Anyone with URL can join
  - [x] Joining a room available from homepage
  - [x] First person is considered owner

### Roles
- [x] Owner
  - [x] First person is considered owner
  - [x] Owner can be switched by owner
  - [x] If owner leaves, next earliest user is promoted
  - [ ] Owner can assign roles to others
  - [ ] Can Hide a user (for inappropriate content)
- [ ] Student
  - [x] Default role when joining room
- [ ] Assistant
  - [ ] Can mark answers correct/incorrect
  - [ ] Can Hide a user (for inappropriate content)

### Board Setup
- [ ] Instructions
- [ ] Options
- [ ] Answer (to auto-accept answers)
- [ ] Timer

### Input Types
- [x] Textarea
- [x] True/False
- [x] Code Editor
  - [ ] Allow choice of language
* [ ] Multiple Choice
  - [ ] Correct answer
- [ ] Whiteboard
- [ ] Markdown
- [ ] Fist of 5

### Bugs
- [ ] BUG: Case insensitive URLs

### Backlog
- [ ] Highlight a good answer
- [ ] Accepted vs non-accepted answers
  - [ ] Highlight a good answer


## Technologies

**Server**
- NodeJS
- Express
- Socket.io

**Client**
- ES6
- Handlebars

#### Techniques used

DOM Manipulation, HOF, Event Delegation, OOP Interfaces


## Running an exercise locally

Clone repo:  
```
git clone https://github.com/chadwithuhc/everybody-writes.git
npm install
nodemon index.js
# OR
npm run dev
```

## Developers

[Developer Docs](./docs) are available if you are interested in contributing

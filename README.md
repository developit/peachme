peachme
=======

[![Greenkeeper badge](https://badges.greenkeeper.io/developit/peachme.svg)](https://greenkeeper.io/)

Auto-follow users on Peach. Based on [peach-client](http://npm.im/peach-client).

> Deploy this to Heroku or Dokku and set `PEACH_EMAIL` + `PEACH_PASSWORD` for instant sucess.

#### To follow someone:

```
POST /follow
{ "name": "theirusername" }
```

#### Or by stream ID:

```
POST /follow
{ "id": "23409u23509u23" }
```

## Installation

```sh
# clone it
git clone git@github.com:developit/peachme.git
cd peachme

# install deps
npm install

# Run it
PORT=8080 PEACH_EMAIL=a@b.c PEACH_PASSWORD=1234 npm start
```

# Timberlea

Timberlea is a web file manager. It supports various file management actions.

It has been named Timberlea to reflect the importance of the forest and lumbering of its inception author.

## Client

Timberlea offers a web client that has the objective to be easy to use enforced by a simple UI.

## Server

Timberlea is supported by a statless HTTP REST Server. It allows different type of clients to connect as long they respect the API.

By design, it's not the fastest, but it tries to be convenient and to offer usefull features.

## Features

* Upload file
* Download file
* Copy and paste
* Cut and paste
* Rename file and directory
* Delete file and directory
* Navigate directory
* Create file
* Create directory
* Set up locations
* Bookmark

## Upcoming features

* Authentification
* Profile
  * File access per profile
  * Action per profile
* Filter files
* CLI client
* Image viewer
* Music streamer
* Text editor
* Open file
* Search
* Compress
* Decompress
* Storage analysis
* Map network drive
  * Map FTP
  * Map smb
* Documented api

## Prerequisites

To be able to run Timberlea you need the latest version of Node.js.

_Note: Earlier LTS versions of Node.js migth work as well._

## Installation

To install and run Timberlea perform the following commands.

```bash
npm install
```

npm run build

npm run timber

## How to run Timberlea

The two main ways to run Timberlea is in production and development mode

### production mode

Before using the production mode you need to package the application at least one time.

```bash

npm run build

```

Once done, now you can run Timberlea.

```bash

npm run timber

```

### development mode

In devellopment mode, no needs to build the application. Just run the following command.

```bash

npm run timberDev

```

It will run both the server and client on localhost.

## Configuration

Timberlea uses [config](https://www.npmjs.com/package/config) to manage its configurations. It lets you define a set of default parameters, and extend them for different deployment environments (development, qa, staging, production, etc.).

By default, the configuration files are located in ./server/config directory, but this can be overlaoded easily. For more on that please refer to [config](https://www.npmjs.com/package/config) documentation.

### Server parameters

The server config parameters are host and port.

```json5
 server: {
    host: "localhost",
    port: 3000
  }
```

#### File paths

To make Timberlea to work you have to set up at least one directory.

The definition of a directtry contains a `label` and a `path`.

`path` is for a given filepath on server or a defined [environment variable](https://en.wikipedia.org/wiki/Environment_variable)

_Special cases_: if environment variables **TEMP** and **HOME** aren't defined, the server uses the value returned by the Node API namely by `os.tmpdir()` and `os.homedir()` respectively.

```json5
  directories: [
    { label: 'TEMP', path: 'TEMP' },
    { label: 'HOME', path: 'HOME' },
    { label: 'Storage', path: 'd:\\' }
  ]
```

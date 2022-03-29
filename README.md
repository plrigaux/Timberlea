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
* Download compressed file
* Image viewer
* Filter files

## Upcoming features

* Authentification
* Profile
  * File access per profile
  * Action per profile
* CLI client
* Music streamer
* Text editor
* Open file
* Search
* Storage analysis
* Map network drive
  * Map FTP
  * Map smb
* Documented api
* HTTPS

## Prerequisites

To be able to run Timberlea you need the latest version LTS of [Node.js](https://nodejs.org).

_Note: Earlier LTS versions of Node.js might work as well._

## Installation

To install and run Timberlea perform the following commands.

```bash
npm install
```

## How to run Timberlea

The two main ways to run Timberlea is in production and development mode

### production mode

Before using the production mode, you need to package the application at least once.

```bash

npm run build

```

Once done, now you can run Timberlea.

```bash

npm run timber

```

### development mode

In development mode, no needs to build the application. Just run the following command.

```bash

npm run timberDev

```

It will run both the server and client on `localhost`.

**_Note:_** the client is developed on Angular. Its default address is [http://localhost:4100](http://localhost:4100).

## How to use

To use Timberlea, just open your favorite last generation browser and put the configure server url in production (e.g. [http://localhost:3000](http://localhost:3000)) or the client one (e.g. [http://localhost:4100](http://localhost:4100)) if you are in development.

## Configuration

Timberlea uses [config](https://www.npmjs.com/package/config) to manage its configurations. It lets you define a set of default parameters, and extend them for different deployment environments (development, qa, staging, production, etc.).

By default, the configuration files are located in ./server/config directory, but this can be overloaded easily with environment variables `NODE_CONFIG` and `NODE_CONFIG_DIR`. For information on how to overload the configuration, please refer to the [config](https://www.npmjs.com/package/config) documentation.

### Server parameters

The server configuration parameters are `host` and `port`.

```json5
 server: {
    host: "localhost",
    port: 3000
  }
```

#### Directories paths

To make Timberlea working, you have to set up at least one directory.

The definition of a directory contains a `label` and a `path`.

`path` is for a given file path on the server machine or a defined [environment variable](https://en.wikipedia.org/wiki/Environment_variable). File paths can be written in Linux, MacOS or Windows formats.

**_Special cases:_** if environment variables **TEMP** or **HOME** isn't defined, the server uses the value returned by the Node.js API, namely by `os.tmpdir()` and `os.homedir()` respectively.

```json5
  directories: [
    { label: 'TEMP', path: 'TEMP' },
    { label: 'HOME', path: '/home/my_name/' },
    { label: 'Storage', path: 'd:\\' }
  ]
```

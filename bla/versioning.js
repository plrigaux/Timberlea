"use strict";
exports.__esModule = true;
var path_1 = require("path");
var fs_extra_1 = require("fs-extra");
var readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
var LOCAL = "";
var CLIENT = "client";
var SERVER = "server";
var PACKAGE = "package.json";
var packages = new Map();
packages.set(LOCAL, { file: path_1["default"].join(LOCAL, PACKAGE) });
packages.set(CLIENT, { file: path_1["default"].join(CLIENT, PACKAGE) });
packages.set(SERVER, { file: path_1["default"].join(SERVER, PACKAGE) });
console.log(packages);
function getVersion() {
    var version = fs_extra_1["default"].readFileSync("VERSION", 'utf8');
    console.log("version", version);
    return version;
}
var version = getVersion();
function updateVersions() {
    for (var _i = 0, _a = packages.entries(); _i < _a.length; _i++) {
        var packageFile = _a[_i];
        try {
            var packFile = packageFile[1];
            var data = fs_extra_1["default"].readFileSync(packFile.file, 'utf8');
            var packageFileData = JSON.parse(data);
            var key = packageFile[0];
            console.log("version", key, packageFileData.version);
            packFile.version = packageFileData.version;
            packageFileData.version = version;
            var dataString = JSON.stringify(packageFileData, null, 2);
            fs_extra_1["default"].writeFileSync(packFile.file, dataString);
        }
        catch (err) {
            console.log("Error reading file from disk: ".concat(err));
        }
    }
}
console.log("HELLO");
console.log(packages);
readline.question("What's your name?", function (name) {
    console.log("Hi ".concat(name, "!"));
    readline.close();
});

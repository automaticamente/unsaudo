var fs = require('fs');

var save = function(data, file, callback) {
    'use strict';

    fs.writeFile(file, JSON.stringify(data), function(error) {
        if (error) {
            return callback(error);
        } else {
            return callback();
        }
    });
};

module.exports = save;

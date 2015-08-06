var fs = require('fs');
var path = require('path');
var dump = require('./dump.js');

var nomenclator = __dirname + '/nomenclator.csv';
var outputFile = path.join(__dirname, '..', 'nomenclator.json');

var places = [];


var cleanString = function(string, capitalize) {
    'use strict';

    string = string.trim().split(', ').reverse().join(' ');

    if (capitalize) {
        string = string.toLowerCase().replace(/^.|\s\S/g, function(a) {
            return a.toUpperCase();
        });
    }

    return string;
};

fs.readFile(nomenclator, 'utf-8', function(err, data) {
    'use strict';

    if (err) {
        throw err;
    }

    //lines
    var lines = data.split('\n').filter(function(d) {
        return d !== '';
    });

    //remove header
    lines.shift();

    lines.forEach(function(line) {
        var place = {};
        var parts = line.split(';');

        // 0 - province
        place.province = cleanString(parts[0], true);

        // 1 - council
        place.council = cleanString(parts[1], true);

        // 2 - parish saint
        var parish = parts[2].match(/(.*)\((.*)\).*/);

        if (parish) {
            place.parish = cleanString(parish[1]);
            place.saint = cleanString(parish[2].trim());
        } else {
            place.parish = cleanString(parts[2]);
        }

        // 3- place
        place.place = cleanString(parts[3]);

        places.push(place);
    });

    // Save to file

    dump(places, outputFile, function(error) {
        if (error) {
            console.log(error);
        } else {
            console.log('JSON saved to', outputFile);
        }
    });

});

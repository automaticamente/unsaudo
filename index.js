var fs = require('fs');
var _ = require('underscore');
var S = require('string');
var Twit = require('twit');

var config = fs.existsSync('./local.config.js') ? require('./local.config.js') : require('./config.js');

var Twitter = new Twit(config.API);

var dump = require('./parser/dump.js');
var dataFile = __dirname + '/nomenclator.json';
var places = require(dataFile);

console.log(places.length);

var greetings = {
    multi: [
        'Un saúdo a {{place}}, na parroquia de {{parish}}, concello de {{council}}!'
    ],
    councilparish: [
        'Un saúdo a {{place}}, en {{council}}'

    ],
    single: [
        'Un saúdo a {{place}}'
    ]
};

var getPlace = function() {
    'use strict';
    places = _.shuffle(places);

    var current = places.shift();

    return current;
};

var save = function() {
    'use strict';

    dump(places, dataFile, function(error) {
        if (error) {
            console.log('Fatal error!');
            process.exit(1);
        }


    });
};

var tweet = function() {
    'use strict';

    var place = getPlace();
    var mode = (place.council === place.parish && place.parish === place.place) ? 'single' : (place.council === place.parish) ? 'councilparish' : 'multi';

    var greeting = _.sample(greetings[mode]);

    var tweet = S(greeting).template(place).s;

    Twitter.post('statuses/update', {
        status: tweet
    }, function(error, data, response) {
        if (error) {
            throw new Error(error);
        }

        console.log(tweet);

        save();

    });

};

tweet();

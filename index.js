var fs = require('fs');
var _ = require('underscore');
var S = require('string');
var Twit = require('twit');

var config = fs.existsSync('./local.config.js') ? require('./local.config.js') : require('./config.js');

var Twitter = new Twit(config.API);

var dump = require('./parser/dump.js');
var dataFile = __dirname + '/nomenclator.json';
var currentIndex = __dirname + '/current.json';

var places = require(dataFile);

var next = fs.existsSync(currentIndex) ? require(currentIndex) : {index: 0};

var greetings = {
    multi: [
        'Un saúdo para {{place}}, na parroquia de {{parish}}, concello de {{council}}!'
    ],
    councilparish: [
        'Un saúdo para {{place}}, concello de {{council}}'

    ],
    single: [
        'Un saúdo para {{place}}'
    ]
};

var tweet = function() {
    'use strict';

    var place = places[next.index];

    var mode = (place.council === place.parish && place.parish === place.place) ? 'single' : (place.council === place.parish) ? 'councilparish' : 'multi';

    var greeting = _.sample(greetings[mode]);

    var tweet = S(greeting).template(place).s;

    // Twitter.post('statuses/update', {
    //     status: tweet
    // }, function(error, data, response) {
    //     if (error) {
    //         throw new Error(error);
    //     }

        next.index++;

        dump(next, currentIndex, function(error) {
            if (error) {
                console.log('Fatal error!');
                process.exit(1);
            }

            console.log(tweet);
        });
    // });

};

setInterval(function() {
    'use strict';
    tweet();
}, 1000 * 60 * 15);

tweet();
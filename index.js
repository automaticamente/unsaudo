var fs = require('fs');

var _ = require('underscore');
var S = require('string');
var Twit = require('twit');
var dump = require('./parser/dump.js');

var config = fs.existsSync('./local.config.js') ? require('./local.config.js') : require('./config.js');

var Twitter = new Twit(config.API);

var dataFile = __dirname + '/nomenclator.json';
var currentIndex = __dirname + '/current.json';

var places = require(dataFile);

var next = fs.existsSync(currentIndex) ? require(currentIndex) : {
    index: 0
};

var greetings = {
    multi: [
        'Un saúdo para {{place}}, na parroquia {{parish}}, concello {{council}}!'
    ],
    councilparish: [
        'Un saúdo para {{place}}, concello {{council}}!'

    ],
    single: [
        'Un saúdo para {{place}}!'
    ]
};

var prefixer = function(string) {
    'use strict';

    var s = S(string);

    var prefixes = [{
        pre: 'A ',
        rep: 'da '
    }, {
        pre: 'O ',
        rep: 'do '
    }, {
        pre: 'As ',
        rep: 'das '
    }, {
        pre: 'Os ',
        rep: 'dos '
    }];

    for (var i = 0; i < prefixes.length; i++) {
        var pref = prefixes[i];

        if (s.startsWith(pref.pre)) {
            return pref.rep + s.chompLeft(pref.pre);
        }
    }

    return 'de ' + s.s;
};

var tweet = function() {
    'use strict';

    var place = places[next.index];

    var mode = (place.council === place.parish && place.parish === place.place) ? 'single' : (place.council === place.parish || place.parish === place.place) ? 'councilparish' : 'multi';

    var greeting = _.sample(greetings[mode]);

    place.council = prefixer(place.council);
    place.parish = prefixer(place.parish);

    var tweet = S(greeting).template(place).s;

    Twitter.post('statuses/update', {
        status: tweet
    }, function(error, data, response) {
        if (error) {
            throw new Error(error);
        }

        console.log(next.index + ' | ' + tweet);

        next.index++;

        dump(next, currentIndex, function(error) {
            if (error) {
                console.log('Fatal error!');
                process.exit(1);
            }

        });
    });

};

setInterval(function() {
    'use strict';
    try {
        tweet();
    } catch (e) {
        console.log(e);
    }
}, 1000 * 60 * 15);

tweet();

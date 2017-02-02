var NodeHelper = require("node_helper");
var http = requuire("http");

module.exports = NodeHelper.create({
    start: function () {
        console.log("###################### GOT_HERE ######################");
    },

    socketNotificationReceived: function (notification, payload) {
        console.log("###################### RXd ######################");
        if (notification === "GET_MOVIES") {
            console.log("###################### GET_MOVIES ######################");
            var nextyear, nextmonth;
            nextyear = payload.year;
            nextmonth = parseInt(payload.month, 10) + 1;
            if (nextmonth >= 13) {
                nextmonth = 1;
                nextyear = (parseInt(nextyear, 10) + 1).toString();
            }
            nextmonth = ("0" + nextmonth).slice(-2);

            console.log("###################### GOT_DATES ######################");
            this.getData(payload.apikey, payload.year, payload.month);
            this.getData(payload.apikey, nextyear, nextmonth);
        }
    },

    getData: function (apikey, year, month) {
        var host = "http://www.myapifilms.com";
        var path = "/imdb/comingSoon?token=" + apikey + "&format=json&language=en-gb&date=" + year + "-" + month;
        console.log("###################### URL ######################");
        console.log(url);
        var self = this;

        http.get({
            host: host,
            path: path
        }, function (responce) {
            var body = '';
            responce.on('data', function (data) {
                body += data;
            });
            responce.on('end', function () {
                self.processList(JSON.parse(body))
            });
        });

    },

    processList: function (list) {
        console.log("###################### PROCESSING_LIST ######################");
        var i, j, movieList = [], payload = {};
        if (list.error !== undefined) {
            payload.error = true;
            payload.errorMessage += "Code: " + list.error.code + " Message: " + list.error.message;
        }
        if (list.data !== undefined) {
            console.log("###################### GOT_DATA ######################");
            payload.error = false;
            var cs = list.data.comingSoon;
            if (cs.length === 0) {
                payload.error = true;
                payload.errorMessage += "Empty data array - probable date error";
            }
            for (i = 0; i < cs.length; i += 1) {
                for (j = 0; j < cs[i].movies.length; j += 1) {
                    if (cs[i].movies[j].languages.indexOf("English") !== -1) {
                        movieList.push(cs[i].movies[j]);
                    }
                }
            }
            payload.movieList = movieList;
            console.log("###################### SENDING ######################");
            console.log(payload);
            this.sendSocketNotification("MOVIE_LIST", payload)
        }
    }
});
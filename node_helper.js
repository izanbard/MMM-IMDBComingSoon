var NodeHelper = require("node_helper");
var http = require("http");

module.exports = NodeHelper.create({
    socketNotificationReceived: function (notification, payload) {
        if (notification === "GET_MOVIES") {
            var nextyear, nextmonth;
            nextyear = payload.year;
            nextmonth = parseInt(payload.month, 10) + 1;
            if (nextmonth >= 13) {
                nextmonth = 1;
                nextyear = (parseInt(nextyear, 10) + 1).toString();
            }
            nextmonth = ("0" + nextmonth).slice(-2);

            this.getData(payload.id, payload.apikey, payload.year, payload.month);
            this.getData(payload.id, payload.apikey, nextyear, nextmonth);
        }
    },

    getData: function (id, apikey, year, month) {
        var host = "www.myapifilms.com";
        var path = "/imdb/comingSoon?token=" + apikey + "&format=json&language=en-gb&date=" + year + "-" + month;
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
                self.processList(id, JSON.parse(body))
            });
        });

    },

    processList: function (id, list) {
        var i, j, movieList = [], payload = {};
        if (list.error !== undefined) {
            payload.error = true;
            payload.errorMessage += "Code: " + list.error.code + " Message: " + list.error.message;
        }
        if (list.data !== undefined) {
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
            payload.id = id;
            this.sendSocketNotification("MOVIE_LIST", payload)
        }
    }
});
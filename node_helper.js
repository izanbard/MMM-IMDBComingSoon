var NodeHelper = require("node_helper");

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

            this.getData(payload.apikey, payload.year, payload.month);
            this.getData(payload.apikey, nextyear, nextmonth);
        }
    },

    getData: function (apikey, year, month) {
        var url = "http://www.myapifilms.com/imdb/comingSoon?token=" + apikey + "&format=json&language=en-gb&date=" + year + "-" + month;
        var xhr = new XMLHttpRequest();
        var self = this;

        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (this.readyState === 4) {
                self.processList(JSON.parse(this.responseText));
            }
        };
        xhr.send();
    },

    processList: function (list) {
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
            this.sendSocketNotification("MOVIE_LIST", payload)
        }
    }
});
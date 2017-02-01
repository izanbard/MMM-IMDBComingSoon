var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    getData: function (apikey, year, month) {
        var url = "http://www.myapifilms.com/imdb/comingSoon?token=" + apikey + "&format=json&language=en-gb&date=" + year + "-" + month;

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send();
        return JSON.parse(xhr.responseText);
    },
    socketNotificationReceived: function (notification, payload) {
        if (notification === "REQUEST_LIST_CONTENT") {
            this.error = false;
            this.errorMessage = "";
            this.movieList = [];
            var apikey, thisyear, thismonth, nextyear, nextmonth;
            apikey = payload.apikey;
            thisyear = payload.year;
            nextyear = payload.year;
            thismonth = payload.month;
            nextmonth = parseInt(thismonth, 10) + 1;
            if (nextmonth >= 13) {
                nextmonth = 1;
                nextyear = (parseInt(nextyear, 10) + 1).toString();
            }
            nextmonth = ("0" + nextmonth).slice(-2);

            this.processlist(this.getData(apikey, thisyear, thismonth));
            this.processlist(this.getData(apikey, nextyear, nextmonth));

            var outPackage = {};
            if (this.error) {
                outPackage.error = true;
                outPackage.errorMessage = this.errorMessage;
            }
            outPackage.movieList = this.movieList;

            this.sendSocketNotification("IMDB_COMING_SOON_NEW_DATA", payload);


        }
    },

    processlist: function (list) {
        var i,j;
        if (list.error !== undefined) {
            this.error = true;
            this.errorMessage += "Code: " + list.error.code + " Message: " + list.error.message;
        }
        if (list.data !== undefined) {
            var cs = list.data.comingSoon;
            if (cs.length === 0) {
                this.error = true;
                this.errorMessage += "Empty data array - probable date error";
            }
            for (i=0;i<cs.length;i+=1) {
                for (j=0; j<cs[i].movies.length;j+=1) {
                    if (cs[i].movies[j].languages.indexOf("English") !== -1) {
                        this.movieList.push(cs[i].movies[j]);
                    }
                }
            }
        }
    }
});
/* global Module */

Module.register("MMM-IMDBComingSoon", {
    defaults: {
        apikey: "You Must Change This Value",
        reloadInterval: 8 * 60 * 60 * 1000, //8 hours
        dataSwapInterval: 60 * 1000, //1 min
        animationSpeed: 1.5 * 1000 //1.5 secs
    },

    start: function () {
        this.validConfig = this.checkConfig();
        if (this.validConfig) {
            this.reloadData();
            this.reloadDataTimerID = setInterval(this.reloadData(), this.config.reloadInterval);
            this.loaded = false;
            this.error = false;
        }
        this.updateDom(this.config.animationSpeed);
    },

    getHeader: function () {
        if (this.data.header === "") {
            this.data.header = "IMDB Coming Soon";
        }
        return this.data.header;
    },

    getStyles: function () {
        return [
            this.file("css/MMM-IMDBComingSoon.css"),
            "font-awesome.css"
        ]
    },

    getDom: function () {
        var wrapper = document.createElement("div");
        if (!this.validConfig) {
            wrapper.innerHTML = 'Invalid config! ' + this.errorMessage;
            return wrapper;
        }
        if (!this.loaded) {
            if (this.error) {
                wrapper.innerHTML = "an error occured: " + this.errorMessage;
                wrapper.className = "xsmall dimmed";
            } else {
                wrapper.innerHTML = "<span class='small fa fa-refresh fa-spin fa-fw'></span>";
                wrapper.className = "small dimmed";
            }
            return wrapper;
        }

        //render active Item

        this.activeItem += 1;
        if (this.activeItem >= this.movieList.length) {
            this.activeItem = 0;
        }
        return wrapper;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "IMDB_COMING_SOON_NEW_DATA") {
            if (!payload.error) {
                this.error = false;
                this.activeItem = 0;
                this.movieList = payload.movieList;
                if (!this.loaded) {
                    this.loaded = true;
                    this.cycleListTimerID = setInterval(this.updateDom(this.config.animationSpeed), this.config.dataSwapInterval);
                }
            } else {
                this.loaded = false;
                this.error = true;
                this.errorMessage = payload.errorMessage;
                if (this.cycleListTimerID !== undefined) {
                    clearInterval(this.cycleListTimerID);
                }
                setTimeout(this.reloadData(), 60 * 1000)
            }
            this.updateDom(this.config.animationSpeed);
        }
    },

    reloadData: function () {
        var now = new Date();
        this.year = now.getFullYear();
        this.month = ("0" + now.getMonth()).slice(-2);
        this.sendSocketNotification("REQUEST_LIST_CONTENT", {key: this.config.apikey, year: this.year, month: this.month});
    },

    checkConfig: function () {
        if (this.config.apikey === "You Must Change This Value"){
            this.errorMessage = "Invalid API Key!";
            return false;
        }
        return true;
    }

});
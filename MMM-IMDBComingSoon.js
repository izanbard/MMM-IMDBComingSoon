/* global Module */

Module.register("MMM-IMDBComingSoon", {
    defaults: {
        apikey: "You Must Change This Value",
        reloadInterval: 8 * 60 * 60 * 1000, //8 hours
        dataSwapInterval: 60 * 1000, //1 min
        animationSpeed: 1.5 * 1000 //1.5 secs
    },

    start: function () {
        this.guid = this.createPseudoGUID();
        this.validConfig = this.checkConfig();
        if (this.validConfig) {
            this.loaded = false;
            this.error = false;
            this.updateListTimer();
        }
    },

    getHeader: function () {
        if (this.movieList !== undefined) {
            if (this.movieList.length > 0) {
                return this.data.header + " (" + (this.activeItem === 0 ? this.movieList.length : this.activeItem) + "/" + this.movieList.length + ")";
            }
        }
        return this.data.header
    },

    getStyles: function () {
        return [
            this.file("css/MMM-IMDBComingSoon.css"),
            "font-awesome.css"
        ]
    },

    getDom: function () {
        var wrapper = document.createElement("div");
        wrapper.classList.add("wrapper", "align-left");
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

        var title = document.createElement("div");
        title.classList.add("bold", "medium");
        title.innerHTML = this.movieList[this.activeItem].title;
        wrapper.appendChild(title);

        var contentDiv = document.createElement("div");

        var poster = document.createElement("img");
        poster.classList.add("poster");
        poster.src = this.movieList[this.activeItem].urlPoster;
        contentDiv.appendChild(poster);

        var releaseDate = document.createElement("div");
        releaseDate.classList.add("bright", "small");
        var rDate = new Date();
        rDate.setFullYear(
            parseInt(this.movieList[this.activeItem].releaseDate.slice(0, 4)),
            parseInt(this.movieList[this.activeItem].releaseDate.slice(4, 6)) - 1,
            parseInt(this.movieList[this.activeItem].releaseDate.slice(6))
        );
        releaseDate.innerHTML = "Date: " + rDate.toDateString();
        contentDiv.appendChild(releaseDate);

        if (this.movieList[this.activeItem].runtime !== undefined) {
            var runtime = document.createElement("div");
            runtime.classList.add("bright", "xsmall");
            runtime.innerHTML = "Run Time: " + this.movieList[this.activeItem].runtime;
            contentDiv.appendChild(runtime);
        }

        if (this.movieList[this.activeItem].rated !== undefined) {
            var rated = document.createElement("div");
            rated.classList.add("bright", "xsmall");
            rated.innerHTML = "Rated: " + this.movieList[this.activeItem].rated;
            contentDiv.appendChild(rated);
        }

        var plot = document.createElement("div");
        plot.classList.add("xsmall");
        var editedPlot = this.movieList[this.activeItem].plot;
        if (editedPlot.length > 450) {
            editedPlot = editedPlot.slice(0, 447) + "...";
        }
        plot.innerHTML = editedPlot;
        contentDiv.appendChild(plot);

        wrapper.appendChild(contentDiv);
        this.activeItem += 1;
        if (this.activeItem >= this.movieList.length) {
            this.activeItem = 0;
        }
        return wrapper;
    },

    checkConfig: function () {
        if (this.config.apikey === "You Must Change This Value") {
            this.error = true;
            this.errorMessage = "Invalid API Key!";
            return false;
        }
        if (this.config.reloadInterval < 60 * 1000) {
            this.config.reloadInterval = 60 * 1000;
        }
        return true;
    },

    reloadData: function () {
        var now = new Date();
        this.year = now.getFullYear();
        this.month = ("0" + (now.getMonth() + 1)).slice(-2);
        this.error = false;
        this.errorMessage = "";
        this.loaded = false;
        this.movieList = [];
        this.activeItem = 0;
        console.log("reloading IMDB data");
        this.sendSocketNotification("GET_MOVIES", {
            id: this.guid,
            apikey: this.config.apikey,
            year: this.year,
            month: this.month
        })
    },

    socketNotificationReceived: function (notification, payload) {
        if (payload.id !== this.guid) {
            return;
        }
        if (notification === "MOVIE_LIST") {
            if (!payload.error) {
                this.error = false;
                this.movieList = this.movieList.concat(payload.movieList);
                this.movieList.sort(function (a, b) {
                    var x = a.releaseDate.toString();
                    var y = b.releaseDate.toString();
                    if (x < y) {
                        return -1;
                    }
                    if (x > y) {
                        return 1;
                    }
                    return 0;
                });
                if (!this.loaded) {
                    this.loaded = true;
                    this.updateDomTimer();
                    console.log("animation timer" + this.cycleListTimerID);
                }
            } else {
                this.loaded = false;
                this.error = true;
                this.errorMessage = payload.errorMessage;
                setTimeout(this.reloadData(), 60 * 1000)
            }
        }
    },

    updateDomTimer: function () {
        this.updateDom(this.config.animationSpeed);

        if (!this.cycleListTimerID === undefined) {
            clearInterval(this.cycleListTimerID);
        }

        var self = this;
        this.cycleListTimerID = setInterval(function () {
            self.updateDom(self.config.animationSpeed);
        }, this.config.dataSwapInterval);
    },

    updateListTimer: function () {
        this.reloadData();

        if (!this.reloadDataTimerID === undefined) {
            clearInterval(this.reloadDataTimerID);
        }

        var self = this;
        this.reloadDataTimerID = setInterval(function () {
            self.reloadData();
        }, this.config.reloadInterval);
    },

    createPseudoGUID: function () {
        return this.pseudoGUIDHelper() +
            this.pseudoGUIDHelper() +
            '-' +
            this.pseudoGUIDHelper() +
            '-' +
            this.pseudoGUIDHelper() +
            '-' +
            this.pseudoGUIDHelper() +
            '-' +
            this.pseudoGUIDHelper() +
            this.pseudoGUIDHelper() +
            this.pseudoGUIDHelper();
    },

    pseudoGUIDHelper: function () {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

});
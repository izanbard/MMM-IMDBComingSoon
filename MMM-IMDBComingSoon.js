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
            this.loaded = false;
            this.error = false;
            this.reloadData();
            this.reloadDataTimerID = setInterval(this.reloadData(), this.config.reloadInterval);
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
        title.classList.add("bright", "small");
        title.innerHTML = this.movieList[this.activeItem].title;
        wrapper.appendChild(title);

        var poster = document.createElement("img");
        poster.classList.add("poster");
        poster.src = this.movieList[this.activeItem].urlPoster;
        wrapper.appendChild(poster);

        var releaseDate = document.createElement("div");
        releaseDate.classList.add("bright", "xsmall");
        var rDate = new Date();
        rDate.setFullYear(
            this.movieList[this.activeItem].releaseDate.slice(0, 4),
            this.movieList[this.activeItem].releaseDate.slice(4, 6),
            this.movieList[this.activeItem].releaseDate.slice(6)
        );
        releaseDate.innerHTML = "Date: " + rDate.toDateString();
        wrapper.appendChild(releaseDate);

        var runtime = document.createElement("div");
        runtime.classList.add("bright", "xsmall");
        runtime.innerHTML = "Run Time: " + this.movieList[this.activeItem].runtime;
        wrapper.appendChild(runtime);

        var plot = document.createElement("div");
        plot.classList.add("bright", "xsmall");
        var editedPlot = this.movieList[this.activeItem].plot;
        if (editedPlot.length > 250) {
            editedPlot = editedPlot.slice(0, 247) + "...";
        }
        plot.innerHTML = editedPlot;
        wrapper.appendChild(plot);

        this.activeItem += 1;
        if (this.activeItem >= this.movieList.length) {
            this.activeItem = 0;
        }
        return wrapper;
    },

    checkConfig: function () {
        if (this.config.apikey === "You Must Change This Value") {
            this.errorMessage = "Invalid API Key!";
            return false;
        }
        return true;
    },

    reloadData: function () {
        var now = new Date();
        this.year = now.getFullYear();
        this.month = ("0" + (now.getMonth() + 1)).slice(-2);
        this.error = false;
        this.errorMessage = "";
        if (this.cycleListTimerID !== undefined) {
            clearInterval(this.cycleListTimerID);
        }
        this.loaded = false;
        this.movieList = [];
        this.sendSocketNotification("GET_MOVIES", {apikey: this.config.apikey, year: this.year, month: this.month})
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification==="MOVIE_LIST"){
            if (!payload.error) {
                this.error = false;
                this.activeItem = 0;
                this.movieList.concat(payload.movieList);
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
    }

});
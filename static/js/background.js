var stringifiedTimer = localStorage.getItem("_timers");
var _timers = stringifiedTimer ? JSON.parse(stringifiedTimer) : {};
// console.log(_timers);
(function() {
  var timers = {
    get: function(id) {
      return _timers[id] || false;
    },
    set: function(tab, interval, urls, nextRefresh) {
      if (!nextRefresh) {
        nextRefresh = new Date().getTime() + interval;
      }

      let allUrls = urls.split(/\r,?|,/g);
      // console.log(allUrls);
      var id = tab.id;
      _timers[id] && timers.remove(tab.id);
      _timers[id] = {
        tab: tab,
        nextRefresh,
        interval: interval,
        urls: allUrls,
        URLIndex: 0,
        timer: timers.start(id, interval)
      };
      // console.log(_timers);
    },
    remove: function(id) {
      if (_timers[id]) {
        chrome.browserAction.setBadgeText({ tabId: id, text: "" });
        clearInterval(_timers[id].timer);
        delete _timers[id];
      }
      localStorage.setItem("_timers", JSON.stringify(_timers));
    },
    start: function(id, interval, urls) {
      return setInterval(function() {
        if (_timers[id] && new Date().getTime() >= _timers[id].nextRefresh) {
          let urlschemes = ["http", "https"];
          if (_timers[id].URLIndex == _timers[id].urls.length) {
            _timers[id].URLIndex = 0;
          }
          let theurl = _timers[id].urls[_timers[id].URLIndex].trim();
          // console.log(theurl);
          if (theurl !== "") {
            if (urlschemes.indexOf(theurl.split(":")[0]) === -1) {
              theurl = "https://" + theurl;
            }
            chrome.tabs.update(id, { url: theurl }, function() {
              setTimeout(function() {
                _timers[id].nextRefresh =
                  new Date().getTime() + _timers[id].interval + 999;
              }, 1);
              _timers[id].URLIndex++;
            });
            // console.log(_timers[id].URLIndex);
          }
        } else if (_timers[id]) {
          chrome.browserAction.getBadgeText({ tabId: id }, currentTab => {
            if (typeof currentTab === "undefined") {
              delete _timers[id];
              return;
            }
          });

          _timers[id]["timeLeft"] = moment(
            _timers[id].nextRefresh - new Date().getTime()
          );

          chrome.browserAction.setBadgeBackgroundColor({
            tabId: id,
            color: "#673ab7"
          });

          duration = moment.duration(_timers[id].nextRefresh - new Date().getTime(), "milliseconds");
          fromMinutes = Math.floor(duration.asMinutes());
          fromSeconds = Math.floor(duration.asSeconds() - fromMinutes * 60);
          time = Math.floor(duration.asSeconds()) >= 60
          ? (fromMinutes <= 9 ? "0" + fromMinutes : fromMinutes) +
            ":" +
            (fromSeconds <= 9 ? "0" + fromSeconds : fromSeconds)
          : "00:" + (fromSeconds <= 9 ? "0" + fromSeconds : fromSeconds);
          // console.log(time);
          chrome.browserAction.setBadgeText({
            tabId: id,
            text: time
          });
        } else {
          timers.remove(id);
        }
        localStorage.setItem("_timers", JSON.stringify(_timers));
      }, 100);
    }
  };
  if (stringifiedTimer) {
    Object.keys(_timers).forEach(function(index, elem) {
      timers.start(parseInt(index), elem.interval, elem.urls);
    });
  }
  // Set timers on the window object so we can access it from the popdown
  window.timers = timers;
})();

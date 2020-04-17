$(function() {
  var ext = chrome.extension.getBackgroundPage(),
    $urls = $("#urls"),
    $sec = $("#seconds"),
    swapButtons = function() {
      $("#start,#stop").toggle();
    };

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var timer = ext.timers.get(tabs[0].id);
    // console.log(timer);
    if (timer) {
      swapButtons();
      var urls = timer.urls;
      var sec = timer.interval / 1000;
      $urls.val(urls);
      $sec.val(sec);
    } else {
      $sec.val(localStorage.defaultSec || 15);
    }
  });

  $("#start").on("click", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var urls = $urls.val();
      var interval = $sec.val() * 1000;
      ext.timers.set(tabs[0], interval, urls);
    });
    swapButtons();
  });

  $("#stop").on("click", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      ext.timers.remove(tabs[0].id);
    });
    swapButtons();
  });

  setTimeout(function() {
    $sec.focus()[0].select();
  }, 100);
});

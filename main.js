//#region Wait For Element Function

const waitForElement = (selector) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

//#endregion

//#region Check for valid URL function
const checkForValidURL = (url) => {
  return url.includes("/channel/") || url.includes("/c/") || url.includes("/user/") || url.includes("/watch?v=") || url.includes("youtube.com/@")
}
//#endregion

//#region Get URL Type function
const getURLType = (url) => {
  if (url.includes("/channel/")) return "channel";
  if (url.includes("/c/")) return "channel";
  if (url.includes("/user/")) return "channel";
  if (url.includes("youtube.com/@")) return "channel";
  if (url.includes("/watch?v=")) return "video";
  return null;
}
//#endregion

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var monetized = (type) => `<div style='font-size:13px; margin-top:2px; color: #4CBB17;'>${type} is monetized</div>`;
var notMonetized = (type) => `<div style='font-size:13px; margin-top:2px; color: #D22B2B;'>${type} is not monetized</div>`;
var loadingMonetizationStatus = () => `<div style='font-size:13px; margin-top:2px; color: #FFFF00;'>Loading monetization data...</div>`;
var failedToLoad = () => `<div style='font-size:13px; margin-top:2px; color: #D22B2B;'>Failed to gather monetization data! Please report this.</div>`;

var currentURL = window.location.href.split("?")[0].split("#")[0]

function getDataOnFirstLoad(urlType) {
  if (urlType == 'channel') {
    document.querySelector("#videos-count").insertAdjacentHTML('afterEnd', `<div class='channelMonetization'>${loadingMonetizationStatus()}</div>`)

    let isMonetized = document.documentElement.innerHTML.split(`{"key":"is_monetization_enabled","value":"`)[1].split(`"},`)[0]
  
    return document.querySelector(".channelMonetization").innerHTML = isMonetized == 'true' ? monetized("Channel") : notMonetized("Channel");
  } else {
    document.querySelector("h1.style-scope.ytd-watch-metadata").insertAdjacentHTML('afterEnd', `<div class='videoMonetization'>${loadingMonetizationStatus()}</div>`)

    let isMonetized = document.documentElement.innerHTML.includes(`[{"key":"yt_ad","value":"`) ? document.documentElement.innerHTML.split(`[{"key":"yt_ad","value":"`)[1].split(`"},`)[0] == '1' ? true : false : false
  
    return document.querySelector(".videoMonetization").innerHTML = isMonetized ? monetized("Video") : notMonetized("Video");
  }
}

window.onload = function () {
  if (!checkForValidURL(window.location.href)) return;

  const urlType = getURLType(window.location.href);

  let element = urlType == 'channel' ? '#videos-count' : '#owner-sub-count';

  waitForElement(element).then(() => {
    return getDataOnFirstLoad(urlType);
  });
};

setInterval(async () => {

  if (currentURL == window.location.href.split("?")[0].split("#")[0]) return;
  if (!checkForValidURL(window.location.href)) return;
  if (checkForValidURL(window.location.href)) currentURL = window.location.href.split("?")[0].split("#")[0];

  const urlType = getURLType(window.location.href);

  let addedElement = document.querySelector(urlType == 'channel' ? ".channelMonetization" : ".videoMonetization");
  let element = urlType == 'channel' ? '#videos-count' : '#owner-sub-count';

  if (!addedElement) {
    waitForElement(element).then(() => {
      return document.querySelector(urlType == 'channel' ? '#videos-count' : 'h1.style-scope.ytd-watch-metadata').insertAdjacentHTML('afterEnd', `<div class='${urlType == 'channel' ? "channelMonetization" : "videoMonetization"}'>${loadingMonetizationStatus()}</div>`)
    });
  } else {
    addedElement.innerHTML = loadingMonetizationStatus();
  }

  try {

    var req = new XMLHttpRequest();
    req.open('GET', window.location.href, false);
    req.send(null);

    const element = await waitForElement(urlType == 'channel' ? ".channelMonetization" : ".videoMonetization");
    if (!element) return;

    if (req.status != 200) return element.innerHTML = failedToLoad();

    let res = req.responseText

    console.log(urlType)

    let isMonetized = urlType == 'channel' ? res.split(`{"key":"is_monetization_enabled","value":"`)[1].split(`"},`)[0] == 'true' ? true : false : res.includes(`[{"key":"yt_ad","value":"`) ? res.split(`[{"key":"yt_ad","value":"`)[1].split(`"},`)[0] == '1' ? true : false : false

    element.innerHTML = isMonetized ? monetized(capitalizeFirstLetter(urlType)) : notMonetized(capitalizeFirstLetter(urlType));

  } catch (e) {

    console.error(`[IYCM] An error occured while attempting to fetch data from YouTube\n${e}`);

    const element = await waitForElement(urlType == 'channel' ? ".channelMonetization" : ".videoMonetization");
    if (!element) return;

    return element.innerHTML = failedToLoad();
  }

}, 250)
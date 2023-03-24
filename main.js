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
const checkForValidURL = (href) => {
  return href.includes("/c/") || href.includes("/channel/") || href.includes("/user/") || href.includes("youtube.com/@")
}
//#endregion

var channelMonetized = `<div style='font-size:13px; margin-top:4px; color: #4CBB17;'>Channel is monetized</div>`;
var channelNotMonetized = `<div style='font-size:13px; margin-top:4px; color: #de2c2c;'>Channel is not monetized</div>`;
var loadingMonetizationStatus = `<div style='font-size:13px; margin-top:2px; color: #FFFF00;'>Loading monetization data...</div>`;
var failedToLoad = `<div style='font-size:13px; margin-top:2px; color: #D22B2B;'>Failed to gather monetization data! Please report this.</div>`;

var currentURL = window.location.href.split("?")[0].split("#")[0]

function getDataOnFirstLoad() {
  document.querySelector("#videos-count").insertAdjacentHTML('afterEnd', `<div class='channelMonetization'>${loadingMonetizationStatus}</div>`)

  let isMonetized = document.documentElement.innerHTML
    .split(`{"key":"is_monetization_enabled","value":"`)[1]
    .split(`"},`)[0];

  return document.querySelector(".channelMonetization").innerHTML = isMonetized == 'true' ? channelMonetized : channelNotMonetized
}

window.onload = function () {

  /* https://twitter.com/XiFlashlight/status/1570423112931614721 */
  if (currentURL.includes("studio.youtube.com")) return;

  if (!checkForValidURL(window.location.href)) return;

  waitForElement("#videos-count").then((element) => {
    return getDataOnFirstLoad();
  });
};

setInterval(async () => {

  /* https://twitter.com/XiFlashlight/status/1570423112931614721 */
  if (currentURL.includes("studio.youtube.com")) return;

  if (!checkForValidURL(window.location.href)) return;

  if (currentURL == window.location.href.split("?")[0].split("#")[0]) return;
  currentURL = window.location.href.split("?")[0].split("#")[0];

  var element = document.querySelector(".channelMonetization");

  if (!element) {
    waitForElement("#videos-count").then(() => {
      return document.querySelector("#videos-count").insertAdjacentHTML('afterEnd', `<div class='channelMonetization'>${loadingMonetizationStatus}</div>`)
    });
  } else {
    element.innerHTML = loadingMonetizationStatus;
  }

  try {

    var req = new XMLHttpRequest();
    req.open('GET', currentURL, false);
    req.send(null);

    const element = await waitForElement(".channelMonetization");
    if (!element) return;

    if (req.status != 200) return element.innerHTML = failedToLoad;

    let res = req.responseText
    let isMonetized = res.split(`{"key":"is_monetization_enabled","value":"`)[1].split(`"},`)[0]

    element.innerHTML = isMonetized == 'true' ? channelMonetized : channelNotMonetized

  } catch (e) {

    console.error(`[IYCM] An error occured while attempting to fetch data from YouTube\n${e}`);

    const element = await waitForElement(".channelMonetization");
    if (!element) return;

    return element.innerHTML = failedToLoad;
  }

}, 250)
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
  return url.includes("/channel/") || url.includes("/c/") || url.includes("/user/")
}
//#endregion

var channelMonetized = `<div style='font-size:13px; margin-top:2px; color: #4CBB17;'>Channel is monetized</div>`;
var channelNotMonetized = `<div style='font-size:13px; margin-top:2px; color: #D22B2B;'>Channel is not monetized</div>`;
var loadingMonetizationStatus = `<div style='font-size:13px; margin-top:2px; color: #FFFF00;'>Loading monetization data...</div>`;
var failedToLoad = `<div style='font-size:13px; margin-top:2px; color: #D22B2B;'>Failed to gather monetization data! Please report this.</div>`;

var currentURL = window.location.href.split("?")[0].split("#")[0]

function getDataOnFirstLoad() {
  document.querySelector("#subscriber-count").insertAdjacentHTML('afterEnd', `<div class='channelMonetization'>${loadingMonetizationStatus}</div>`)

  let isMonetized = document.documentElement.innerHTML
    .split(`{"key":"is_monetization_enabled","value":"`)[1]
    .split(`"},`)[0];

  return document.querySelector(".channelMonetization").innerHTML = isMonetized == 'true' ? channelMonetized : channelNotMonetized
}

window.onload = function () {
  if (!checkForValidURL(window.location.href)) return;

  waitForElement("#subscriber-count").then(() => {
    return getDataOnFirstLoad();
  });
};

setInterval(async () => {

  if (currentURL == window.location.href.split("?")[0].split("#")[0]) return;
  if (!checkForValidURL(window.location.href)) return;
  if (checkForValidURL(window.location.href)) currentURL = window.location.href.split("?")[0].split("#")[0];

  var element = document.querySelector(".channelMonetization");

  if (!element) {
    waitForElement("#subscriber-count").then(() => {
      return document.querySelector("#subscriber-count").insertAdjacentHTML('afterEnd', `<div class='channelMonetization'>${loadingMonetizationStatus}</div>`)
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
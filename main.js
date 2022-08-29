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

var channelMonetized = `<div class='channelMonetization' style='font-size:13px; margin-top:2px; color: #4CBB17;'>Channel is monetized</div>`;
var channelNotMonetized = `<div class='channelMonetization' style='font-size:13px; margin-top:2px; color: #D22B2B;'>Channel is not monetized</div>`;
var currentURL = window.location.href.split("?")[0];

function checkForValidURL(url) {
  return url.includes("/channel/") || url.includes("/c/") || url.includes("/user/")
}

function getDataOnFirstLoad() {
  let isMonetized = document.documentElement.innerHTML
    .split(`{"key":"is_monetization_enabled","value":"`)[1]
    .split(`"},`)[0];
  return document.querySelector("#subscriber-count").insertAdjacentHTML('afterEnd', `${isMonetized == 'true' ? channelMonetized : channelNotMonetized}`)
}

window.onload = function () {
  if (!checkForValidURL(window.location.href)) return;

  waitForElement("#subscriber-count").then((elm) => {
    console.log("Element is ready");
    getDataOnFirstLoad();
  });
};

setInterval(() => {

  console.log(window.location.href)

  if (currentURL == window.location.href.split("?")[0]) return;
  if (!checkForValidURL(window.location.href)) return;
  if (checkForValidURL(window.location.href)) currentURL = window.location.href.split("?")[0];

  try {

    let element = document.querySelector(".channelMonetization")

    var req = new XMLHttpRequest();
    req.open('GET', currentURL, false);
    req.send(null);

    if (req.status != 200) return element.innerHTML = ``

    let res = req.responseText
    let isMonetized = res.split(`{"key":"is_monetization_enabled","value":"`)[1].split(`"},`)[0]

    if (!element) return document.querySelector("#subscriber-count").insertAdjacentHTML('afterEnd', `${isMonetized == 'true' ? channelMonetized : channelNotMonetized}`)

    return element.innerHTML = `${isMonetized == 'true' ? channelMonetized : channelNotMonetized}`
  } catch (e) {
    element.innerHTML = ``
    return console.log(`An error occured while attempting to fetch data from YouTube\n${e}`)
  }

}, 1000)
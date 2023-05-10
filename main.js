
var monetized = (type) => `<div style='font-size:13px; margin-top:5px; color: #4CBB17;'>${type} is monetized</div>`;
var notMonetized = (type) => `<div style='font-size:13px; margin-top:5px; color: #c54949;'>${type} is not monetized</div>`;
var loadingMonetizationStatus = () => `<div style='font-size:13px; margin-top:5px; color: #FFFF00;'>Loading monetization data...</div>`;
var failedToLoad = () => `<div style='font-size:13px; margin-top:5px; color: #c54949;'>Failed to gather monetization data! Please report this.</div>`;

var currentURL = window.location.href.split("&")[0].split("#")[0]

window.onload = function () {
  if (!checkForValidURL(window.location.href)) return;

  const urlType = getURLType(window.location.href);

  let element = urlType == 'channel' ? '#videos-count' : '#owner-sub-count';

  waitForElement(element).then(() => {
    return getDataOnFirstLoad(urlType);
  });
};

setInterval(async () => {

  if (currentURL == window.location.href.split("&")[0].split("#")[0]) return;
  if (!checkForValidURL(window.location.href)) return;
  if (checkForValidURL(window.location.href)) currentURL = window.location.href.split("&")[0].split("#")[0];

  const urlType = getURLType(window.location.href);

  let addedElement = document.querySelector(getElementType(urlType));
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

    const element = await waitForElement(getElementType(urlType));
    if (!element) return;

    if (req.status != 200) return element.innerHTML = failedToLoad();

    let res = req.responseText

    let isMonetized = urlType == 'channel' ? res.split(`{"key":"is_monetization_enabled","value":"`)[1].split(`"},`)[0] == 'true' ? true : false : res.includes(`[{"key":"yt_ad","value":"`) ? res.split(`[{"key":"yt_ad","value":"`)[1].split(`"},`)[0] == '1' ? true : false : false

    element.innerHTML = isMonetized ? monetized(capitalizeFirstLetter(urlType)) : notMonetized(capitalizeFirstLetter(urlType));

  } catch (e) {

    console.error(`[Is YouTube Channel Monetized?] An error occured while attempting to fetch data from YouTube\n${e}`);

    const element = await waitForElement(getElementType(urlType));
    if (!element) return;

    return element.innerHTML = failedToLoad();
  }

}, 250)
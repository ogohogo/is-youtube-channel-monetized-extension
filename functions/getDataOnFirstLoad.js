function getDataOnFirstLoad(urlType) {
    if (urlType == 'channel') {
      document.querySelector("#channel-tagline").insertAdjacentHTML('beforebegin', `<div class='channelMonetization'>${loadingMonetizationStatus()}</div>`)
  
      let isMonetized = document.documentElement.innerHTML.split(`{"key":"is_monetization_enabled","value":"`)[1].split(`"},`)[0]
    
      return document.querySelector(".channelMonetization").innerHTML = isMonetized == 'true' ? monetized("Channel") : notMonetized("Channel");
    } else {
      document.querySelector("h1.style-scope.ytd-watch-metadata").insertAdjacentHTML('afterEnd', `<div class='videoMonetization'>${loadingMonetizationStatus()}</div>`)
  
      let isMonetized = document.documentElement.innerHTML.includes(`[{"key":"yt_ad","value":"`) ? document.documentElement.innerHTML.split(`[{"key":"yt_ad","value":"`)[1].split(`"},`)[0] == '1' ? true : false : false
    
      return document.querySelector(".videoMonetization").innerHTML = isMonetized ? monetized("Video") : notMonetized("Video");
    }
  }
function loadCSS(e,t,n,r){"use strict";function u(){var t;for(var r=0;r<o.length;r++){if(o[r].href&&o[r].href.indexOf(e)>-1){t=true}}if(t){i.media=n||"all"}else{setTimeout(u)}}var i=window.document.createElement("link");var s=t||window.document.getElementsByTagName("script")[0];var o=window.document.styleSheets;i.rel="stylesheet";i.href=e;i.media="only x";i.onload=r||function(){};s.parentNode.insertBefore(i,s);u();return i};
var supportsWoff2=function(t){if(!("FontFace"in t))return!1;var a=new t.FontFace("t",'url("data:application/font-woff2,") format("woff2")',{});return a.load()["catch"](function(){}),"loading"==a.status}(this);
function loadFont(e,t,n,o,a){var r=navigator.userAgent,s=!window.addEventListener||r.match(/(Android (2|3|4.0|4.1|4.2|4.3))|(Opera (Mini|Mobi))/)&&!r.match(/Chrome/);if(s)return loadCSS(o);var d={};try{d=localStorage||{}}catch(i){}var l="x-font-"+e,c=l+"url",u=l+"css",p=d[c],f=d[u],h=document.createElement("style");if(h.rel="stylesheet",document.head.appendChild(h),!f||p!==t&&p!==n){var m=n&&supportsWoff2?n:t,v=new XMLHttpRequest;v.open("GET",m),v.onload=function(){v.status>=200&&v.status<400&&(d[c]=m,d[u]=v.responseText,a||(h.textContent=v.responseText))},v.send()}else h.textContent=f}
function loadJS(e,t){"use strict";var n=document.getElementsByTagName("script")[0],r=document.createElement("script");return r.src=e,r.async=!0,n.parentNode.insertBefore(r,n),t&&"function"==typeof t&&(r.onload=t),r}

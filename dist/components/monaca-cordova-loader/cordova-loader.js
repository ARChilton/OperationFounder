!function(){if(navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/iPhone|iPad|iPod/i)){if("string"==typeof location.href){for(var t=location.href.split("/www")[1].split("/"),e="",i=0;i<t.length-2;i++)e+="../";document.write('<script src="'+e+'cordova.js"><\/script>')}}else if(navigator.userAgent.match(/MSIE\s10.0/)&&navigator.userAgent.match(/Windows\sNT\s6.2/)){var r=document.createElement("script");r.setAttribute("src","cordova.js"),document.getElementsByTagName("head")[0].appendChild(r)}}();
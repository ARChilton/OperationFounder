L.TileLayer.addInitHook(function(){if(!this.options.useCache)return offlineTiles=null,void(this._canvas=null);offlineTiles=new PouchDB("offline-tiles"),this._canvas=document.createElement("canvas"),this._canvas.getContext&&this._canvas.getContext("2d")||(this._canvas=null)}),L.TileLayer.prototype.options.useCache=!1,L.TileLayer.prototype.options.saveToCache=!0,L.TileLayer.prototype.options.useOnlyCache=!1,L.TileLayer.prototype.options.cacheFormat="image/png",L.TileLayer.prototype.options.cacheMaxAge=2592e6,L.TileLayer.include({createTile:function(t,i){var e=document.createElement("img");e.onerror=L.bind(this._tileOnError,this,i,e),this.options.crossOrigin&&(e.crossOrigin=""),e.alt="";var o=this.getTileUrl(t);return this.options.useCache&&this._canvas?offlineTiles.get(o,{revs_info:!0},this._onCacheLookup(e,o,i)):e.onload=L.bind(this._tileOnLoad,this,i,e),e.src=o,e},_onCacheLookup:function(t,i,e){return function(o,n){n?(this.fire("tilecachehit",{tile:t,url:i}),Date.now()>n.timestamp+this.options.cacheMaxAge&&!this.options.useOnlyCache?(this.options.saveToCache&&(t.onload=L.bind(this._saveTile,this,t,i,n._revs_info[0].rev,e)),t.crossOrigin="Anonymous",t.src=i,t.onerror=function(){this.src=n.dataUrl}):(t.onload=L.bind(this._tileOnLoad,this,e,t),t.src=n.dataUrl)):(this.fire("tilecachemiss",{tile:t,url:i}),this.options.useOnlyCache?(t.onload=L.Util.falseFn,t.src=L.Util.emptyImageUrl):(this.options.saveToCache?t.onload=L.bind(this._saveTile,this,t,i,null,e):t.onload=L.bind(this._tileOnLoad,this,e,t),t.crossOrigin="Anonymous",t.src=i))}.bind(this)},_saveTile:function(t,i,e,o){if(null!==this._canvas){var n;this._canvas.width=t.naturalWidth||t.width,this._canvas.height=t.naturalHeight||t.height,this._canvas.getContext("2d").drawImage(t,0,0);try{n=this._canvas.toDataURL(this.options.cacheFormat)}catch(i){return this.fire("tilecacheerror",{tile:t,error:i}),o()}var s={_id:i,dataUrl:n,timestamp:Date.now()};offlineTiles.get(i).then(function(t){if(200===t.status){var o={_id:i,_rev:t._rev,dataUrl:n,timestamp:Date.now()};return offlineTiles.put(o).catch(function(){offlineTiles.remove(i,e),offlineTiles.put(s)})}}).catch(function(t){if(404===t.status)return offlineTiles.put(s)}).catch(function(t){}),o&&o()}},seed:function(t,i,e){if(this.options.useCache&&!(i>e)&&this._map){for(var o=[],n=i;n<=e;n++)for(var s=this._map.project(t.getNorthEast(),n),a=this._map.project(t.getSouthWest(),n),r=this.getTileSize(),h=L.bounds(L.point(Math.floor(s.x/r.x),Math.floor(s.y/r.y)),L.point(Math.floor(a.x/r.x),Math.floor(a.y/r.y))),l=h.min.y;l<=h.max.y;l++)for(var c=h.min.x;c<=h.max.x;c++)point=new L.Point(c,l),point.z=n,o.push(this._getTileUrl(point));var u={bbox:t,minZoom:i,maxZoom:e,queueLength:o.length};this.fire("seedstart",u);var m=this._createTile();return m._layer=this,this._seedOneTile(m,o,u),this}},_createTile:function(){return document.createElement("img")},_getTileUrl:function(t){var i=t.z;return this.options.zoomReverse&&(i=this.options.maxZoom-i),i+=this.options.zoomOffset,L.Util.template(this._url,L.extend({r:this.options.detectRetina&&L.Browser.retina&&this.options.maxZoom>0?"@2x":"",s:this._getSubdomain(t),x:t.x,y:this.options.tms?this._globalTileRange.max.y-t.y:t.y,z:this.options.maxNativeZoom?Math.min(i,this.options.maxNativeZoom):i},this.options))},_seedOneTile:function(t,i,e){if(i.length){this.fire("seedprogress",{bbox:e.bbox,minZoom:e.minZoom,maxZoom:e.maxZoom,queueLength:e.queueLength,remainingLength:i.length});var o=i.pop();offlineTiles.get(o,function(n,s){s?this._seedOneTile(t,i,e):(t.onload=function(){this._saveTile(t,o,null),this._seedOneTile(t,i,e)}.bind(this),t.crossOrigin="Anonymous",t.src=o)}.bind(this))}else this.fire("seedend",e)}}),L.TileLayer.Bing.include({createTile:function(t,i){var e=document.createElement("img");e.onerror=L.bind(this._tileOnError,this,i,e),this.options.crossOrigin&&(e.crossOrigin=""),e.alt="";var o=this.getTileUrl(t);return this.options.useCache&&this._canvas?offlineTiles.get(o,{revs_info:!0},this._onCacheLookup(e,o,i)):e.onload=L.bind(this._tileOnLoad,this,i,e),e.src=o,e},_onCacheLookup:function(t,i,e){return function(o,n){n?(this.fire("tilecachehit",{tile:t,url:i}),Date.now()>n.timestamp+this.options.cacheMaxAge&&!this.options.useOnlyCache?(this.options.saveToCache&&(t.onload=L.bind(this._saveTile,this,t,i,n._revs_info[0].rev,e)),t.crossOrigin="Anonymous",t.src=i,t.onerror=function(){this.src=n.dataUrl}):(t.onload=L.bind(this._tileOnLoad,this,e,t),t.src=n.dataUrl)):(this.fire("tilecachemiss",{tile:t,url:i}),this.options.useOnlyCache?(t.onload=L.Util.falseFn,t.src=L.Util.emptyImageUrl):(this.options.saveToCache?t.onload=L.bind(this._saveTile,this,t,i,null,e):t.onload=L.bind(this._tileOnLoad,this,e,t),t.crossOrigin="Anonymous",t.src=i))}.bind(this)},_saveTile:function(t,i,e,o){if(null!==this._canvas){var n;this._canvas.width=t.naturalWidth||t.width,this._canvas.height=t.naturalHeight||t.height,this._canvas.getContext("2d").drawImage(t,0,0);try{n=this._canvas.toDataURL(this.options.cacheFormat)}catch(i){return this.fire("tilecacheerror",{tile:t,error:i}),o()}var s={_id:i,dataUrl:n,timestamp:Date.now()};offlineTiles.get(i).then(function(t){if(200===t.status){var o={_id:i,_rev:t._rev,dataUrl:n,timestamp:Date.now()};return offlineTiles.put(o).catch(function(){offlineTiles.remove(i,e),offlineTiles.put(s)})}}).catch(function(t){if(404===t.status)return offlineTiles.put(s)}).catch(function(t){}),o&&o()}},seed:function(t,i,e){if(this.options.useCache&&!(i>e)&&this._map){for(var o=[],n=i;n<=e;n++)for(var s=this._map.project(t.getNorthEast(),n),a=this._map.project(t.getSouthWest(),n),r=this.getTileSize(),h=L.bounds(L.point(Math.floor(s.x/r.x),Math.floor(s.y/r.y)),L.point(Math.floor(a.x/r.x),Math.floor(a.y/r.y))),l=h.min.y;l<=h.max.y;l++)for(var c=h.min.x;c<=h.max.x;c++)point=new L.Point(c,l),point.z=n,o.push(this._getTileUrl(point));var u={bbox:t,minZoom:i,maxZoom:e,queueLength:o.length};this.fire("seedstart",u);var m=this._createTile();return m._layer=this,this._seedOneTile(m,o,u),this}},_createTile:function(){return document.createElement("img")},_getTileUrl:function(t){var i=t.z;return this.options.zoomReverse&&(i=this.options.maxZoom-i),i+=this.options.zoomOffset,L.Util.template(this._url,L.extend({r:this.options.detectRetina&&L.Browser.retina&&this.options.maxZoom>0?"@2x":"",s:this._getSubdomain(t),x:t.x,y:this.options.tms?this._globalTileRange.max.y-t.y:t.y,z:this.options.maxNativeZoom?Math.min(i,this.options.maxNativeZoom):i},this.options))},_seedOneTile:function(t,i,e){if(i.length){this.fire("seedprogress",{bbox:e.bbox,minZoom:e.minZoom,maxZoom:e.maxZoom,queueLength:e.queueLength,remainingLength:i.length});var o=i.pop();offlineTiles.get(o,function(n,s){s?this._seedOneTile(t,i,e):(t.onload=function(){this._saveTile(t,o,null),this._seedOneTile(t,i,e)}.bind(this),t.crossOrigin="Anonymous",t.src=o)}.bind(this))}else this.fire("seedend",e)}});
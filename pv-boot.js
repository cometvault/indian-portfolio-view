window.PV_VER="20";
(function(){
  try{
    var p=localStorage.getItem("pv_ver");
    if(p!==window.PV_VER){
      localStorage.setItem("pv_ver",window.PV_VER);
      if(window.caches&&caches.keys)caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k);});});
    }
  }catch(e){}
  try{
    document.querySelectorAll('link[rel="stylesheet"]').forEach(function(l){
      var h=l.getAttribute("href")||"";
      if(h.indexOf("styles.css")===0&&h.indexOf("?v=")<0)l.setAttribute("href","styles.css?v="+window.PV_VER);
    });
    document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]').forEach(function(l){
      var h=l.getAttribute("href")||"";
      if((h.indexOf("logo.svg")>=0||h.indexOf("favicon.svg")>=0)&&h.indexOf("?v=")<0)
        l.setAttribute("href",h.split("?")[0]+"?v="+window.PV_VER);
    });
  }catch(e2){}
  if("serviceWorker" in navigator)
    navigator.serviceWorker.register("sw.js?v="+window.PV_VER).catch(function(){});
})();

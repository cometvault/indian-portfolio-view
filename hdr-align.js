(function(){
  function run(){
    var el=document.querySelector(".logo-txt");
    if(el) el.innerHTML="Easy <span>Nivesh</span>";
    var a=document.querySelector("a.logo");
    if(a) a.setAttribute("aria-label","Easy Nivesh home");
    var img=document.querySelector(".logo-img, #brandLogo");
    if(img){
      img.style.display="block";
      img.style.visibility="visible";
      img.style.opacity="1";
      img.style.width="36px";
      img.style.height="36px";
      img.style.background="#000";
      img.style.objectFit="contain";
      img.onerror=function(){
        this.onerror=null;
        if(window.PV_LOGO) this.src=window.PV_LOGO;
      };
      if(window.PV_LOGO) img.src=window.PV_LOGO;
      else if(!img.getAttribute("src") || img.naturalWidth===0){
        img.src="assets/logo.svg?v=17";
      }
    }
    if(document.title && document.title.indexOf("Portfolio View India")>=0){
      document.title=document.title.split("Portfolio View India").join("Easy Nivesh");
    }
    if(!window.PV_LOGO){
      var s=document.createElement("script");
      s.src="assets/logo-data.js?v=17";
      s.onload=function(){
        var i=document.querySelector(".logo-img, #brandLogo");
        if(i && window.PV_LOGO) i.src=window.PV_LOGO;
      };
      document.head.appendChild(s);
    }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){run();setTimeout(run,50);setTimeout(run,300);});
  else { run(); setTimeout(run,50); setTimeout(run,300); }
})();

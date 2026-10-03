(function(){
  function run(){
    var el=document.querySelector(".logo-txt");
    if(el) el.innerHTML="Easy <span>Nivesh</span>";
    var a=document.querySelector("a.logo");
    if(a) a.setAttribute("aria-label","Easy Nivesh home");
    var img=document.querySelector(".logo-img");
    if(img) img.setAttribute("alt","Easy Nivesh");
    if(document.title && document.title.indexOf("Portfolio View India")>=0){
      document.title=document.title.split("Portfolio View India").join("Easy Nivesh");
    }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){run();setTimeout(run,50);setTimeout(run,200);});
  else { run(); setTimeout(run,50); setTimeout(run,200); }
})();

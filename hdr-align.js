(function(){
  function run(){
    var el=document.querySelector(".logo-txt");
    if(el) el.innerHTML="Easy <span>Nivesh</span>";
    var a=document.querySelector("a.logo");
    if(a) a.setAttribute("aria-label","Easy Nivesh home");
    var img=document.querySelector(".logo-img");
    if(img) img.setAttribute("alt","Easy Nivesh");
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){run();setTimeout(run,50);setTimeout(run,200);});
  else { run(); setTimeout(run,50); setTimeout(run,200); }
})();

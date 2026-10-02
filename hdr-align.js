(function(){
  function run(){
    var el=document.querySelector(".logo-txt");
    if(el) el.innerHTML="Portfolio View <span>India</span>";
    var root=document.getElementById("hdr");
    if(!root) return;
    var hdrIn=root.querySelector(".hdr-in");
    var nav=document.getElementById("primaryNav")||root.querySelector("nav.nav");
    var toggle=document.getElementById("navToggle");
    if(hdrIn&&nav&&nav.parentElement!==hdrIn){
      if(toggle&&toggle.parentElement===hdrIn) hdrIn.insertBefore(nav,toggle);
      else hdrIn.appendChild(nav);
    }
    if(nav) nav.querySelectorAll("a.cta").forEach(function(a){a.classList.add("start");});
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){run();setTimeout(run,50);});
  else { run(); setTimeout(run,50); }
})();

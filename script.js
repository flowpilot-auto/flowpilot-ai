const menuBtn=document.querySelector(".menu-btn");
const nav=document.querySelector(".nav-links");
if(menuBtn&&nav){
  menuBtn.addEventListener("click",()=>{
    const open=nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded",open?"true":"false");
  });
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
}
const form=document.getElementById("trialForm");
const status=document.getElementById("formStatus");
if(form&&status){
  form.addEventListener("submit",e=>{
    e.preventDefault();
    status.textContent="Demo request received ✓ — live email + CRM delivery is the next connection.";
    setTimeout(()=>status.textContent="Demo form — live trial-request delivery will be connected next.",4500);
  });
}
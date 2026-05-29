const dot = document.getElementById("dot");
const ring = document.getElementById("ring");
const divisions = document.querySelectorAll(".division");

const panel = document.getElementById("divisionPanel");
const panelCode = document.getElementById("panelCode");
const panelTitle = document.getElementById("panelTitle");
const panelText = document.getElementById("panelText");
const closePanel = document.getElementById("closePanel");

divisions.forEach(div => {

  div.addEventListener("click", () => {

    divisions.forEach(d => d.classList.remove("active"));

    div.classList.add("active");

    panelCode.textContent = div.dataset.code;
    panelTitle.textContent = div.dataset.title;
    panelText.textContent = div.dataset.text;

    panel.classList.add("active");
    setTimeout(() => {
  panel.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
    });
    }, 120);

  });

});

closePanel.addEventListener("click", () => {

  panel.classList.remove("active");

  divisions.forEach(d => d.classList.remove("active"));

});

let x = 0;
let y = 0;
let rx = 0;
let ry = 0;

document.addEventListener("mousemove", e => {
  x = e.clientX;
  y = e.clientY;

  dot.style.left = x + "px";
  dot.style.top = y + "px";
});

(function animate(){
  rx += (x - rx) * .1;
  ry += (y - ry) * .1;

  ring.style.left = rx + "px";
  ring.style.top = ry + "px";

  requestAnimationFrame(animate);
})();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("show");
    }
  });
},{
  threshold:.1
});

document
  .querySelectorAll(".reveal")
  .forEach(el => observer.observe(el));

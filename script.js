const dot = document.getElementById("dot");
const ring = document.getElementById("ring");

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

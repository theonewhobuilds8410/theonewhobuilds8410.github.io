const themeToggle = document.querySelector(".theme-toggle");
const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

const favicon = document.querySelector('link[rel="icon"]');

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const nextTheme = theme === "dark" ? "light" : "dark";
  themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
  themeToggle.title = `Switch to ${nextTheme} mode`;
  favicon.href = theme === "dark" ? "favicon-dark.svg" : "favicon-light.svg";
}

function transitionTheme(theme) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (document.startViewTransition && !reduceMotion) {
    document.startViewTransition(() => applyTheme(theme));
  } else {
    applyTheme(theme);
  }
}

applyTheme(savedTheme || (prefersDark.matches ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", nextTheme);
  transitionTheme(nextTheme);
});

prefersDark.addEventListener("change", (event) => {
  if (!localStorage.getItem("theme")) {
    transitionTheme(event.matches ? "dark" : "light");
  }
});

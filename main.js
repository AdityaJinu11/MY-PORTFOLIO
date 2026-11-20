const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

const solvedDisplay = document.querySelector("#cf-solved");
const codeforcesStatus = document.querySelector("#cf-status");
if (solvedDisplay && codeforcesStatus) {
  fetch("https://codeforces.com/api/user.status?handle=Nitoma11")
    .then((response) => {
      if (!response.ok) throw new Error("Profile request failed");
      return response.json();
    })
    .then((data) => {
      if (data.status !== "OK" || !Array.isArray(data.result)) throw new Error("Profile data unavailable");
      const solved = new Set(data.result.filter((submission) => submission.verdict === "OK").map((submission) => `${submission.problem.contestId}-${submission.problem.index}`));
      solvedDisplay.textContent = solved.size.toLocaleString();
      codeforcesStatus.textContent = "Unique problems with an accepted solution";
    })
    .catch(() => {
      solvedDisplay.textContent = "—";
      codeforcesStatus.textContent = "Could not load live data. Open Codeforces profile ↗";
    });
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sections = document.querySelectorAll("main section, footer");

if (reducedMotion || !("IntersectionObserver" in window)) {
  sections.forEach((section) => section.classList.add("is-visible"));
} else {
  sections.forEach((section) => section.classList.add("reveal-pending"));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        entry.target.classList.remove("reveal-pending");
      } else {
        entry.target.classList.remove("is-visible");
        entry.target.classList.add("reveal-pending");
      }
    });
  }, { threshold: 0.06, rootMargin: "0px 0px -8% 0px" });
  sections.forEach((section) => revealObserver.observe(section));
}

toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

links.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

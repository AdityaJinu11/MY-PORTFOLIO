(() => {
  const canvas = document.getElementById("tech-wire-canvas");
  if (!canvas) return;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const glyphs = ["01", "AI", "ML", "<>", "//"];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let nodes = [];
  let frame = 0;
  let animationId = 0;

  const random = (min, max) => min + Math.random() * (max - min);

  function makeNodes() {
    const count = Math.max(20, Math.min(42, Math.round((width * height) / 24000)));
    nodes = Array.from({ length: count }, (_, index) => ({
      x: random(0, width),
      y: random(0, height),
      vx: random(-0.12, 0.12),
      vy: random(-0.1, 0.1),
      phase: random(0, Math.PI * 2),
      size: index % 7 === 0 ? random(2.4, 3.2) : random(1.1, 1.8),
      glyph: index % 9 === 0 ? glyphs[Math.floor(random(0, glyphs.length))] : ""
    }));
  }

  function resize() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    makeNodes();
    draw(performance.now(), !reduceMotion.matches);
  }

  function draw(time, moveNodes) {
    context.clearRect(0, 0, width, height);
    const maxDistance = Math.min(190, Math.max(125, width * 0.16));

    if (moveNodes) {
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -8) node.x = width + 8;
        if (node.x > width + 8) node.x = -8;
        if (node.y < -8) node.y = height + 8;
        if (node.y > height + 8) node.y = -8;
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        if (distance > maxDistance) continue;

        const strength = (1 - distance / maxDistance) * 0.32;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.strokeStyle = "rgba(90, 190, 236, " + strength + ")";
        context.lineWidth = 0.7;
        context.stroke();

        // A tiny signal pulse travels along each connected wire.
        const progress = ((time * 0.000055 + a.phase + j * 0.17) % 1 + 1) % 1;
        const pulseX = a.x + dx * progress;
        const pulseY = a.y + dy * progress;
        context.beginPath();
        context.arc(pulseX, pulseY, 1.25, 0, Math.PI * 2);
        context.fillStyle = "rgba(128, 224, 255, " + (strength + 0.12) + ")";
        context.fill();
      }
    }

    nodes.forEach((node, index) => {
      const pulse = 0.25 + (Math.sin(time * 0.001 + node.phase) + 1) * 0.12;
      context.beginPath();
      context.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      context.fillStyle = "rgba(144, 221, 255, " + pulse + ")";
      context.fill();

      if (index % 7 === 0) {
        const s = 5 + Math.sin(time * 0.001 + node.phase) * 0.8;
        context.strokeStyle = "rgba(107, 198, 238, 0.2)";
        context.lineWidth = 0.75;
        context.strokeRect(node.x - s, node.y - s, s * 2, s * 2);
      }

      if (node.glyph) {
        context.font = "9px 'DM Mono', monospace";
        context.fillStyle = "rgba(143, 202, 228, 0.22)";
        context.fillText(node.glyph, node.x + 7, node.y - 7);
      }
    });
  }

  function animate(time) {
    draw(time, true);
    animationId = window.requestAnimationFrame(animate);
  }

  function start() {
    window.cancelAnimationFrame(animationId);
    if (reduceMotion.matches || document.hidden) {
      draw(performance.now(), false);
      return;
    }
    animationId = window.requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", start);
  reduceMotion.addEventListener?.("change", start);
  resize();
  start();
})();
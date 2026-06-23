// Animated Git-style branch lines for the background
(function () {
  const canvas = document.getElementById("git-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Number of branch lanes across the page
  const NUM_TRACKS = 7;

  // Visual settings - kept subtle so content stays readable
  const TRACK_COLOR = "rgba(90, 171, 27, 0.18)";
  const NODE_COLOR = "rgba(90, 171, 27, 0.35)";
  const CONNECTOR_COLOR = "rgba(90, 171, 27, 0.25)";
  const NODE_RADIUS = 5;
  const SCROLL_SPEED = 0.4; // pixels per frame (slow drift upward)

  let width, height;
  let trackX = []; // x positions of the branch lanes
  let offset = 0; // how far the scene has scrolled

  // Each "commit" has a track index and a y position (in scene space)
  let commits = [];
  // Each "connector" links two adjacent commits across tracks
  let connectors = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    buildTracks();
  }

  function buildTracks() {
    trackX = [];
    const margin = width * 0.06;
    const spacing = (width - margin * 2) / (NUM_TRACKS - 1);
    for (let i = 0; i < NUM_TRACKS; i++) {
      trackX.push(Math.round(margin + spacing * i));
    }
  }

  // Populate the initial set of commits spread over several screen heights
  function initCommits() {
    commits = [];
    connectors = [];
    const totalHeight = height * 3;
    const avgGap = 80; // vertical distance between commits on the same track
    for (let t = 0; t < NUM_TRACKS; t++) {
      let y = -totalHeight + Math.random() * avgGap;
      while (y < height) {
        commits.push({ track: t, y: y });
        y += avgGap + Math.random() * 60;
      }
    }
    // Add some cross-track connectors (branch/merge lines)
    const numConnectors = Math.floor(commits.length * 0.2);
    for (let i = 0; i < numConnectors; i++) {
      const c1 = commits[Math.floor(Math.random() * commits.length)];
      // Pick a commit on an adjacent track
      const adjacentTrack = c1.track + (Math.random() < 0.5 ? 1 : -1);
      if (adjacentTrack < 0 || adjacentTrack >= NUM_TRACKS) continue;
      const candidates = commits.filter(
        (c) =>
          c.track === adjacentTrack &&
          Math.abs(c.y - c1.y) > 50 &&
          Math.abs(c.y - c1.y) < 200
      );
      if (candidates.length === 0) continue;
      const c2 = candidates[Math.floor(Math.random() * candidates.length)];
      connectors.push({ from: c1, to: c2 });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw vertical branch lines
    ctx.strokeStyle = TRACK_COLOR;
    ctx.lineWidth = 1.5;
    for (let t = 0; t < NUM_TRACKS; t++) {
      ctx.beginPath();
      ctx.moveTo(trackX[t], 0);
      ctx.lineTo(trackX[t], height);
      ctx.stroke();
    }

    // Draw cross-track connectors (branch/merge lines)
    ctx.strokeStyle = CONNECTOR_COLOR;
    ctx.lineWidth = 1.5;
    for (const conn of connectors) {
      const y1 = conn.from.y + offset;
      const y2 = conn.to.y + offset;
      const x1 = trackX[conn.from.track];
      const x2 = trackX[conn.to.track];
      // Only draw if visible
      if (
        (y1 > -10 && y1 < height + 10) ||
        (y2 > -10 && y2 < height + 10)
      ) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        // Bezier curve for a smooth branch shape
        ctx.bezierCurveTo(x1, (y1 + y2) / 2, x2, (y1 + y2) / 2, x2, y2);
        ctx.stroke();
      }
    }

    // Draw commit nodes
    ctx.fillStyle = NODE_COLOR;
    for (const commit of commits) {
      const y = commit.y + offset;
      if (y < -NODE_RADIUS || y > height + NODE_RADIUS) continue;
      const x = trackX[commit.track];
      ctx.beginPath();
      ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      // Inner white dot for a "ring" look
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.beginPath();
      ctx.arc(x, y, NODE_RADIUS * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = NODE_COLOR;
    }
  }

  function recycle() {
    // When commits scroll off the top, move them below the bottom
    const buffer = height + 200;
    for (const commit of commits) {
      if (commit.y + offset < -NODE_RADIUS * 2) {
        commit.y += buffer + height;
      }
    }
  }

  function animate() {
    offset -= SCROLL_SPEED;
    recycle();
    draw();
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  resize();
  initCommits();

  // Pause animation when the browser tab is hidden to save CPU/battery
  let animationFrameId = null;

  function startAnimation() {
    if (animationFrameId !== null) return;
    function loop() {
      offset -= SCROLL_SPEED;
      recycle();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    }
    animationFrameId = requestAnimationFrame(loop);
  }

  function stopAnimation() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  startAnimation();
})();

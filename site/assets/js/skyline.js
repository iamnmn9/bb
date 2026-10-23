// Dots lit windows across every building in the London skyline.
(function () {
  const skyline = document.querySelector(".skyline");
  if (!skyline) return;
  const skyPath = skyline.querySelector("path").getAttribute("d");
  const windows = skyline.querySelector(".windows");
  const SVG = "http://www.w3.org/2000/svg";
  let x = 0, y = 220;
  for (const [, cmd, val] of skyPath.matchAll(/([MVHLZ])\s*([\d.]+)?/g)) {
    if (cmd === "V") y = +val;
    if (cmd !== "H") {
      if (cmd === "M") x = +val;
      continue;
    }
    const x2 = +val;
    // Each flat roof is a building: dot a few windows down its face.
    for (let wx = x + 6; wx < x2 - 8; wx += 12) {
      for (let wy = y + 8; wy < 214; wy += 12) {
        if (Math.random() > 0.22) continue;
        const r = document.createElementNS(SVG, "rect");
        r.setAttribute("x", wx);
        r.setAttribute("y", wy);
        r.setAttribute("width", 4);
        r.setAttribute("height", 5);
        r.setAttribute("class", "win");
        r.style.setProperty("--delay", `${-Math.random() * 9}s`);
        windows.append(r);
      }
    }
    x = x2;
  }
})();

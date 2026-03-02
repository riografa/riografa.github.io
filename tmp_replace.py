import sys

file_path = "src/components/Hero.astro"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# The target is from line 665 (index 664) to line 853 (index 852)
# Let's find the exact indices by looking for markers.
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '// Downgrade active region to "visited" orange when leaving' in line:
        start_idx = i
        break

for i in range(start_idx, len(lines)):
    if 'function animate() {' in line or (i > start_idx and 'function animate' in lines[i]):
        end_idx = i
        break

if start_idx == -1 or end_idx == -1:
    print("Could not find markers!")
    sys.exit(1)

replacement = """    // Downgrade active region to "visited" orange when leaving, then highlight new as focus
    const focusRegion = (
      names: string[],
      prevNames: string[],
      tl: gsap.core.Timeline,
      t: number,
    ) => {
      prevNames.forEach((n) => {
        if (visited.has(n)) hl(n, visitedColor, tl, t);
      });
      names.forEach((n) => {
        visited.add(n);
        hl(n, focusColor, tl, t);
      });
    };

    // ── Build scroll-driven timeline with label-based snaps ────────────
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero-section",
        start: "top top",
        end: "bottom bottom",
        scrub: true, // `true` (0 delay) ensures rigid mapping without inertial drift
        snap: {
          snapTo: "labels", // strict snapping to defined resting labels
          duration: { min: 0.15, max: 0.4 },
          delay: 0, // instantaneous snap on scroll halt
          ease: "power2.out"
        },
        onUpdate: (self: ScrollTrigger) => {
          const p = self.progress;
          if (p < 0.02 || p > 0.96) {
            setStepNavVisible(false);
            updateStepDots(0);
            fadeNavLinks(false);
          } else {
            setStepNavVisible(true);
            const stage = Math.min(9, Math.max(1, Math.round(p * 10)));
            updateStepDots(stage);
            if (p >= 0.02) fadeNavLinks(true);
          }
        },
      },
    });

    const lookAt = { x: 0, y: 0, z: 0 };
    const updateCam = () => {
      camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
      controls.target.set(lookAt.x, lookAt.y, lookAt.z);
    };

    const moveCam = (key: string, t: number, dur = 0.8) => {
      if (!targets[key]) return;
      tl.to(camera.position, { x: targets[key].cam.x, y: targets[key].cam.y, z: targets[key].cam.z, duration: dur, ease: "power2.inOut" }, t);
      tl.to(lookAt, { x: targets[key].center.x, y: targets[key].center.y, z: targets[key].center.z, onUpdate: updateCam, duration: dur, ease: "power2.inOut" }, t);
    };

    const moveLight = (key: string, t: number, dur = 0.8) => {
      if (!targets[key]) return;
      const c = targets[key].center;
      tl.to(focusLight.position, { x: c.x, y: c.y + 4, z: c.z + 5, duration: dur, ease: "power2.inOut" }, t);
      tl.to(focusLight, { intensity: 2.5, duration: dur * 0.6, ease: "power2.inOut" }, t);
    };

    const showPanel = (id: string, t: number) => tl.to(id, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, t);
    const hidePanel = (id: string, t: number, axis = "y") =>
      tl.to(id, axis === "y" ? { opacity: 0, y: -18, duration: 0.3, ease: "power2.in" } : { opacity: 0, x: -18, duration: 0.3, ease: "power2.in" }, t);

    // ── Timeline ─────────────────────────────────────────────────────────────
    
    // Stage 0 -> Intro perfectly resting at t=0
    moveCam("norte", 0, 0.001);
    moveLight("norte", 0, 0.001);
    focusRegion(["Norte"], [], tl, 0);
    tl.addLabel("stage0", 0);

    // t=0.1 → 0.9: Transition Intro to Norte
    tl.to("#primary-info", { opacity: 0, x: 12, duration: 0.3 }, 0.1);
    showPanel("#norte-info", 0.5);
    tl.addLabel("stage1", 1.0); // Perfect rest at Norte

    // t=1.1 → 1.9: Norte to Santander
    moveCam("santander", 1.1, 0.8);
    moveLight("santander", 1.1, 0.8);
    hidePanel("#norte-info", 1.1);
    showPanel("#santander-info", 1.5);
    focusRegion(["Santander"], ["Norte"], tl, 1.1);
    tl.addLabel("stage2", 2.0);

    // t=2.1 → 2.9: Santander to Boyacá
    moveCam("boyaca", 2.1, 0.8);
    moveLight("boyaca", 2.1, 0.8);
    hidePanel("#santander-info", 2.1, "x");
    showPanel("#boyaca-info", 2.5);
    focusRegion(["Boyaca"], ["Santander"], tl, 2.1);
    tl.addLabel("stage3", 3.0);

    // t=3.1 → 3.9: Boyacá to Cundinamarca/Bogotá
    moveCam("cundinamarca", 3.1, 0.8);
    moveLight("cundinamarca", 3.1, 0.8);
    hidePanel("#boyaca-info", 3.1);
    showPanel("#cundinamarca-info", 3.5);
    focusRegion(["Cundinamarca", "Bogota"], ["Boyaca"], tl, 3.1);
    tl.addLabel("stage4", 4.0);

    // t=4.1 → 4.9: Cundinamarca to Caldas
    moveCam("caldas", 4.1, 0.8);
    moveLight("caldas", 4.1, 0.8);
    hidePanel("#cundinamarca-info", 4.1, "x");
    showPanel("#caldas-info", 4.5);
    focusRegion(["Caldas"], ["Cundinamarca", "Bogota"], tl, 4.1);
    tl.addLabel("stage5", 5.0);

    // t=5.1 → 5.9: Caldas to Tolima
    moveCam("tolima", 5.1, 0.8);
    moveLight("tolima", 5.1, 0.8);
    hidePanel("#caldas-info", 5.1);
    showPanel("#tolima-info", 5.5);
    focusRegion(["Tolima"], ["Caldas"], tl, 5.1);
    tl.addLabel("stage6", 6.0);

    // t=6.1 → 6.9: Tolima to Quindío
    moveCam("quindio", 6.1, 0.8);
    moveLight("quindio", 6.1, 0.8);
    hidePanel("#tolima-info", 6.1, "x");
    showPanel("#quindio-info", 6.5);
    focusRegion(["Quindio"], ["Tolima"], tl, 6.1);
    tl.addLabel("stage7", 7.0);

    // t=7.1 → 7.9: Quindío to Huila
    moveCam("huila", 7.1, 0.8);
    moveLight("huila", 7.1, 0.8);
    hidePanel("#quindio-info", 7.1);
    showPanel("#huila-info", 7.5);
    focusRegion(["Huila"], ["Quindio"], tl, 7.1);
    tl.addLabel("stage8", 8.0);

    // t=8.1 → 8.9: Huila to Valle
    moveCam("valle", 8.1, 0.8);
    moveLight("valle", 8.1, 0.8);
    hidePanel("#huila-info", 8.1, "x");
    showPanel("#valle-info", 8.5);
    focusRegion(["Valle"], ["Huila"], tl, 8.1);
    tl.addLabel("stage9", 9.0);

    // t=9.1 → 9.9: Finale
    const ALL = ["Norte","Santander","Boyaca","Cundinamarca","Bogota","Caldas","Quindio","Tolima","Huila","Valle"];
    ALL.forEach((n) => hl(n, visitedColor, tl, 9.1));
    
    tl.to(camera.position, { x: startPos.x, y: startPos.y, z: startPos.z, duration: 0.8, ease: "power2.inOut" }, 9.1);
    tl.to(lookAt, { x: 0, y: 0, z: 0, onUpdate: updateCam, duration: 0.8, ease: "power2.inOut" }, 9.1);
    tl.to(focusLight, { intensity: 0, duration: 0.5 }, 9.1);
    hidePanel("#valle-info", 9.1, "x");
    tl.to("#primary-info", { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, 9.5);
    tl.to("#hero-footer", { opacity: 1, pointerEvents: "auto", duration: 0.5 }, 9.5);
    
    // Explicit padding to ensure total duration cleanly ends exactly at 10.0
    tl.addLabel("stage10", 10.0);
"""

new_lines = lines[:start_idx] + [replacement + "\n"] + lines[end_idx:]

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)
print(f"Replaced {end_idx - start_idx} lines with python script.")

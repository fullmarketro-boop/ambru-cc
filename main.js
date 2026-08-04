    (function () {
      "use strict";

      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      /* Save-Data / metered networks — where supported, skip video work
         entirely and lean on the poster image (see the CSS block above). */
      var reducedData = false;
      try { reducedData = window.matchMedia("(prefers-reduced-data: reduce)").matches; } catch (_) { }

      /* ── Hero video: kickstart playback and fall back to JS-driven
         scroll parallax when CSS scroll-timeline isn't available. ── */
      var heroVideo = document.querySelector(".scroll-hero-video");
      var heroSection = document.querySelector(".scroll-hero");
      var heroStage = document.querySelector(".scroll-hero-stage");

      if (heroVideo) {
        if (reduced || reducedData) {
          heroVideo.removeAttribute("autoplay");
          heroVideo.pause();
          if (reducedData) heroVideo.preload = "none";
        } else {
          /* Video autoplays muted (browsers block unmuted autoplay). On the
             first user interaction anywhere on the page (click/tap/keypress),
             we unmute automatically — no visible button needed. */
          var kick = function () {
            var p = heroVideo.play();
            if (p && p.catch) p.catch(function (err) {
              console.warn("[hero video] autoplay blocked:", err && err.message);
            });
          };
          if (heroVideo.readyState >= 2) kick();
          else heroVideo.addEventListener("loadeddata", kick, { once: true });
          heroVideo.addEventListener("error", function () {
            console.error("[hero video] load error:", heroVideo.error && heroVideo.error.code);
          });

          /* Unmute on first user gesture — any click/tap/keypress anywhere
             turns sound on. No visible button. Multiple event types for
             cross-browser/device coverage. */
          var unmute = function () {
            heroVideo.muted = false;
            heroVideo.volume = 1;
            /* If video paused or ended, restart it so sound is heard. */
            if (heroVideo.paused || heroVideo.ended) {
              heroVideo.currentTime = 0;
              var rp = heroVideo.play();
              if (rp && rp.catch) rp.catch(function () { });
            }
          };
          document.addEventListener("pointerdown", unmute, { once: true });
          document.addEventListener("click", unmute, { once: true });
          document.addEventListener("touchstart", unmute, { once: true });
          document.addEventListener("keydown", unmute, { once: true });
        }
      }

      /* JS parallax fallback for browsers without CSS scroll-driven
         animations (older Firefox, older Safari). Drives clip-path on
         the stage, scale on the video, and opacity/translate/blur on
         the overlay text — all from the section's scroll progress
         through its stuck period. rAF-throttled. */
      var heroOverlay = document.querySelector(".scroll-hero-overlay-inner");
      if (!reduced && heroSection && heroStage && heroVideo &&
        !CSS.supports("animation-timeline: view()")) {
        var ticking = false;
        function updateHero() {
          ticking = false;
          var r = heroSection.getBoundingClientRect();
          var stuckLen = r.height - window.innerHeight;
          if (stuckLen <= 0) return;
          var progress = Math.max(0, Math.min(1, -r.top / stuckLen));

          /* Mirror the CSS @keyframes timing (see sh-zoom / sh-clip / sh-text):
             video + clip resolve in the first 50% of scroll, then HOLD at
             100% for the remaining 50%. Text fades in from 50% to 75%,
             then holds at 100% until the end. Anything past that just
             keeps the same "settled" state — never scales down further. */
          var reveal = Math.min(progress / 0.5, 1);
          var s = 25 * (1 - reveal);
          var e = 75 + 25 * reveal;
          heroStage.style.clipPath =
            "polygon(" + s + "% " + s + "%, " + e + "% " + s + "%, " +
            e + "% " + e + "%, " + s + "% " + e + "%)";
          heroVideo.style.transform = "scale(" + (1.7 - 0.7 * reveal) + ")";
          if (heroOverlay) {
            var t = Math.max(0, Math.min(1, (progress - 0.5) / 0.25));
            heroOverlay.style.opacity = t;
            heroOverlay.style.translate = "0 " + (20 * (1 - t)) + "px";
            heroOverlay.style.filter = "blur(" + (6 * (1 - t)) + "px)";
          }
        }
        window.addEventListener("scroll", function () {
          if (!ticking) { requestAnimationFrame(updateHero); ticking = true; }
        }, { passive: true });
        updateHero();
      }

      /* Hero settles once fonts land — never let a slow font gate content. */
      function fireHero() { document.querySelector("[data-hero]").classList.add("is-in"); }
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(fireHero);
        setTimeout(fireHero, 1400);
      } else {
        fireHero();
      }

      /* Reveal below the fold. */
      var risers = document.querySelectorAll(".rise");
      if (reduced || !("IntersectionObserver" in window)) {
        risers.forEach(function (el) { el.setAttribute("data-seen", "1"); });
      } else {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.setAttribute("data-seen", "1");
              io.unobserve(e.target);
            }
          });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
        risers.forEach(function (el) { io.observe(el); });
      }

      /* Spotlight on hover for service cards, testimonial notes, and any
         other [data-spot] surface. Pointer coarse (touch) skips it — no
         hover means no spotlight, and mousemove on scroll is wasted work. */
      var coarse = window.matchMedia("(pointer: coarse)").matches;
      if (!reduced && !coarse) {
        document.querySelectorAll("[data-spot]").forEach(function (card) {
          card.addEventListener("pointermove", function (e) {
            var r = card.getBoundingClientRect();
            card.style.setProperty("--mx", (e.clientX - r.left) + "px");
            card.style.setProperty("--my", (e.clientY - r.top) + "px");
          }, { passive: true });
        });
      }

      /* ── Portrait 3D tilt ──────────────────────────────────────────────
         The monogram frame gets a subtle perspective tilt tied to cursor
         position within its parent. Small angle (±5deg), long return ease
         — feels like weight, not a servo motor. Skipped on touch / reduced
         motion. Also drives a --mx/--my for the ambient rim-light. */
      var portraitEl = document.querySelector(".portrait-frame");
      var portraitParent = portraitEl && portraitEl.closest(".portrait");
      if (portraitEl && portraitParent && !reduced && !coarse) {
        var portraitRaf = 0;
        portraitParent.addEventListener("pointerenter", function () {
          portraitEl.classList.add("is-tilting");
        });
        portraitParent.addEventListener("pointermove", function (e) {
          if (portraitRaf) return;
          portraitRaf = requestAnimationFrame(function () {
            portraitRaf = 0;
            var r = portraitEl.getBoundingClientRect();
            var mx = (e.clientX - r.left) / r.width;   // 0..1
            var my = (e.clientY - r.top) / r.height;
            /* Clamp to keep the effect gentle even when cursor drifts
               outside the frame during fast movements. */
            mx = Math.max(-0.2, Math.min(1.2, mx));
            my = Math.max(-0.2, Math.min(1.2, my));
            var rx = (0.5 - my) * 8;   // ±4deg
            var ry = (mx - 0.5) * 10;  // ±5deg
            portraitEl.style.setProperty("--rx", rx.toFixed(2) + "deg");
            portraitEl.style.setProperty("--ry", ry.toFixed(2) + "deg");
            portraitEl.style.setProperty("--mx", (mx * 100) + "%");
            portraitEl.style.setProperty("--my", (my * 100) + "%");
          });
        }, { passive: true });
        portraitParent.addEventListener("pointerleave", function () {
          portraitEl.classList.remove("is-tilting");
          portraitEl.style.setProperty("--rx", "0deg");
          portraitEl.style.setProperty("--ry", "0deg");
        });
      }

      /* ── Contact email — per-character wave ────────────────────────────
         Split the email text into per-character spans so each glyph can
         lift with a small stagger on hover. Href stays intact; a static
         aria-label already carries the readable "at / dot" version.
         Preserves visible glyphs exactly (including "@" and ".").
         Skipped on reduced motion — leaves the plain string in place. */
      var mail = document.querySelector(".contact-mail");
      if (mail && !reduced && !mail.querySelector(".contact-mail-word")) {
        var raw = (mail.textContent || "").trim();
        if (raw) {
          mail.textContent = "";
          var wrap = document.createElement("span");
          wrap.className = "contact-mail-word";
          wrap.setAttribute("aria-hidden", "true");
          for (var i = 0; i < raw.length; i++) {
            var s = document.createElement("span");
            s.className = "contact-mail-char";
            s.style.setProperty("--i", i);
            s.textContent = raw[i];
            wrap.appendChild(s);
          }
          mail.appendChild(wrap);
        }
      }

      /* Signature moment — one IO trigger for the whole .sig section.
         The orchestration lives in CSS: after we set data-seen="1" on the
         wrapper, its children reveal in a coordinated sequence via
         transition-delays. This is the "one wow moment" — deliberately
         staged instead of each part animating on its own scroll trigger. */
      var sig = document.querySelector("[data-sig]");
      if (sig) {
        if (reduced || !("IntersectionObserver" in window)) {
          sig.setAttribute("data-seen", "1");
        } else {
          var sigIo = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
              if (e.isIntersecting) {
                e.target.setAttribute("data-seen", "1");
                sigIo.unobserve(e.target);
              }
            });
          }, { rootMargin: "0px 0px -20% 0px", threshold: 0.35 });
          sigIo.observe(sig);
        }
      }

      /* Mobile sticky CTA — visible after user has scrolled past the top
         of the page, hidden as they approach the contact or subscribe
         sections (both count as "already at a CTA"). rAF-throttled. */
      var mCta = document.getElementById("m-cta");
      var contact = document.getElementById("contact");
      var subscribe = document.querySelector(".subscribe");
      var mCtaVisible = false;
      function checkMCta() {
        if (!mCta) return;
        var pastFold = (window.scrollY || document.documentElement.scrollTop) > (window.innerHeight * 0.6);
        var atCtaSection = false;
        if (contact) {
          var rc = contact.getBoundingClientRect();
          if (rc.top < window.innerHeight * 0.75) atCtaSection = true;
        }
        if (!atCtaSection && subscribe) {
          var rs = subscribe.getBoundingClientRect();
          if (rs.top < window.innerHeight * 0.75) atCtaSection = true;
        }
        var shouldShow = pastFold && !atCtaSection;
        if (shouldShow !== mCtaVisible) {
          mCtaVisible = shouldShow;
          mCta.classList.toggle("is-visible", shouldShow);
          mCta.setAttribute("aria-hidden", shouldShow ? "false" : "true");
        }
      }

      /* Count-up animation for numeric callouts (+180%, +62% ...).
         rAF-driven ease-out cubic. Numbers tween from 0 to the value in
         data-count. Reduced motion resolves them to the final state
         without animating. tabular-nums (CSS above) keeps digit widths
         stable so the number doesn't wobble mid-tween. */
      var countables = document.querySelectorAll("[data-count]");
      if (countables.length) {
        var runCount = function (el) {
          var target = parseFloat(el.getAttribute("data-count")) || 0;
          var prefix = el.getAttribute("data-count-prefix") || "";
          var suffix = el.getAttribute("data-count-suffix") || "";
          if (reduced) { el.textContent = prefix + target + suffix; return; }
          var duration = 1300;
          var start = performance.now();
          var frame = function (now) {
            var elapsed = now - start;
            var p = Math.min(1, elapsed / duration);
            var eased = 1 - Math.pow(1 - p, 3);  /* ease-out cubic */
            el.textContent = prefix + Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(frame);
          };
          requestAnimationFrame(frame);
        };
        if (!("IntersectionObserver" in window)) {
          countables.forEach(runCount);
        } else {
          var countIo = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
              if (e.isIntersecting) {
                runCount(e.target);
                countIo.unobserve(e.target);
              }
            });
          }, { threshold: 0.45, rootMargin: "0px 0px -10% 0px" });
          countables.forEach(function (el) { countIo.observe(el); });
        }
      }

      /* Newsletter submit — shows a local confirmation state so the UI
         never looks unwired. Replace this handler (or remove it) once the
         form action targets your real ESP endpoint. */
      var subForm = document.querySelector("[data-subscribe]");
      if (subForm) {
        subForm.addEventListener("submit", function (e) {
          /* Only intercept when action is the placeholder "#" — a real
             action URL should submit normally to the ESP. */
          var action = subForm.getAttribute("action") || "";
          if (action !== "" && action !== "#") return;
          e.preventDefault();
          var input = subForm.querySelector(".subscribe-input");
          var btn = subForm.querySelector(".subscribe-submit");
          if (!input || !input.value || !input.checkValidity()) {
            if (input) input.focus();
            return;
          }
          subForm.classList.add("is-done");
          input.value = "Thanks — you're on the list.";
          input.setAttribute("disabled", "");
          if (btn) { btn.textContent = "Done"; btn.setAttribute("disabled", ""); }
        });
      }

      /* Scroll-progress JS fallback for browsers without scroll-timeline
         (older Firefox / older Safari). If the CSS animation-timeline
         handles it, this early-out keeps the JS from double-driving. */
      var progressBar = document.querySelector(".scroll-progress");
      var cssDrivesProgress = CSS.supports("animation-timeline: scroll()");
      function updateProgress() {
        if (!progressBar || cssDrivesProgress) return;
        var h = document.documentElement;
        var scrollable = (h.scrollHeight - h.clientHeight) || 1;
        var p = Math.max(0, Math.min(1, (window.scrollY || h.scrollTop) / scrollable));
        progressBar.style.transform = "scaleX(" + p + ")";
      }

      /* Nav rule appears after 24px of scroll — rAF-throttled.
         Shares its rAF pacing with the mobile CTA + scroll progress checks
         to keep scroll handlers to one listener + one animation frame. */
      var nav = document.querySelector(".nav");
      var scrolled = false;
      var scrollTicking = false;
      function checkScroll() {
        scrollTicking = false;
        var s = (window.scrollY || document.documentElement.scrollTop) > 24;
        if (s !== scrolled) { scrolled = s; nav.classList.toggle("is-scrolled", s); }
        checkMCta();
        updateProgress();
      }
      window.addEventListener("scroll", function () {
        if (!scrollTicking) { requestAnimationFrame(checkScroll); scrollTicking = true; }
      }, { passive: true });
      window.addEventListener("resize", checkScroll, { passive: true });
      checkScroll();

      document.getElementById("year").textContent = new Date().getFullYear();
    })();

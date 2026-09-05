/* ============================================================
   Render + i18n + tema. Sem dependencias.
   ============================================================ */
(function () {
  "use strict";

  var C = window.CONTENT;
  var LANGS = ["pt", "en"];
  var lang = "pt";
  var openCases = {};

  /* ---------- storage helpers (podem lancar em contexto restrito) ---------- */
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* noop */ } }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ============================================================
     DIAGRAMAS — reconstrucoes genericas, sem dado de cliente
     ============================================================ */
  var DL = {
    pt: {
      exp: {
        opTitle: "Visão operacional", opSub: "Console de nuvem · fatura de TI",
        opFoot: "orienta a decisão da área",
        trTitle: "Camada de transformação",
        tr: ["Rateios entre áreas", "Deduções e ajustes", "Regras de alocação", "Critérios não documentados"],
        fiTitle: "Visão financeira", fiSub: "Dashboard corporativo",
        fiFoot: "reconhece e remunera o ganho",
        gap: "a explicação do caminho — é isso que falta",
        both: "As duas informações estão corretas.",
        cap: "O descompasso que quebra o incentivo: a ação é decidida numa ponta e reconhecida na outra, sem rastreabilidade entre elas. Valores ilustrativos."
      },
      sell: {
        title: "Um sistema que se retroalimenta",
        n1: "Baixa confiança\nno dado", n2: "Validação manual\ne defensiva",
        n3: "Sem tempo para\ndocumentar", n4: "Processo apoiado em\nconhecimento tácito",
        block: "trava a automação\nque resolveria a confiança",
        side1: "Fragmentação de fontes\ne ausência de chave única",
        side2: "Timing do dado fora do\nciclo de decisão",
        cap: "Quatro dos seis problemas estruturais formam um ciclo fechado. Atacar um item isolado não move o conjunto — por isso o roadmap foi sequenciado, e não priorizado item a item."
      },
      pqa: {
        inTitle: "Artefato no board", inSub: "iniciativa · épico · task\nbug · spike",
        c1: "Validação de campos\nem tempo real",
        c2: "Biblioteca de prompts\nversionada",
        c2sub: "templates por tipo · frameworks\nde índice · sumarização",
        ai: "Scoring de\nqualidade por IA",
        outTitle: "Painel de\nresultado", outSub: "nota, lacunas\ne sugestões",
        loop: "o autor corrige antes de a engenharia pegar",
        cap: "A extensão roda sobre a ferramenta de gestão e devolve o resultado no mesmo lugar onde o artefato é escrito. O ganho não é o checklist — é o momento em que ele aparece."
      },
      plg: {
        r1: "Van Westendorp", r1s: "faixa de sensibilidade a preço",
        r2: "MaxDiff", r2s: "hierarquia de valor entre funcionalidades",
        r3: "Benchmarking", r3s: "análise competitiva",
        mid: "Estrutura de planos", midSub: "o que entra em cada faixa,\ne por quê",
        f1: "Aquisição self-serve", f2: "Ativação no produto", f3: "Expansão por uso",
        cap: "A pesquisa não gerou um preço: gerou o critério de o que entra em cada plano. Sem isso, o funil self-serve não tem o que empacotar."
      }
    },
    en: {
      exp: {
        opTitle: "Operational view", opSub: "Cloud console · IT invoice",
        opFoot: "drives the area's decision",
        trTitle: "Transformation layer",
        tr: ["Cross-area allocations", "Deductions and adjustments", "Accounting rules", "Undocumented criteria"],
        fiTitle: "Financial view", fiSub: "Corporate dashboard",
        fiFoot: "recognizes and pays the gain",
        gap: "the explanation of the path — that's what's missing",
        both: "Both figures are correct.",
        cap: "The mismatch that breaks the incentive: the action is decided at one end and recognized at the other, with no traceability between them. Illustrative figures."
      },
      sell: {
        title: "A self-reinforcing system",
        n1: "Low trust\nin the data", n2: "Manual, defensive\nvalidation",
        n3: "No time left\nto document", n4: "Process resting on\ntacit knowledge",
        block: "blocks the automation\nthat would fix the trust",
        side1: "Fragmented sources\nand no unique keys",
        side2: "Data timing out of sync\nwith decision cycles",
        cap: "Four of the six structural problems form a closed loop. Attacking any single item doesn't move the whole — which is why the roadmap was sequenced rather than prioritized item by item."
      },
      pqa: {
        inTitle: "Artifact on the board", inSub: "initiative · epic · task\nbug · spike",
        c1: "Real-time\nfield validation",
        c2: "Versioned\nprompt library",
        c2sub: "templates per type · index\nframeworks · summarization",
        ai: "AI quality\nscoring",
        outTitle: "Result\npanel", outSub: "score, gaps\nand fixes",
        loop: "the author fixes it before engineering picks it up",
        cap: "The extension runs on top of the tracking tool and returns the result in the same place the artifact is written. The gain isn't the checklist — it's the moment it shows up."
      },
      plg: {
        r1: "Van Westendorp", r1s: "price sensitivity range",
        r2: "MaxDiff", r2s: "value hierarchy across features",
        r3: "Benchmarking", r3s: "competitive analysis",
        mid: "Plan structure", midSub: "what goes in each tier,\nand why",
        f1: "Self-serve acquisition", f2: "In-product activation", f3: "Usage-based expansion",
        cap: "The research didn't produce a price: it produced the criteria for what belongs in each plan. Without that, the self-serve funnel has nothing to package."
      }
    }
  };

  /* helper: texto multilinha em SVG */
  function lines(text, x, y, cls, lh) {
    var parts = String(text).split("\n");
    return parts.map(function (p, i) {
      return '<tspan x="' + x + '" dy="' + (i === 0 ? 0 : (lh || 15)) + '">' + esc(p) + "</tspan>";
    }).join("");
  }

  var DIAGRAMS = {
    explainability: function (d) {
      var t = d.exp;
      return '' +
      '<svg viewBox="0 0 760 300" role="img" aria-label="' + esc(t.cap) + '">' +
        '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
          '<path d="M0,0 L10,5 L0,10 z" fill="var(--muted)"/></marker>' +
        '<marker id="ahd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
          '<path d="M0,0 L10,5 L0,10 z" fill="var(--warm)"/></marker></defs>' +

        '<rect class="d-box-acc" x="14" y="54" width="196" height="112" rx="10"/>' +
        '<text class="d-t-md d-acc" x="34" y="82">' + esc(t.opTitle) + '</text>' +
        '<text class="d-t-sm d-muted" x="34" y="100">' + esc(t.opSub) + '</text>' +
        '<text class="d-t-num d-ink" x="34" y="140">R$ 100k</text>' +
        '<text class="d-t-sm d-muted" x="34" y="188">' + esc(t.opFoot) + '</text>' +

        '<path class="d-line" d="M216,110 L268,110" marker-end="url(#ah)"/>' +

        '<rect class="d-box" x="274" y="34" width="212" height="152" rx="10"/>' +
        '<text class="d-t-md d-ink" x="294" y="62">' + esc(t.trTitle) + '</text>' +
        t.tr.map(function (item, i) {
          return '<circle cx="298" cy="' + (84 + i * 24) + '" r="2.5" fill="var(--muted)"/>' +
                 '<text class="d-t-sm d-soft" x="310" y="' + (88 + i * 24) + '">' + esc(item) + '</text>';
        }).join("") +

        '<path class="d-line" d="M492,110 L544,110" marker-end="url(#ah)"/>' +

        '<rect class="d-box-warm" x="550" y="54" width="196" height="112" rx="10"/>' +
        '<text class="d-t-md d-warm" x="570" y="82">' + esc(t.fiTitle) + '</text>' +
        '<text class="d-t-sm d-muted" x="570" y="100">' + esc(t.fiSub) + '</text>' +
        '<text class="d-t-num d-ink" x="570" y="140">R$ 10k</text>' +
        '<text class="d-t-sm d-muted" x="570" y="188">' + esc(t.fiFoot) + '</text>' +

        '<path class="d-dash" style="stroke:var(--warm)" d="M648,206 C648,252 112,252 112,208" marker-end="url(#ahd)"/>' +
        '<rect x="268" y="228" width="224" height="26" rx="13" fill="var(--bg)"/>' +
        '<text class="d-t-sm d-warm" x="380" y="245" text-anchor="middle">' + esc(t.gap) + '</text>' +
        '<text class="d-t-sm d-muted" x="380" y="284" text-anchor="middle">' + esc(t.both) + '</text>' +
      '</svg>';
    },

    sellout: function (d) {
      var t = d.sell;
      function node(x, y, w, h, label) {
        return '<rect class="d-box" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10"/>' +
               '<text class="d-t-md d-ink" x="' + (x + w / 2) + '" y="' + (y + h / 2 - 4) + '" text-anchor="middle">' +
               lines(label, x + w / 2, 0, "", 16) + '</text>';
      }
      return '' +
      '<svg viewBox="0 0 760 340" role="img" aria-label="' + esc(t.cap) + '">' +
        '<defs><marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
          '<path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs>' +

        '<text class="d-t-lg d-ink" x="380" y="26" text-anchor="middle">' + esc(t.title) + '</text>' +

        node(250, 52, 176, 56, t.n1) +
        node(474, 140, 176, 56, t.n2) +
        node(250, 232, 176, 56, t.n3) +
        node(26, 140, 176, 56, t.n4) +

        '<path class="d-line-acc" d="M430,86 C468,92 486,110 494,134" marker-end="url(#ah2)"/>' +
        '<path class="d-line-acc" d="M562,200 C562,236 486,250 430,256" marker-end="url(#ah2)"/>' +
        '<path class="d-line-acc" d="M246,256 C190,250 114,236 114,200" marker-end="url(#ah2)"/>' +
        '<path class="d-line-acc" d="M180,134 C190,110 208,92 246,86" marker-end="url(#ah2)"/>' +

        '<text class="d-t-sm d-muted" x="338" y="163" text-anchor="middle">' +
          lines(t.block, 338, 0, "", 15) + '</text>' +

        '<rect class="d-box" x="26" y="300" width="330" height="34" rx="8" opacity=".65"/>' +
        '<text class="d-t-sm d-muted" x="42" y="315">' + lines(t.side1, 42, 0, "", 13) + '</text>' +
        '<rect class="d-box" x="404" y="300" width="330" height="34" rx="8" opacity=".65"/>' +
        '<text class="d-t-sm d-muted" x="420" y="315">' + lines(t.side2, 420, 0, "", 13) + '</text>' +
      '</svg>';
    },

    pqa: function (d) {
      var t = d.pqa;
      return '' +
      '<svg viewBox="0 0 760 300" role="img" aria-label="' + esc(t.cap) + '">' +
        '<defs><marker id="ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
          '<path d="M0,0 L10,5 L0,10 z" fill="var(--muted)"/></marker>' +
        '<marker id="ah3a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
          '<path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs>' +

        '<rect class="d-box" x="10" y="94" width="188" height="84" rx="10"/>' +
        '<text class="d-t-md d-ink" x="28" y="124">' + esc(t.inTitle) + '</text>' +
        '<text class="d-t-sm d-muted" x="28" y="144">' + lines(t.inSub, 28, 0, "", 14) + '</text>' +

        '<path class="d-line" d="M204,136 L232,136" marker-end="url(#ah3)"/>' +

        '<rect class="d-box-acc" x="238" y="50" width="196" height="64" rx="10"/>' +
        '<text class="d-t-md d-acc" x="258" y="79">' + lines(t.c1, 258, 0, "", 16) + '</text>' +

        '<rect class="d-box-acc" x="238" y="152" width="196" height="92" rx="10"/>' +
        '<text class="d-t-md d-acc" x="258" y="180">' + lines(t.c2, 258, 0, "", 16) + '</text>' +
        '<text class="d-t-sm d-muted" x="258" y="218">' + lines(t.c2sub, 258, 0, "", 14) + '</text>' +

        '<path class="d-line-acc" d="M440,82 C466,90 474,108 478,126" marker-end="url(#ah3a)"/>' +
        '<path class="d-line-acc" d="M440,198 C466,190 474,168 478,150" marker-end="url(#ah3a)"/>' +

        '<rect class="d-box-warm" x="484" y="104" width="126" height="66" rx="10"/>' +
        '<text class="d-t-md d-warm" x="500" y="132">' + lines(t.ai, 500, 0, "", 16) + '</text>' +

        '<path class="d-line" d="M616,136 L634,136" marker-end="url(#ah3)"/>' +

        '<rect class="d-box" x="640" y="94" width="114" height="84" rx="10"/>' +
        '<text class="d-t-md d-ink" x="654" y="122">' + lines(t.outTitle, 654, 0, "", 15) + '</text>' +
        '<text class="d-t-sm d-muted" x="654" y="156">' + lines(t.outSub, 654, 0, "", 13) + '</text>' +

        '<path class="d-dash" d="M697,188 C697,262 100,262 100,186" marker-end="url(#ah3)"/>' +
        '<rect x="272" y="248" width="254" height="24" rx="12" fill="var(--bg)"/>' +
        '<text class="d-t-sm d-muted" x="399" y="264" text-anchor="middle">' + esc(t.loop) + '</text>' +
      '</svg>';
    },

    plg: function (d) {
      var t = d.plg;
      function res(y, title, sub) {
        return '<rect class="d-box" x="10" y="' + y + '" width="224" height="62" rx="10"/>' +
               '<text class="d-t-md d-ink" x="30" y="' + (y + 27) + '">' + esc(title) + '</text>' +
               '<text class="d-t-sm d-muted" x="30" y="' + (y + 46) + '">' + esc(sub) + '</text>';
      }
      return '' +
      '<svg viewBox="0 0 760 268" role="img" aria-label="' + esc(t.cap) + '">' +
        '<defs><marker id="ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
          '<path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs>' +

        res(16, t.r1, t.r1s) + res(96, t.r2, t.r2s) + res(176, t.r3, t.r3s) +

        '<path class="d-line-acc" d="M240,47 C274,52 288,84 298,112" marker-end="url(#ah4)"/>' +
        '<path class="d-line-acc" d="M240,127 L298,131" marker-end="url(#ah4)"/>' +
        '<path class="d-line-acc" d="M240,207 C274,202 288,172 298,150" marker-end="url(#ah4)"/>' +

        '<rect class="d-box-acc" x="304" y="92" width="196" height="80" rx="10"/>' +
        '<text class="d-t-lg d-acc" x="402" y="124" text-anchor="middle">' + esc(t.mid) + '</text>' +
        '<text class="d-t-sm d-muted" x="402" y="145" text-anchor="middle">' +
          lines(t.midSub, 402, 0, "", 14) + '</text>' +

        '<path class="d-line-acc" d="M506,132 L536,132" marker-end="url(#ah4)"/>' +

        '<path class="d-box-warm" d="M546,80 L752,80 L736,118 L562,118 Z"/>' +
        '<text class="d-t-md d-warm" x="649" y="104" text-anchor="middle">' + esc(t.f1) + '</text>' +
        '<path class="d-box-warm" d="M562,126 L736,126 L720,164 L578,164 Z"/>' +
        '<text class="d-t-md d-warm" x="649" y="150" text-anchor="middle">' + esc(t.f2) + '</text>' +
        '<path class="d-box-warm" d="M578,172 L720,172 L704,210 L594,210 Z"/>' +
        '<text class="d-t-sm d-warm" x="649" y="196" text-anchor="middle">' + esc(t.f3) + '</text>' +
      '</svg>';
    }
  };

  /* ============================================================
     RENDER
     ============================================================ */
  function L(node) { return node[lang]; }

  function render() {
    var d = DL[lang];
    var ui = L(C.ui);

    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    document.title = L(C.meta).title;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", L(C.meta).description);

    /* nav */
    var nav = L(C.nav);
    document.getElementById("nav").innerHTML =
      '<a href="#about">' + esc(nav.about) + "</a>" +
      '<a href="#work">' + esc(nav.work) + "</a>" +
      '<a href="#cases">' + esc(nav.cases) + "</a>" +
      '<a href="#toolkit">' + esc(nav.toolkit) + "</a>" +
      '<a href="#contact">' + esc(nav.contact) + "</a>";

    document.getElementById("skip").textContent = ui.skip;
    document.getElementById("langBtn").textContent = ui.langShort;
    document.getElementById("langBtn").setAttribute("aria-label", ui.langLabel);
    document.getElementById("themeBtn").setAttribute("aria-label", ui.theme);

    /* hero */
    var h = L(C.hero);
    document.getElementById("hero").innerHTML =
      '<div class="wrap">' +
        '<p class="hero__kicker">' + esc(h.kicker) + "</p>" +
        "<h1>" + esc(h.name) + "</h1>" +
        '<p class="hero__lead">' + h.lead + "</p>" +
        '<p class="hero__body">' + esc(h.body) + "</p>" +
        '<div class="hero__cta">' +
          '<a class="btn btn--primary" href="#cases">' + esc(h.ctaCases) +
            ' <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' +
          '<a class="btn btn--ghost" href="#contact">' + esc(h.ctaContact) + "</a>" +
        "</div>" +
      "</div>";

    /* stats */
    document.getElementById("stats").innerHTML =
      '<div class="wrap"><div class="stats">' +
      L(C.stats).map(function (s) {
        return '<div class="stat"><div class="stat__n">' + esc(s.n) + '</div><div class="stat__l">' + esc(s.l) + "</div></div>";
      }).join("") +
      "</div></div>";

    /* about */
    var a = L(C.about);
    var half = Math.ceil(a.p.length / 2);
    document.getElementById("about").innerHTML =
      '<div class="wrap">' +
        '<div class="sec__head"><p class="sec__eyebrow">' + esc(a.title) + "</p></div>" +
        '<div class="about">' +
          "<div>" + a.p.slice(0, half).map(function (p) { return "<p>" + p + "</p>"; }).join("") + "</div>" +
          "<div>" + a.p.slice(half).map(function (p) { return "<p>" + p + "</p>"; }).join("") + "</div>" +
        "</div>" +
      "</div>";

    /* work */
    var wt = L(C.workTitle);
    document.getElementById("work").innerHTML =
      '<div class="wrap">' +
        '<div class="sec__head"><p class="sec__eyebrow">' + esc(wt.title) + "</p>" +
        "<h2>" + esc(wt.title) + '</h2><p class="sec__note">' + esc(wt.note) + "</p></div>" +
        '<div class="tl">' +
        C.work.map(function (w) {
          var x = w[lang];
          return '<div class="tl__item">' +
            '<div class="tl__badge">' + esc(w.logo) + "</div>" +
            "<div>" +
              '<div class="tl__org">' + esc(w.org) + "</div>" +
              '<div class="tl__role">' + esc(x.role) + "</div>" +
              (x.note ? '<div class="tl__note">' + esc(x.note) + "</div>" : "") +
              '<p class="tl__desc">' + esc(x.desc) + "</p>" +
            "</div></div>";
        }).join("") +
        "</div></div>";

    /* cases */
    var ct = L(C.casesTitle);
    document.getElementById("cases").innerHTML =
      '<div class="wrap">' +
        '<div class="sec__head"><p class="sec__eyebrow">' + esc(ct.title) + "</p>" +
        "<h2>" + esc(ct.title) + '</h2><p class="sec__note">' + esc(ct.note) + "</p></div>" +
        '<div class="cases">' +
        C.cases.map(function (c) {
          var x = c[lang];
          var isOpen = !!openCases[c.id];
          var dgm = "";
          if (c.diagram && DIAGRAMS[c.diagram]) {
            var capKey = { explainability: "exp", sellout: "sell", pqa: "pqa", plg: "plg" }[c.diagram];
            dgm = '<div class="dgm">' + DIAGRAMS[c.diagram](d) +
                  '<p class="dgm__cap">' + esc(d[capKey].cap) + "</p></div>";
          }
          return '<article class="case' + (isOpen ? " is-open" : "") + '" id="case-' + c.id + '">' +
            '<button class="case__head" type="button" data-case="' + c.id + '" aria-expanded="' + isOpen + '" aria-controls="body-' + c.id + '">' +
              '<p class="case__client">' + esc(x.client) + "</p>" +
              '<h3 class="case__title">' + esc(x.title) + "</h3>" +
              '<p class="case__summary">' + esc(x.summary) + "</p>" +
              '<div class="case__meta">' +
                c.tags.map(function (tg) { return '<span class="tag">' + esc(tg) + "</span>"; }).join("") +
                '<span class="case__toggle">' + esc(isOpen ? ui.readLess : ui.readMore) +
                  ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></span>' +
              "</div>" +
            "</button>" +
            '<div class="case__body" id="body-' + c.id + '"><hr>' + dgm +
              x.sections.map(function (s) {
                return '<div class="case__sec"><h4>' + esc(s.h) + "</h4><p>" + s.p + "</p></div>";
              }).join("") +
            "</div></article>";
        }).join("") +
        "</div></div>";

    /* toolkit + education */
    var k = L(C.toolkit), ed = L(C.education);
    document.getElementById("toolkit").innerHTML =
      '<div class="wrap">' +
        '<div class="sec__head"><p class="sec__eyebrow">' + esc(k.title) + "</p><h2>" + esc(k.title) + "</h2></div>" +
        '<div class="kit">' +
        k.groups.map(function (g) {
          return '<div class="kit__g"><h3>' + esc(g.h) + "</h3><ul>" +
            g.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul></div>";
        }).join("") +
        "</div>" +
        '<div class="edu"><h3>' + esc(ed.title) + "</h3><ul>" +
          ed.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") +
        "</ul></div>" +
      "</div>";

    /* contact */
    var co = L(C.contact);
    document.getElementById("contact").innerHTML =
      '<div class="wrap contact">' +
        "<h2>" + esc(co.title) + "</h2>" +
        '<p class="contact__lead">' + esc(co.lead) + "</p>" +
        '<div class="contact__links">' +
          '<a class="btn btn--primary" href="mailto:kevin-camargo@hotmail.com">kevin-camargo@hotmail.com</a>' +
          '<a class="btn btn--ghost" href="https://www.linkedin.com/in/kevin-lucas-camargo-b59882162/" target="_blank" rel="noopener noreferrer">LinkedIn</a>' +
          '<a class="btn btn--ghost" href="https://github.com/kevinlucascamargo" target="_blank" rel="noopener noreferrer">GitHub</a>' +
        "</div>" +
        '<p class="contact__loc">' + esc(co.location) + "</p>" +
      "</div>";

    /* footer */
    document.getElementById("ftr").innerHTML =
      '<div class="wrap ftr__in"><span>© ' + new Date().getFullYear() + " Kevin Lucas Camargo</span>" +
      "<span>" + esc(L(C.footer).built) + "</span></div>";
  }

  /* ============================================================
     EVENTOS
     ============================================================ */
  document.addEventListener("click", function (e) {
    var head = e.target.closest ? e.target.closest("[data-case]") : null;
    if (head) {
      var id = head.getAttribute("data-case");
      openCases[id] = !openCases[id];
      var card = document.getElementById("case-" + id);
      card.classList.toggle("is-open", openCases[id]);
      head.setAttribute("aria-expanded", String(openCases[id]));
      var tog = head.querySelector(".case__toggle");
      var ui = L(C.ui);
      tog.childNodes[0].nodeValue = (openCases[id] ? ui.readLess : ui.readMore) + " ";
    }
  });

  function setLang(next) {
    lang = next;
    write("kc-lang", next);
    render();
  }

  function setTheme(next) {
    document.documentElement.setAttribute("data-theme", next);
    write("kc-theme", next);
  }

  function boot() {
    var savedLang = read("kc-lang");
    if (LANGS.indexOf(savedLang) !== -1) {
      lang = savedLang;
    } else {
      lang = (navigator.language || "pt").toLowerCase().indexOf("pt") === 0 ? "pt" : "en";
    }

    var savedTheme = read("kc-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }

    render();

    document.getElementById("langBtn").addEventListener("click", function () {
      setLang(lang === "pt" ? "en" : "pt");
    });

    document.getElementById("themeBtn").addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      if (!cur) {
        cur = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      setTheme(cur === "dark" ? "light" : "dark");
    });

    var hdr = document.querySelector(".hdr");
    var onScroll = function () { hdr.classList.toggle("is-stuck", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

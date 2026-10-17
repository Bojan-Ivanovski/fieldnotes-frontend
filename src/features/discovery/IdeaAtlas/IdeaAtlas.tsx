import './IdeaAtlas.css'
/** Decorative, code-native artwork: a thought becoming a constellation. */
export function IdeaAtlas() {
  return (
    <div className="idea-atlas" aria-hidden="true">
      <div className="atlas-halo atlas-halo-green" />
      <div className="atlas-halo atlas-halo-violet" />
      <svg className="atlas-orbits" viewBox="0 0 1440 950" fill="none">
        <defs>
          <linearGradient id="orbit-light" x1="100" y1="700" x2="1300" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a4dda4" stopOpacity="0" />
            <stop offset=".35" stopColor="#a4dda4" stopOpacity=".65" />
            <stop offset=".7" stopColor="#c9bbff" stopOpacity=".65" />
            <stop offset="1" stopColor="#c9bbff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="atlas-world">
            <stop stopColor="#bceca0" stopOpacity=".15" />
            <stop offset="1" stopColor="#bceca0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="720" cy="740" rx="620" ry="360" fill="url(#atlas-world)" />
        <g stroke="url(#orbit-light)" strokeWidth="1">
          <ellipse cx="720" cy="570" rx="645" ry="217" transform="rotate(-19 720 570)" />
          <ellipse cx="720" cy="570" rx="690" ry="258" transform="rotate(18 720 570)" />
          <ellipse cx="720" cy="570" rx="590" ry="315" transform="rotate(-38 720 570)" opacity=".45" />
          <path d="M-80 840C140 390 440 1110 790 715S1220 400 1520 540" opacity=".5" strokeDasharray="3 9" />
        </g>
        <g fill="#c3e8a8">
          <circle cx="143" cy="463" r="3" /><circle cx="277" cy="708" r="4" />
          <circle cx="1169" cy="340" r="3" /><circle cx="1253" cy="639" r="4" />
          <circle cx="470" cy="192" r="2" /><circle cx="1081" cy="724" r="2" />
        </g>
        <g fill="#bca8f1">
          <circle cx="200" cy="252" r="2" /><circle cx="1280" cy="205" r="2" />
          <circle cx="109" cy="682" r="2" /><circle cx="934" cy="125" r="2" />
        </g>
        <g stroke="#c1eaa6" strokeLinecap="round">
          <path d="M1240 438v18m-9-9h18M277 264v12m-6-6h12M400 783v16m-8-8h16" />
        </g>
      </svg>
      <div className="atlas-fragment atlas-fragment-left">
        <span className="atlas-fragment-icon">↳</span>
        <div><span className="atlas-fragment-label">A FOLIO IN THE MAKING</span><strong>What if we followed<br />this a little further?</strong><span className="atlas-fragment-lines"><i /><i /><i /></span></div>
        <span className="atlas-fragment-corner">↗</span>
      </div>
      <div className="atlas-fragment atlas-fragment-right">
        <span className="atlas-fragment-icon">▤</span>
        <div><span className="atlas-fragment-label">ONE BOOK. MANY THREADS.</span><strong>The curiosity collection</strong><span className="atlas-mini-folios"><i>f.</i><i>f.</i><i>f.</i><span>Connected, never copied.</span></span></div>
      </div>
      <span className="atlas-coordinate atlas-coordinate-left">01 / A SMALL OBSERVATION</span>
      <span className="atlas-coordinate atlas-coordinate-right">∞ / POSSIBLE CONNECTIONS</span>
    </div>
  )
}

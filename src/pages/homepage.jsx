import React, { useEffect, useRef } from "react";
import { Helmet } from "react-helmet";

import "./styles/homepage.css";

const WORK = [
	{
		company: "Datadog",
		place: "New York City",
		logo: "datadog-logo.png",
		role: "Software Engineer",
		duration: "2021 — PRESENT",
		blurb: "Distributed storage for metric ingest & indexing — the systems behind every query.",
		current: true,
	},
	{
		company: "Salesforce",
		place: "San Francisco",
		logo: "salesforce-logo.png",
		role: "Software Engineer Intern · Infrastructure",
		duration: "2021",
		blurb: "Edge computing initiatives — Hibernate, Liquibase, Spring.",
	},
	{
		company: "Autodesk",
		place: "San Rafael",
		logo: "autodesk-logo.png",
		role: "Software Engineer Intern · Back-end",
		duration: "2020",
		blurb: "TypeScript cloud SDK for Fusion 360; graph queries 30% faster.",
	},
	{
		company: "StackAdapt",
		place: "Toronto",
		logo: "stackadapt-logo.png",
		role: "Software Engineer Intern · Full-stack",
		duration: "2020",
		blurb: "Rails, React & Go — custom KPI alerts and automated billing.",
	},
];

/* 8×8 Bayer matrix — ordered dithering, the engraving treatment */
const BAYER = [
	[0, 32, 8, 40, 2, 34, 10, 42],
	[48, 16, 56, 24, 50, 18, 58, 26],
	[12, 44, 4, 36, 14, 46, 6, 38],
	[60, 28, 52, 20, 62, 30, 54, 22],
	[3, 35, 11, 43, 1, 33, 9, 41],
	[51, 19, 59, 27, 49, 17, 57, 25],
	[15, 47, 7, 39, 13, 45, 5, 37],
	[63, 31, 55, 23, 61, 29, 53, 21],
];
/* warm 4-tone ramp: ink → umber → old gold → parchment */
const PALETTE = [
	[11, 10, 8],
	[72, 60, 38],
	[158, 134, 82],
	[231, 223, 208],
];

const Homepage = () => {
	const plateRef = useRef(null);

	/* page ground */
	useEffect(() => {
		document.body.classList.add("hx-body");
		window.scrollTo(0, 0);
		return () => document.body.classList.remove("hx-body");
	}, []);

	/* dither the portrait */
	useEffect(() => {
		const canvas = plateRef.current;
		if (!canvas) return;
		const img = new Image();
		img.src = process.env.PUBLIC_URL + "/homepage.JPG";
		img.onload = () => {
			const w = 232;
			const h = Math.round((img.height / img.width) * w);
			canvas.width = w;
			canvas.height = h;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, w, h);
			const data = ctx.getImageData(0, 0, w, h);
			const p = data.data;
			const n = PALETTE.length - 1;
			for (let y = 0; y < h; y++) {
				for (let x = 0; x < w; x++) {
					const i = (y * w + x) * 4;
					let l =
						(0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2]) / 255;
					l = Math.min(1, Math.max(0, (l - 0.5) * 1.3 + 0.52));
					const t = (BAYER[y % 8][x % 8] + 0.5) / 64;
					const idx = Math.min(
						n,
						Math.max(0, Math.round(l * n + t - 0.5))
					);
					const c = PALETTE[idx];
					p[i] = c[0];
					p[i + 1] = c[1];
					p[i + 2] = c[2];
					p[i + 3] = 255;
				}
			}
			ctx.putImageData(data, 0, 0);
			canvas.classList.add("hx-plate-ready");
		};
	}, []);

	/* scroll reveals */
	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
			return;
		const io = new IntersectionObserver(
			(entries) =>
				entries.forEach(
					(e) => e.isIntersecting && e.target.classList.add("hx-in")
				),
			{ threshold: 0.12 }
		);
		document.querySelectorAll(".hx-reveal").forEach((el) => io.observe(el));
		return () => io.disconnect();
	}, []);

	return (
		<React.Fragment>
			<Helmet>
				<title>Shan Somas — Software Engineer</title>
				<meta
					name="description"
					content="Shan Somas — software engineer at Datadog, NYC. Distributed storage, and instruments for thinking clearly about money."
				/>
			</Helmet>

			<div className="hx-root">
				<header className="hx-bar">
					<span className="hx-bar-name">SHAN&nbsp;SOMAS</span>
					<span className="hx-bar-coords">
						40.7420°N&nbsp;/&nbsp;74.0080°W&nbsp;—&nbsp;NYC
					</span>
					<nav className="hx-bar-nav">
						<a href="#work">WORK</a>
						<a href="#products">PRODUCTS</a>
						<a href="#contact">CONTACT</a>
					</nav>
				</header>

				{/* ————— HERO ————— */}
				<section className="hx-hero">
					<div className="hx-hero-copy">
						<p className="hx-eyebrow">
							SOFTWARE ENGINEER · DATADOG, NEW YORK
						</p>
						<h1 className="hx-display">
							Storage systems by day, everything else{" "}
							<em>after&nbsp;hours.</em>
						</h1>
						<p className="hx-hero-sub">
							Distributed storage — ingest, index, retrieve.
							Computer Engineering, University of Waterloo.
							Previously Salesforce, Autodesk &amp; StackAdapt.
						</p>
						<div className="hx-hero-foot">
							<span>SCROLL&nbsp;↓</span>
							<span>PORTFOLIO&nbsp;—&nbsp;MMXXVI&nbsp;—&nbsp;REV.&nbsp;III</span>
						</div>
					</div>

					<figure className="hx-plate">
						<div className="hx-plate-frame">
							<i className="hx-tick hx-tick-tl" />
							<i className="hx-tick hx-tick-tr" />
							<i className="hx-tick hx-tick-bl" />
							<i className="hx-tick hx-tick-br" />
							<canvas
								ref={plateRef}
								className="hx-plate-canvas"
								aria-label="Dithered portrait of Shan Somas on the Hudson River, Lower Manhattan behind"
							/>
						</div>
						<figcaption className="hx-plate-caption">
							<span>PLATE&nbsp;I&nbsp;—&nbsp;THE&nbsp;HUDSON, LOWER&nbsp;MANHATTAN</span>
							<span>FIG.&nbsp;01</span>
						</figcaption>
					</figure>
				</section>

				{/* ————— WORK ————— */}
				<section id="work" className="hx-section hx-reveal">
					<div className="hx-sec-head">
						<span className="hx-sec-num">01</span>
						<span className="hx-sec-title">WORK</span>
						<span className="hx-sec-note">2020&nbsp;—&nbsp;PRESENT</span>
					</div>

					<div className="hx-work">
						{WORK.map((w) => (
							<a
								className="hx-work-row"
								key={w.company}
								href="https://linkedin.com/in/shan-somas"
								target="_blank"
								rel="noreferrer"
							>
								<span className="hx-work-dur">{w.duration}</span>
								<span className="hx-work-main">
									<span className="hx-work-company">
										{w.company}
										{w.current && (
											<span className="hx-chip">● CURRENT</span>
										)}
									</span>
									<span className="hx-work-role">{w.role}</span>
								</span>
								<span className="hx-work-blurb">{w.blurb}</span>
							</a>
						))}
						<div className="hx-work-edu">
							<span>EDUCATION</span>
							<span>
								B.A.Sc. COMPUTER ENGINEERING — UNIVERSITY OF WATERLOO
							</span>
						</div>
					</div>
				</section>

				{/* ————— PRODUCTS ————— */}
				<section id="products" className="hx-section hx-reveal">
					<div className="hx-sec-head">
						<span className="hx-sec-num">02</span>
						<span className="hx-sec-title">PRODUCTS</span>
						<span className="hx-sec-note">INSTRUMENTS, NOT&nbsp;DEMOS</span>
					</div>

					<a className="hx-product" href="/ownvsrent/">
						<div className="hx-product-copy">
							<p className="hx-chip hx-chip-live">● LIVE</p>
							<h2 className="hx-product-title">
								Own <em>or</em> Rent?
							</h2>
							<p className="hx-product-desc">
								A month-by-month simulation of the true economics of
								buying a home in Ontario — amortization, land-transfer
								tax, CMHC insurance, the cost of selling, and the
								renter's compounding portfolio — on one clean,
								tweakable chart.
							</p>
							<span className="hx-product-cta">
								OPEN&nbsp;THE&nbsp;INSTRUMENT&nbsp;→
							</span>
						</div>
						<div className="hx-product-fig">
							<svg
								viewBox="0 0 340 210"
								role="img"
								aria-label="Engraved miniature of the calculator's two net-worth curves"
							>
								<defs>
									<pattern
										id="hxdots"
										width="10"
										height="10"
										patternUnits="userSpaceOnUse"
									>
										<circle cx="1" cy="1" r="0.9" fill="rgba(231,223,208,0.13)" />
									</pattern>
								</defs>
								<rect x="0" y="0" width="340" height="210" fill="url(#hxdots)" />
								<path
									d="M18 150 C 90 138, 170 112, 240 84 S 316 46, 322 42"
									fill="none"
									stroke="#E7DFD0"
									strokeWidth="1.6"
								/>
								<path
									d="M18 176 C 80 172, 140 158, 200 124 S 300 44, 322 26"
									fill="none"
									stroke="#C2A25A"
									strokeWidth="1.8"
								/>
								<circle cx="322" cy="42" r="3" fill="#E7DFD0" stroke="#0B0A08" strokeWidth="1.5" />
								<circle cx="322" cy="26" r="3" fill="#C2A25A" stroke="#0B0A08" strokeWidth="1.5" />
								<text x="300" y="20" fontSize="8" fill="#C2A25A" fontFamily="IBM Plex Mono, monospace">BUY</text>
								<text x="296" y="56" fontSize="8" fill="#9A9284" fontFamily="IBM Plex Mono, monospace">RENT</text>
							</svg>
							<div className="hx-product-figcap">
								<span>PLATE&nbsp;II&nbsp;—&nbsp;TWO&nbsp;PATHS, ONE&nbsp;POCKET</span>
								<span>FIG.&nbsp;02</span>
							</div>
						</div>
					</a>

					<p className="hx-more">FURTHER&nbsp;PLATES&nbsp;IN&nbsp;PREPARATION.</p>
				</section>

				{/* ————— CONTACT ————— */}
				<section id="contact" className="hx-section hx-reveal">
					<div className="hx-sec-head">
						<span className="hx-sec-num">03</span>
						<span className="hx-sec-title">CONTACT</span>
						<span className="hx-sec-note">REPLIES&nbsp;WITHIN&nbsp;A&nbsp;FORTNIGHT</span>
					</div>

					<h2 className="hx-contact-line">
						Say <em>hello.</em>
					</h2>
					<div className="hx-contact">
						<a href="mailto:sharan.somaskanthan@gmail.com">
							<span>EMAIL</span>
							<span>sharan.somaskanthan@gmail.com&nbsp;→</span>
						</a>
						<a href="https://github.com/sharan16" target="_blank" rel="noreferrer">
							<span>GITHUB</span>
							<span>sharan16&nbsp;→</span>
						</a>
						<a href="https://linkedin.com/in/shan-somas" target="_blank" rel="noreferrer">
							<span>LINKEDIN</span>
							<span>shan-somas&nbsp;→</span>
						</a>
					</div>
				</section>

				<footer className="hx-footer">
					<span>©&nbsp;MMXXVI&nbsp;SHAN&nbsp;SOMAS</span>
					<span>SET&nbsp;IN&nbsp;EB&nbsp;GARAMOND&nbsp;&amp;&nbsp;IBM&nbsp;PLEX&nbsp;MONO</span>
					<span>BUILT&nbsp;BY&nbsp;HAND&nbsp;—&nbsp;NYC</span>
				</footer>
			</div>
		</React.Fragment>
	);
};

export default Homepage;

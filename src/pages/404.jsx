import React, { useEffect } from "react";

import "./styles/homepage.css";

const Notfound = () => {
	useEffect(() => {
		document.title = "404 — Shan Somas";
		document.body.classList.add("hx-body");
		return () => document.body.classList.remove("hx-body");
	}, []);

	return (
		<div className="hx-root">
			<header className="hx-bar">
				<span className="hx-bar-name">SHAN&nbsp;SOMAS</span>
				<nav className="hx-bar-nav">
					<a href="/">INDEX</a>
				</nav>
			</header>
			<section className="hx-hero">
				<div className="hx-hero-copy">
					<p className="hx-eyebrow">ERROR&nbsp;404&nbsp;—&nbsp;PLATE&nbsp;MISSING</p>
					<h1 className="hx-display">
						This page was <em>never&nbsp;engraved.</em>
					</h1>
					<p className="hx-hero-sub">
						<a href="/" className="hx-product-cta">
							RETURN&nbsp;TO&nbsp;THE&nbsp;INDEX&nbsp;→
						</a>
					</p>
				</div>
			</section>
		</div>
	);
};

export default Notfound;

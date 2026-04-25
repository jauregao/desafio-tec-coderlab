import type { ReactNode } from "react";

interface PageHeroProps {
	title: string;
	description: string;
	actions?: ReactNode;
}

export function PageHero({ title, description, actions }: PageHeroProps) {
	return (
		<section className="hero-shell">
			<div>
				<h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
				<p className="hero-subtitle mt-1 text-sm">{description}</p>
			</div>

			{actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
		</section>
	);
}
interface HomeViewToggleProps {
	isActive: boolean;
	children: string;
	onClick: () => void;
}

export function HomeViewToggle({ isActive, children, onClick }: HomeViewToggleProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
				isActive
					? "border-[#812FF1] bg-[#812FF1] text-white"
					: "border-[#D9D9D9] bg-white text-[#240D49] hover:bg-[#F1E5FF]"
			}`}
		>
			{children}
		</button>
	);
}
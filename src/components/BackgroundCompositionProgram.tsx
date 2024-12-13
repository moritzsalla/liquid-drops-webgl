import { useLayoutEffect, useRef, useState } from "react";
import { colorToVec4, WebFrag } from "../lib/WebFrag";
import { LIQUID_FRAGMENT_SHADER } from "../lib/liquidShader";
import { SHADOW_FRAGMENT_SHADER } from "../lib/shadowShader";

const MODES = ["shadow", "liquids"] as const;
type Mode = (typeof MODES)[number];

const DEFAULT_VALUES = {
	noiseScale: 0.5,
	noiseSpeed: 0.5,
	noiseIntensity: 0.9,
	noiseWeightX: 0.5,
	noiseWeightY: 0.3,
	noiseWeightZ: 0.2,
	color1: "#C8A6C0", // floral
	color2: "#9A4343", // spicy
	color3: "#9A4343", // spicy
	alpha1: 1,
	alpha2: 1,
	alpha3: 1,
};

export const BackgroundCompositionProgram = () => {
	const ref = useRef<HTMLCanvasElement>(null);
	const webFragRef = useRef<WebFrag | null>(null);
	const [mode, setMode] = useState<Mode>("liquids");

	useLayoutEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;

		const resizeCanvas = () => {
			const { width, height } = canvas.getBoundingClientRect();
			canvas.width = width;
			canvas.height = height;
		};

		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		webFragRef.current = new WebFrag(canvas);
		webFragRef.current.setShader(
			mode === "shadow" ? SHADOW_FRAGMENT_SHADER : LIQUID_FRAGMENT_SHADER,
		);

		// INITIALS
		webFragRef.current.setUniform("u_noiseScale", DEFAULT_VALUES.noiseScale);
		webFragRef.current.setUniform("u_noiseSpeed", DEFAULT_VALUES.noiseSpeed);
		webFragRef.current.setUniform(
			"u_noiseIntensity",
			DEFAULT_VALUES.noiseIntensity,
		);
		webFragRef.current.setUniform("u_noiseWeights", [
			DEFAULT_VALUES.noiseWeightX,
			DEFAULT_VALUES.noiseWeightY,
			DEFAULT_VALUES.noiseWeightZ,
		]);
		webFragRef.current.setUniform(
			"u_color_0",
			colorToVec4(DEFAULT_VALUES.color1, DEFAULT_VALUES.alpha1),
		);
		webFragRef.current.setUniform(
			"u_color_1",
			colorToVec4(DEFAULT_VALUES.color2, DEFAULT_VALUES.alpha2),
		);
		webFragRef.current.setUniform(
			"u_color_2",
			colorToVec4(DEFAULT_VALUES.color3, DEFAULT_VALUES.alpha3),
		);

		webFragRef.current.init();

		return () => {
			window.removeEventListener("resize", resizeCanvas);
			webFragRef.current?.destroy();
		};
	}, [mode]);

	return (
		<>
			<canvas ref={ref} className='w-full h-full' />

			{MODES.map((m) => (
				<button
					key={m}
					className={`${
						mode === m
							? "bg-gray-900 text-white"
							: "bg-gray-300 text-black"
					}`}
					onClick={() => setMode(m as Mode)}
				>
					{m}
				</button>
			))}
		</>
	);
};

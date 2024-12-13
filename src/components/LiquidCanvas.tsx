import { useLayoutEffect, useRef } from "react";
import { motion, useMotionValueEvent, useSpring } from "framer-motion";
import { LIQUID_FRAGMENT_SHADER } from "../lib/liquidShader";
import { colorToVec4, WebFrag } from "../lib/WebFrag";
import { COLORS, SPRING_CONFIG } from "../config";
import { Controls } from "./Control";

const DEFAULT_VALUES = {
	noiseScale: 1.2, // Increased for more variation
	noiseSpeed: 0.15, // Increased for more noticeable movement
	noiseIntensity: 0.7, // Increased for stronger effect
	noiseWeightX: 0.5,
	noiseWeightY: 0.3,
	noiseWeightZ: 0.2,
	blendSoftness: 0.4,
	flowSpeed: 0.2, // Adjusted for smoother movement
	color1: COLORS.floral,
	color2: COLORS.winey,
	color3: COLORS.spicy,
};

export const LiquidCanvas = () => {
	const ref = useRef<HTMLCanvasElement>(null);
	const webFragRef = useRef<WebFrag | null>(null);

	// Motion values for smooth transitions
	const noiseScale = useSpring(DEFAULT_VALUES.noiseScale, SPRING_CONFIG);
	const noiseSpeed = useSpring(DEFAULT_VALUES.noiseSpeed, SPRING_CONFIG);
	const noiseIntensity = useSpring(
		DEFAULT_VALUES.noiseIntensity,
		SPRING_CONFIG,
	);
	const noiseWeightX = useSpring(DEFAULT_VALUES.noiseWeightX, SPRING_CONFIG);
	const noiseWeightY = useSpring(DEFAULT_VALUES.noiseWeightY, SPRING_CONFIG);
	const noiseWeightZ = useSpring(DEFAULT_VALUES.noiseWeightZ, SPRING_CONFIG);
	const blendSoftness = useSpring(DEFAULT_VALUES.blendSoftness, SPRING_CONFIG);
	const flowSpeed = useSpring(DEFAULT_VALUES.flowSpeed, SPRING_CONFIG);

	// @ts-expect-error - Motion types don't fully support string springs
	const color1 = useSpring(DEFAULT_VALUES.color1, SPRING_CONFIG);
	// @ts-expect-error - Motion types don't fully support string springs
	const color2 = useSpring(DEFAULT_VALUES.color2, SPRING_CONFIG);
	// @ts-expect-error - Motion types don't fully support string springs
	const color3 = useSpring(DEFAULT_VALUES.color3, SPRING_CONFIG);

	useMotionValueEvent(noiseScale, "change", (latest) => {
		webFragRef.current?.setUniform("u_noiseScale", latest);
	});

	useMotionValueEvent(noiseSpeed, "change", (latest) => {
		webFragRef.current?.setUniform("u_noiseSpeed", latest);
	});

	useMotionValueEvent(noiseIntensity, "change", (latest) => {
		webFragRef.current?.setUniform("u_noiseIntensity", latest);
	});

	useMotionValueEvent(blendSoftness, "change", (latest) => {
		webFragRef.current?.setUniform("u_blendSoftness", latest);
	});

	useMotionValueEvent(flowSpeed, "change", (latest) => {
		webFragRef.current?.setUniform("u_flowSpeed", latest);
	});

	// Update noise weights together
	const updateNoiseWeights = () => {
		webFragRef.current?.setUniform("u_noiseWeights", [
			noiseWeightX.get(),
			noiseWeightY.get(),
			noiseWeightZ.get(),
		]);
	};

	useMotionValueEvent(noiseWeightX, "change", updateNoiseWeights);
	useMotionValueEvent(noiseWeightY, "change", updateNoiseWeights);
	useMotionValueEvent(noiseWeightZ, "change", updateNoiseWeights);

	// Update colors
	useMotionValueEvent(color1, "change", (latest) => {
		webFragRef.current?.setUniform(
			"u_color_0",
			colorToVec4(latest.toString()),
		);
	});

	useMotionValueEvent(color2, "change", (latest) => {
		webFragRef.current?.setUniform(
			"u_color_1",
			colorToVec4(latest.toString()),
		);
	});

	useMotionValueEvent(color3, "change", (latest) => {
		webFragRef.current?.setUniform(
			"u_color_2",
			colorToVec4(latest.toString()),
		);
	});

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
		webFragRef.current.setShader(LIQUID_FRAGMENT_SHADER);

		// Initial uniforms setup
		webFragRef.current.setUniform("u_noiseScale", noiseScale.get());
		webFragRef.current.setUniform("u_noiseSpeed", noiseSpeed.get());
		webFragRef.current.setUniform("u_noiseIntensity", noiseIntensity.get());
		webFragRef.current.setUniform("u_noiseWeights", [
			noiseWeightX.get(),
			noiseWeightY.get(),
			noiseWeightZ.get(),
		]);
		webFragRef.current.setUniform("u_blendSoftness", blendSoftness.get());
		webFragRef.current.setUniform("u_flowSpeed", flowSpeed.get());
		// @ts-expect-error -- it's possible but motion says no
		webFragRef.current.setUniform("u_color_0", colorToVec4(color1.get()));
		// @ts-expect-error -- it's possible but motion says no
		webFragRef.current.setUniform("u_color_1", colorToVec4(color2.get()));
		// @ts-expect-error -- it's possible but motion says no
		webFragRef.current.setUniform("u_color_2", colorToVec4(color3.get()));

		webFragRef.current.init();

		return () => {
			window.removeEventListener("resize", resizeCanvas);
			webFragRef.current?.destroy();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<motion.canvas ref={ref} className='w-full h-full fixed fadeIn' />
			<Controls
				// @ts-expect-error -- motion better than it's types
				color1={color1}
				// @ts-expect-error -- motion better than it's types
				color2={color2}
				// @ts-expect-error -- motion better than it's types
				color3={color3}
				noiseScale={noiseScale}
				noiseIntensity={noiseIntensity}
				noiseWeightX={noiseWeightX}
				noiseWeightY={noiseWeightY}
				noiseWeightZ={noiseWeightZ}
				blendSoftness={blendSoftness}
				flowSpeed={flowSpeed}
			/>
		</>
	);
};

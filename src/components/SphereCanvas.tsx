import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
	motion,
	useMotionValueEvent,
	useSpring,
	useWillChange,
} from "framer-motion";
import { colorToVec4, WebFrag } from "../lib/WebFrag";
import { LIQUID_FRAGMENT_SHADER } from "../lib/liquidShader";
import { COLORS, SPRING_CONFIG } from "../config";
import { useDropShadow } from "../hooks/useDropShadow";
import { useReflectionRotation } from "../hooks/useReflectionsRotation";
import { Controls } from "./Control";

const DEFAULT_VALUES = {
	noiseScale: 1.2, // Increased for more variation
	noiseIntensity: 0.7, // Increased for stronger effect
	noiseWeightX: 0.5,
	noiseWeightY: 0.3,
	noiseWeightZ: 0.2,
	blendSoftness: 0.4,
	flowSpeed: 0.5, // Adjusted for smoother movement
	color1: COLORS.floral,
	color2: COLORS.winey,
	color3: COLORS.spicy,
};

export const SphereCanvas = () => {
	const ref = useRef<HTMLCanvasElement>(null);
	const webFragRef = useRef<WebFrag | null>(null);

	const [showReflections, setShowReflections] = useState(true);
	const [showShadows, setShowShadows] = useState(true);
	const [showMask, setShowMask] = useState(true);

	// Motion values
	const noiseScale = useSpring(DEFAULT_VALUES.noiseScale, SPRING_CONFIG);
	const noiseIntensity = useSpring(
		DEFAULT_VALUES.noiseIntensity,
		SPRING_CONFIG,
	);
	const noiseWeightX = useSpring(DEFAULT_VALUES.noiseWeightX, SPRING_CONFIG);
	const noiseWeightY = useSpring(DEFAULT_VALUES.noiseWeightY, SPRING_CONFIG);
	const noiseWeightZ = useSpring(DEFAULT_VALUES.noiseWeightZ, SPRING_CONFIG);
	const blendSoftness = useSpring(DEFAULT_VALUES.blendSoftness, SPRING_CONFIG);
	const flowSpeed = useSpring(DEFAULT_VALUES.flowSpeed, SPRING_CONFIG);
	const maskSoftness = useSpring(0.5, SPRING_CONFIG);
	// @ts-expect-error -- it's possible but motion says no
	const color1 = useSpring(DEFAULT_VALUES.color1, SPRING_CONFIG);
	// @ts-expect-error -- it's possible but motion says no
	const color2 = useSpring(DEFAULT_VALUES.color2, SPRING_CONFIG);
	// @ts-expect-error -- it's possible but motion says no
	const color3 = useSpring(DEFAULT_VALUES.color3, SPRING_CONFIG);
	const alpha1 = useSpring(1, SPRING_CONFIG);
	const alpha2 = useSpring(1, SPRING_CONFIG);
	const alpha3 = useSpring(1, SPRING_CONFIG);

	// Setup canvas and WebFrag instance
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

		// Initial uniform setup
		webFragRef.current.setUniform("u_blendSoftness", blendSoftness.get());
		webFragRef.current.setUniform("u_flowSpeed", flowSpeed.get());
		webFragRef.current.setUniform("u_noiseScale", noiseScale.get());
		webFragRef.current.setUniform("u_noiseIntensity", noiseIntensity.get());
		webFragRef.current.setUniform("u_noiseWeights", [
			noiseWeightX.get(),
			noiseWeightY.get(),
			noiseWeightZ.get(),
		]);
		webFragRef.current.setUniform(
			"u_color_0",
			// @ts-expect-error -- it's possible but motion says no
			colorToVec4(color1.get(), alpha1.get()),
		);
		webFragRef.current.setUniform(
			"u_color_1",
			// @ts-expect-error -- it's possible but motion says no
			colorToVec4(color2.get(), alpha2.get()),
		);
		webFragRef.current.setUniform(
			"u_color_2",
			// @ts-expect-error -- it's possible but motion says no
			colorToVec4(color3.get(), alpha3.get()),
		);

		webFragRef.current.init();
		return () => {
			window.removeEventListener("resize", resizeCanvas);
			webFragRef.current?.destroy();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useMotionValueEvent(noiseScale, "change", (latest) => {
		webFragRef.current?.setUniform("u_noiseScale", latest);
	});
	useMotionValueEvent(noiseIntensity, "change", (latest) => {
		webFragRef.current?.setUniform("u_noiseIntensity", latest);
	});
	useMotionValueEvent(flowSpeed, "change", (latest) => {
		webFragRef.current?.setUniform("u_flowSpeed", latest);
	});
	useMotionValueEvent(blendSoftness, "change", (latest) => {
		webFragRef.current?.setUniform("u_blendSoftness", latest);
	});

	const updateNoiseWeights = useCallback(() => {
		webFragRef.current?.setUniform("u_noiseWeights", [
			noiseWeightX.get(),
			noiseWeightY.get(),
			noiseWeightZ.get(),
		]);
	}, [noiseWeightX, noiseWeightY, noiseWeightZ]);

	useMotionValueEvent(noiseWeightX, "change", updateNoiseWeights);
	useMotionValueEvent(noiseWeightY, "change", updateNoiseWeights);
	useMotionValueEvent(noiseWeightZ, "change", updateNoiseWeights);

	const handleColorChange = (color: any, alpha: any, index: number) => {
		webFragRef.current?.setUniform(
			`u_color_${index}`,
			colorToVec4(color, alpha),
		);
	};

	useMotionValueEvent(color1, "change", (val) =>
		handleColorChange(val, alpha1.get(), 0),
	);
	useMotionValueEvent(color2, "change", (val) =>
		handleColorChange(val, alpha2.get(), 1),
	);
	useMotionValueEvent(color3, "change", (val) =>
		handleColorChange(val, alpha2.get(), 2),
	);
	useMotionValueEvent(alpha1, "change", (val) =>
		handleColorChange(color1.get(), val, 0),
	);
	useMotionValueEvent(alpha2, "change", (val) =>
		handleColorChange(color2.get(), val, 1),
	);
	useMotionValueEvent(alpha3, "change", (val) =>
		handleColorChange(color3.get(), val, 2),
	);

	const willChange = useWillChange();
	const dropShadow = useDropShadow();
	const reflectionRotation = useReflectionRotation();

	return (
		<div className='wrapper'>
			<motion.div
				className='canvasContainer bounceIn'
				style={{
					filter: showShadows ? dropShadow : "none",
					willChange,
				}}
			>
				<div className='canvasMask' data-hide-mask={!showMask}>
					<motion.canvas ref={ref} className='canvas' />
					{showMask && showReflections && (
						<motion.div
							className='reflections'
							style={{
								rotate: reflectionRotation,
							}}
						/>
					)}
					{showMask && showShadows && (
						<motion.div className='inner-shadows' />
					)}
				</div>
			</motion.div>

			<Controls
				// @ts-expect-error -- motion better than it's types
				color1={color1}
				// @ts-expect-error -- motion better than it's types
				color2={color2}
				// @ts-expect-error -- motion better than it's types
				color3={color3}
				alpha1={alpha1}
				alpha2={alpha2}
				alpha3={alpha3}
				noiseScale={noiseScale}
				noiseIntensity={noiseIntensity}
				noiseWeightX={noiseWeightX}
				noiseWeightY={noiseWeightY}
				noiseWeightZ={noiseWeightZ}
				showReflections={showReflections}
				blendSoftness={blendSoftness}
				setShowReflections={setShowReflections}
				showShadows={showShadows}
				setShowShadows={setShowShadows}
				showMask={showMask}
				setShowMask={setShowMask}
				flowSpeed={flowSpeed}
			/>
		</div>
	);
};

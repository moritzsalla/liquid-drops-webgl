import { useEffect, useRef } from "react";
import {
	motion,
	useMotionTemplate,
	useMotionValueEvent,
	useSpring,
	useWillChange,
	type SpringOptions,
} from "framer-motion";
import { colorToVec4, WebFrag } from "./lib/WebFrag";
import { FRAGMENT_SHADER } from "./lib/shaders";
import { COLORS } from "./colors";
import { useDropShadow } from "./useDropShadow";
import { Controls } from "./Control";

const SPRING_CONFIG: SpringOptions = {
	bounce: 0,
	mass: 2,
	damping: 30,
};

// TODO optimize blur by using shader pass instead of CSS filter
export const Canvas = () => {
	const ref = useRef<HTMLCanvasElement>(null);
	const webFragRef = useRef<WebFrag | null>(null);

	// Motion values
	const noiseScale = useSpring(0.5, SPRING_CONFIG);
	const noiseSpeed = useSpring(0.5, SPRING_CONFIG);
	const noiseIntensity = useSpring(0.7, SPRING_CONFIG);
	const noiseWeightX = useSpring(0.5, SPRING_CONFIG);
	const noiseWeightY = useSpring(0.3, SPRING_CONFIG);
	const noiseWeightZ = useSpring(0.2, SPRING_CONFIG);
	const blur = useSpring(14, SPRING_CONFIG);
	// @ts-expect-error -- it's possible but motion says no
	const color1 = useSpring(COLORS.floral, SPRING_CONFIG);
	// @ts-expect-error -- it's possible but motion says no
	const color2 = useSpring(COLORS.spicy, SPRING_CONFIG);
	// @ts-expect-error -- it's possible but motion says no
	const color3 = useSpring(COLORS.spicy, SPRING_CONFIG);
	const alpha1 = useSpring(1, SPRING_CONFIG);
	const alpha2 = useSpring(1, SPRING_CONFIG);
	const alpha3 = useSpring(1, SPRING_CONFIG);

	// Setup canvas and WebFrag instance
	useEffect(() => {
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
		webFragRef.current.setShader(FRAGMENT_SHADER);

		// Initial uniform setup
		webFragRef.current.setUniform("u_noiseScale", noiseScale.get());
		webFragRef.current.setUniform("u_noiseSpeed", noiseSpeed.get());
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
	useMotionValueEvent(noiseSpeed, "change", (latest) => {
		webFragRef.current?.setUniform("u_noiseSpeed", latest);
	});
	useMotionValueEvent(noiseIntensity, "change", (latest) => {
		webFragRef.current?.setUniform("u_noiseIntensity", latest);
	});

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

	return (
		<div className='wrapper'>
			<motion.div
				className='canvasContainerOuter'
				style={{ filter: dropShadow, willChange }}
			>
				<div className='canvasContainer'>
					<motion.canvas
						ref={ref}
						className='canvas'
						style={{
							willChange,
							filter: useMotionTemplate`blur(${blur}px)`,
						}}
					/>
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
				noiseSpeed={noiseSpeed}
				noiseIntensity={noiseIntensity}
				noiseWeightX={noiseWeightX}
				noiseWeightY={noiseWeightY}
				noiseWeightZ={noiseWeightZ}
				blur={blur}
			/>
		</div>
	);
};

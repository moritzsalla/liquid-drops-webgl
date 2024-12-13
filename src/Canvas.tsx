import { useEffect, useRef } from "react";
import {
	motion,
	useMotionTemplate,
	useMotionValueEvent,
	useSpring,
	type SpringOptions,
} from "framer-motion";
import { colorToVec4, WebFrag } from "./lib/WebFrag";
import { FRAGMENT_SHADER } from "./lib/shaders";
import { COLORS } from "./colors";

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
	const noiseScale = useSpring(1.0, SPRING_CONFIG);
	const noiseSpeed = useSpring(0.2, SPRING_CONFIG);
	const noiseIntensity = useSpring(0.7, SPRING_CONFIG);
	const noiseWeightX = useSpring(0.5, SPRING_CONFIG);
	const noiseWeightY = useSpring(0.3, SPRING_CONFIG);
	const noiseWeightZ = useSpring(0.2, SPRING_CONFIG);
	const blur = useSpring(4, SPRING_CONFIG);
	// @ts-expect-error -- it's possible but motion says no
	const color1 = useSpring(COLORS.fruity, SPRING_CONFIG);
	// @ts-expect-error -- it's possible but motion says no
	const color2 = useSpring(COLORS.grassy, SPRING_CONFIG);
	// @ts-expect-error -- it's possible but motion says no
	const color3 = useSpring(COLORS.nutty, SPRING_CONFIG);
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
			colorToVec4(color1.get(), alpha1.get()),
		);
		webFragRef.current.setUniform(
			"u_color_1",
			colorToVec4(color2.get(), alpha2.get()),
		);
		webFragRef.current.setUniform(
			"u_color_2",
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

	return (
		<div className='wrapper'>
			<div className='inner'>
				<motion.canvas
					ref={ref}
					style={{ filter: useMotionTemplate`blur(${blur}px)` }}
				/>
			</div>

			<div className='controls'>
				<div>
					<div>
						<label>Taste 1</label>
						{Object.entries(COLORS).map(([name, color]) => (
							<button
								key={name}
								style={{ backgroundColor: color }}
								onClick={() => {
									// @ts-expect-error -- it's possible but motion says no
									color1.set(color);
								}}
							>
								{name}
							</button>
						))}
					</div>
					<div>
						<label>Taste 2</label>
						{Object.entries(COLORS).map(([name, color]) => (
							<button
								key={name}
								style={{ backgroundColor: color }}
								onClick={() => {
									// @ts-expect-error -- it's possible but motion says no
									color2.set(color);
								}}
							>
								{name}
							</button>
						))}
					</div>
					<div>
						<label>Taste 3</label>
						{Object.entries(COLORS).map(([name, color]) => (
							<button
								key={name}
								style={{ backgroundColor: color }}
								onClick={() => {
									// @ts-expect-error -- it's possible but motion says no
									color3.set(color);
								}}
							>
								{name}
							</button>
						))}
					</div>
				</div>

				<div>
					<div>
						<label>Opacity 1</label>
						<input
							type='range'
							min='0'
							max='1'
							step='0.1'
							defaultValue={alpha1.get()}
							onChange={(e) => alpha1.set(parseFloat(e.target.value))}
						/>
					</div>
					<div>
						<label>Opacity 2</label>
						<input
							type='range'
							min='0'
							max='1'
							step='0.1'
							defaultValue={alpha2.get()}
							onChange={(e) => alpha2.set(parseFloat(e.target.value))}
						/>
					</div>
					<div>
						<label>Opacity 3</label>
						<input
							type='range'
							min='0'
							max='1'
							step='0.1'
							defaultValue={alpha3.get()}
							onChange={(e) => alpha3.set(parseFloat(e.target.value))}
						/>
					</div>
				</div>

				<div>
					<div>
						<label>Noise Scale</label>
						<input
							type='range'
							min='0'
							max='2'
							step='0.1'
							defaultValue={noiseScale.get()}
							onChange={(e) =>
								noiseScale.set(parseFloat(e.target.value))
							}
						/>
					</div>
					<div>
						<label>Noise Speed</label>
						<input
							type='range'
							min='0'
							max='1'
							step='0.1'
							defaultValue={noiseSpeed.get()}
							onChange={(e) =>
								noiseSpeed.set(parseFloat(e.target.value))
							}
						/>
					</div>
					<div>
						<label>Noise Intensity</label>
						<input
							type='range'
							min='0'
							max='1'
							step='0.1'
							defaultValue={noiseIntensity.get()}
							onChange={(e) =>
								noiseIntensity.set(parseFloat(e.target.value))
							}
						/>
					</div>
				</div>

				<div>
					<div>
						<label>Noise Weight X</label>
						<input
							type='range'
							min='0'
							max='1'
							step='0.1'
							defaultValue={noiseWeightX.get()}
							onChange={(e) =>
								noiseWeightX.set(parseFloat(e.target.value))
							}
						/>
					</div>
					<div>
						<label>Noise Weight Y</label>
						<input
							type='range'
							min='0'
							max='1'
							step='0.1'
							defaultValue={noiseWeightY.get()}
							onChange={(e) =>
								noiseWeightY.set(parseFloat(e.target.value))
							}
						/>
					</div>
					<div>
						<label>Noise Weight Z</label>
						<input
							type='range'
							min='0'
							max='1'
							step='0.1'
							defaultValue={noiseWeightZ.get()}
							onChange={(e) =>
								noiseWeightZ.set(parseFloat(e.target.value))
							}
						/>
					</div>
				</div>

				<div>
					<div>
						<label>Blur</label>
						<input
							type='range'
							min='0'
							max='50'
							step='1'
							defaultValue={blur.get()}
							onChange={(e) => blur.set(parseFloat(e.target.value))}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

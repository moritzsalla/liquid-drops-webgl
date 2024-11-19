import { useEffect, useRef, useState } from "react";
import { colorToVec4, WebFrag } from "./lib/WebFrag";
import { FRAGMENT_SHADER } from "./lib/shaders";

export const Canvas = () => {
	const ref = useRef<HTMLCanvasElement>(null);
	const [colors, setColors] = useState(["#89537A", "#9A4343", "#F4AE47"]);
	const [alphas, setAlphas] = useState([0, 1, 1]);
	const [blur, setBlur] = useState(4);
	const [backgroundColor, setBackgroundColor] = useState("#89537A");
	const [hasBackgroundImage, setHasBackgroundImage] = useState(false);

	const [noiseScale, setNoiseScale] = useState(1.0);
	const [noiseSpeed, setNoiseSpeed] = useState(0.2);
	const [noiseIntensity, setNoiseIntensity] = useState(0.7);
	const [noiseWeights, setNoiseWeights] = useState({ x: 0.5, y: 0.3, z: 0.2 });

	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;

		// Set canvas size to match display size
		const resizeCanvas = () => {
			const { width, height } = canvas.getBoundingClientRect();
			canvas.width = width;
			canvas.height = height;
		};

		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		const webFrag = new WebFrag(canvas);
		webFrag.setShader(FRAGMENT_SHADER);

		// Add all colors to the fragment shader
		for (let i = 0; i < colors.length; i++) {
			const color = colors[i];
			webFrag.setUniform(`u_color_${i}`, colorToVec4(color, alphas[i]));
		}

		webFrag.setUniform("u_noiseScale", noiseScale);
		webFrag.setUniform("u_noiseSpeed", noiseSpeed);
		webFrag.setUniform("u_noiseIntensity", noiseIntensity);
		webFrag.setUniform("u_noiseWeights", [
			noiseWeights.x,
			noiseWeights.y,
			noiseWeights.z,
		]);

		webFrag.init();

		return () => {
			window.removeEventListener("resize", resizeCanvas);
			webFrag.destroy();
		};
	}, [
		colors,
		alphas,
		noiseScale,
		noiseSpeed,
		noiseIntensity,
		noiseWeights.x,
		noiseWeights.y,
		noiseWeights.z,
	]);

	const backgroundImage = hasBackgroundImage
		? "url('https://media.cntraveler.com/photos/5eb18e42fc043ed5d9779733/16:9/w_4288,h_2412,c_limit/BlackForest-Germany-GettyImages-147180370.jpg')"
		: "none";

	return (
		<div
			className='wrapper'
			style={{
				backgroundImage,
				backgroundColor,
			}}
		>
			<div className='inner'>
				<canvas ref={ref} style={{ filter: `blur(${blur}px)` }} />
			</div>

			<div className='controls'>
				<div>
					{colors.map((color, i) => {
						return (
							<div key={i + color}>
								<label>Color {i + 1}</label>
								<input
									type='color'
									value={color}
									onChange={(e) => {
										const newColors = [...colors];
										newColors[i] = e.target.value;
										setColors(newColors);
									}}
								/>
							</div>
						);
					})}
				</div>

				<div>
					<div>
						<label>Background Image</label>
						<input
							type='checkbox'
							checked={hasBackgroundImage}
							onChange={(e) => setHasBackgroundImage(e.target.checked)}
						/>
					</div>
					<div>
						<label>Background Color</label>
						<input
							type='color'
							value={backgroundColor}
							onChange={(e) => setBackgroundColor(e.target.value)}
						/>
					</div>
				</div>

				<div>
					{alphas.map((alpha, i) => {
						return (
							<div key={i + alpha}>
								<label>Alpha {i + 1}</label>
								<input
									type='range'
									min='0'
									max='1'
									step='0.1'
									value={alpha}
									onChange={(e) => {
										const newAlphas = [...alphas];
										newAlphas[i] = parseFloat(e.target.value);
										setAlphas(newAlphas);
									}}
								/>
							</div>
						);
					})}
				</div>

				<div>
					<div>
						<label>Blur</label>
						<input
							type='range'
							min='0'
							max='50'
							step='1'
							value={blur}
							onChange={(e) => setBlur(parseFloat(e.target.value))}
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
							value={noiseScale}
							onChange={(e) => setNoiseScale(parseFloat(e.target.value))}
						/>
					</div>
					<div>
						<label>Noise Speed</label>
						<input
							type='range'
							min='0'
							max='1'
							step='0.1'
							value={noiseSpeed}
							onChange={(e) => setNoiseSpeed(parseFloat(e.target.value))}
						/>
					</div>
					<div>
						<label>Noise Intensity</label>
						<input
							type='range'
							min='0'
							max='1'
							step='0.1'
							value={noiseIntensity}
							onChange={(e) =>
								setNoiseIntensity(parseFloat(e.target.value))
							}
						/>
					</div>
					<div>
						<label>Noise Weights</label>
						<input
							type='range'
							min='0'
							max='1'
							step='0.1'
							value={noiseWeights.x}
							onChange={(e) =>
								setNoiseWeights({
									...noiseWeights,
									x: parseFloat(e.target.value),
								})
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

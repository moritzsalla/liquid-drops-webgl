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

		webFrag.init();

		return () => {
			window.removeEventListener("resize", resizeCanvas);
			webFrag.destroy();
		};
	}, [colors, alphas]);

	return (
		<div
			id='wrapper'
			style={{
				backgroundImage: hasBackgroundImage
					? "url('https://media.cntraveler.com/photos/5eb18e42fc043ed5d9779733/16:9/w_4288,h_2412,c_limit/BlackForest-Germany-GettyImages-147180370.jpg')"
					: "none",
				backgroundSize: "cover",
				backgroundColor,
			}}
		>
			<div
				style={{
					width: "20rem",
					height: "20rem",
					borderRadius: "50%",
					margin: "5rem",
					overflow: "hidden",
				}}
			>
				<canvas
					ref={ref}
					style={{
						width: "100%",
						height: "100%",
						filter: `blur(${blur}px)`,
					}}
				/>
			</div>

			<div
				id='controls'
				style={{
					background: "white",
					padding: "1rem",
					display: "flex",
					gap: "5rem",
				}}
			>
				<div>
					{colors.map((color, i) => {
						return (
							<div key={i + color}>
								<label style={{ paddingRight: "1rem" }}>
									Color {i + 1}
								</label>
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
						<label style={{ paddingRight: "1rem" }}>
							Background Image
						</label>
						<input
							type='checkbox'
							checked={hasBackgroundImage}
							onChange={(e) => setHasBackgroundImage(e.target.checked)}
						/>
					</div>
					<div>
						<label style={{ paddingRight: "1rem" }}>
							Background Color
						</label>
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
								<label style={{ paddingRight: "1rem" }}>
									Alpha {i + 1}
								</label>
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
					<label style={{ paddingRight: "1rem" }}>Blur</label>
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
		</div>
	);
};

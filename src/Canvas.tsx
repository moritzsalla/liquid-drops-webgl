import { useEffect, useRef, useState } from "react";
import { colorToVec4, WebFrag } from "./lib/WebFrag";

const FRAGMENT_SHADER = `#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_color_0;
uniform vec4 u_color_1;
uniform vec4 u_color_2;

// Noise function for organic movement
vec2 random2(vec2 st) {
    st = vec2(dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)));
    return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(dot(random2(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                   dot(random2(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
               mix(dot(random2(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                   dot(random2(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    
    // Create organic flowing movement
    float t = u_time * 0.2;
    float n1 = noise(uv * 3.0 + t);
    float n2 = noise(uv * 2.0 - t * 0.5);
    float n3 = noise(uv * 4.0 + t * 0.3);
    
    // Combine noise layers for more organic look
    float combined = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    combined = combined * 0.7 + 0.3;
    
    // Smooth step for more defined color regions
    float blend = smoothstep(0.3, 0.7, combined);
    
    // Add distance-based alpha
    vec2 center = vec2(0.5, 0.5);
    float dist = length(uv - center);
    
    // Mix colors based on noise
    vec4 color;
    if (blend < 0.33) {
        color = mix(u_color_0, u_color_1, smoothstep(0.0, 0.33, blend) * 3.0);
    } else if (blend < 0.66) {
        color = mix(u_color_1, u_color_2, smoothstep(0.33, 0.66, blend) * 3.0 - 1.0);
    } else {
        color = mix(u_color_2, u_color_0, smoothstep(0.66, 1.0, blend) * 3.0 - 2.0);
    }
    
    gl_FragColor = color;
}`;

export const Canvas = () => {
	const ref = useRef<HTMLCanvasElement>(null);
	const [colors, setColors] = useState(["#61210F", "#CE8147", "#E5F2C9"]);
	const [alpha, setAlpha] = useState(1);
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
			webFrag.setUniform(`u_color_${i}`, colorToVec4(color, alpha));
		}

		webFrag.setUniform("u_resolution", [canvas.width, canvas.height]);
		webFrag.render();

		return () => {
			window.removeEventListener("resize", resizeCanvas);
			webFrag.destroy();
		};
	}, [colors, alpha]);

	return (
		<div
			style={{
				backgroundImage: hasBackgroundImage
					? "url('https://media.cntraveler.com/photos/5eb18e42fc043ed5d9779733/16:9/w_4288,h_2412,c_limit/BlackForest-Germany-GettyImages-147180370.jpg')"
					: "none",
				backgroundSize: "cover",
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
					}}
				/>
			</div>

			<div style={{ background: "white", padding: "1rem" }}>
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

				<div>
					<label style={{ paddingRight: "1rem" }}>Background Image</label>
					<input
						type='checkbox'
						checked={hasBackgroundImage}
						onChange={(e) => setHasBackgroundImage(e.target.checked)}
					/>
				</div>

				<div>
					<label style={{ paddingRight: "1rem" }}>Alpha</label>
					<input
						type='range'
						min='0'
						max='1'
						step='0.01'
						value={alpha}
						onChange={(e) => setAlpha(parseFloat(e.target.value))}
					/>
				</div>
			</div>
		</div>
	);
};

import { useEffect, useRef } from "react";
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
    combined = combined * 0.7 + 0.3; // Adjust contrast
    
    // Smooth step for more defined color regions
    float blend = smoothstep(0.3, 0.7, combined);
    
    // Mix colors based on noise
    vec4 color;
    if (blend < 0.33) {
        color = mix(u_color_0, u_color_1, smoothstep(0.0, 0.33, blend) * 3.0);
    } else if (blend < 0.56) {
        color = mix(u_color_1, u_color_2, smoothstep(0.33, 0.66, blend) * 3.0 - 1.0);
    } else {
        color = mix(u_color_2, u_color_0, smoothstep(0.66, 1.0, blend) * 3.0 - 2.0);
    }

    gl_FragColor = color;
}`;

const COLORS = ["#0000FF", "#FFFF00", "#00FFFF"];

export const Canvas = () => {
	const ref = useRef<HTMLCanvasElement>(null);

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
		for (let i = 0; i < COLORS.length; i++) {
			const color = COLORS[i];
			webFrag.setUniform(`u_color_${i}`, colorToVec4(color));
		}

		webFrag.setUniform("u_resolution", [canvas.width, canvas.height]);
		webFrag.render();

		return () => {
			window.removeEventListener("resize", resizeCanvas);
			webFrag.destroy();
		};
	}, []);

	return (
		<canvas
			ref={ref}
			style={{
				width: "100%",
				height: "100%",
			}}
		/>
	);
};

export class WebFrag {
	private gl: WebGLRenderingContext;
	private program: WebGLProgram | null = null;
	private uniforms = new Map();
	private vertexShader: WebGLShader;
	private frameId: number | null = null;

	constructor(private canvas: HTMLCanvasElement) {
		const gl = canvas.getContext("webgl", {
			alpha: true,
			premultipliedAlpha: false,
		});
		if (!gl) throw new Error("WebGL not supported");
		this.gl = gl;

		// Enable blending
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

		// Setup viewport
		this.gl.viewport(0, 0, canvas.width, canvas.height);

		// Create basic vertex shader (shared for all fragment shaders)
		const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
		if (!vertexShader) throw new Error("Failed to create vertex shader");

		this.gl.shaderSource(
			vertexShader,
			`
       attribute vec2 position;
       void main() {
         gl_Position = vec4(position, 0.0, 1.0);
       }
     `,
		);
		this.gl.compileShader(vertexShader);

		// Create and bind quad
		const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
		const buffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

		this.vertexShader = vertexShader;
	}

	setShader(source: string) {
		const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		if (!fragmentShader) throw new Error("Failed to create fragment shader");

		this.gl.shaderSource(fragmentShader, source);
		this.gl.compileShader(fragmentShader);

		if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
			const info = this.gl.getShaderInfoLog(fragmentShader);
			throw new Error("Shader compilation error: " + info);
		}

		// Create program
		const program = this.gl.createProgram();
		if (!program) throw new Error("Failed to create program");

		this.program = program;
		this.gl.attachShader(program, this.vertexShader);
		this.gl.attachShader(program, fragmentShader);
		this.gl.linkProgram(program);

		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			const info = this.gl.getProgramInfoLog(program);
			throw new Error("Program link error: " + info);
		}

		this.gl.useProgram(program);

		// Setup position attribute
		const position = this.gl.getAttribLocation(program, "position");
		this.gl.enableVertexAttribArray(position);
		this.gl.vertexAttribPointer(position, 2, this.gl.FLOAT, false, 0, 0);

		// Cleanup fragment shader
		this.gl.deleteShader(fragmentShader);
	}

	setUniform(name: string, value: number | number[]) {
		if (!this.program) return;

		let location = this.uniforms.get(name);
		if (!location) {
			location = this.gl.getUniformLocation(this.program, name);
			this.uniforms.set(name, location);
		}

		if (typeof value === "number") {
			this.gl.uniform1f(location, value);
		} else if (value.length === 2) {
			this.gl.uniform2fv(location, value);
		} else if (value.length === 3) {
			this.gl.uniform3fv(location, value);
		} else if (value.length === 4) {
			this.gl.uniform4fv(location, value);
		}
	}

	render = (time = 0) => {
		this.setUniform("u_time", time * 0.001);
		this.setUniform("u_resolution", [this.canvas.width, this.canvas.height]);
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
		this.frameId = requestAnimationFrame(this.render);
	};

	debug() {
		return {
			program: this.program,
			uniforms: this.uniforms.values(),
			shader: this.gl.getShaderSource(this.vertexShader),
		};
	}

	destroy() {
		if (this.frameId) cancelAnimationFrame(this.frameId);
		if (this.program) {
			this.gl.deleteProgram(this.program);
			this.program = null;
		}
		this.gl.deleteShader(this.vertexShader);
		this.uniforms.clear();
	}
}

export const colorToVec4 = (color: string, alpha = 1) => {
	const hex = parseInt(color.slice(1), 16);
	const r = (hex >> 16) / 255;
	const g = ((hex >> 8) & 0xff) / 255;
	const b = (hex & 0xff) / 255;
	return [r, g, b, alpha];
};

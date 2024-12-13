import { useEffect, useRef } from "react";
import { useSpring } from "framer-motion";
import { WebFrag } from "../lib/WebFrag";
import { CONE_FRAGMENT_SHADER } from "../lib/coneShader";
import { SPRING_CONFIG } from "../config";

export const ConeCanvas = () => {
	const ref = useRef<HTMLCanvasElement>(null);
	const webFragRef = useRef<WebFrag | null>(null);

	// Controls
	const shadowIntensity = useSpring(0.5, SPRING_CONFIG);
	const shadowSoftness = useSpring(1, SPRING_CONFIG);
	const coneShape = useSpring(1, SPRING_CONFIG);
	const colorBlend = useSpring(0.5, SPRING_CONFIG);

	// Mouse tracking for light position
	const mouseX = useSpring(0, SPRING_CONFIG);
	const mouseY = useSpring(0, SPRING_CONFIG);

	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;

		const handleResize = () => {
			const { width, height } = canvas.getBoundingClientRect();
			canvas.width = width;
			canvas.height = height;
		};

		handleResize();
		window.addEventListener("resize", handleResize);

		// Initialize WebFrag
		webFragRef.current = new WebFrag(canvas);
		webFragRef.current.setShader(CONE_FRAGMENT_SHADER);

		// Set initial uniforms
		webFragRef.current.setUniform("u_shadowIntensity", shadowIntensity.get());
		webFragRef.current.setUniform("u_shadowSoftness", shadowSoftness.get());
		webFragRef.current.setUniform("u_coneShape", coneShape.get());
		webFragRef.current.setUniform("u_colorBlend", colorBlend.get());
		webFragRef.current.setUniform("u_lightPosition", [0, 0]);
		webFragRef.current.setUniform("u_color1", [0, 0, 0, 0.8]);
		webFragRef.current.setUniform("u_color2", [0.1, 0.1, 0.1, 0.4]);

		webFragRef.current.init();

		const handleMouseMove = (e: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
			const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
			mouseX.set(x);
			mouseY.set(y);
		};

		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("mousemove", handleMouseMove);
			webFragRef.current?.destroy();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!webFragRef.current) return;

		// Update uniforms when controls change
		const updateUniforms = () => {
			webFragRef.current?.setUniform(
				"u_shadowIntensity",
				shadowIntensity.get(),
			);
			webFragRef.current?.setUniform(
				"u_shadowSoftness",
				shadowSoftness.get(),
			);
			webFragRef.current?.setUniform("u_coneShape", coneShape.get());
			webFragRef.current?.setUniform("u_colorBlend", colorBlend.get());
			webFragRef.current?.setUniform("u_lightPosition", [
				mouseX.get(),
				mouseY.get(),
			]);
		};

		const interval = setInterval(updateUniforms, 1000 / 60);
		return () => clearInterval(interval);
	}, [shadowIntensity, shadowSoftness, coneShape, colorBlend, mouseX, mouseY]);

	return (
		<div className='fixed inset-0 w-full h-full'>
			<canvas ref={ref} className='w-full h-full cursor-none' />

			{/* Controls */}
			<div className='fixed bottom-0 left-0 p-4 flex gap-4'>
				<div className='flex flex-col gap-2'>
					<label className='text-sm text-white opacity-50'>
						Shadow Intensity
					</label>
					<input
						type='range'
						min='0'
						max='1'
						step='0.01'
						defaultValue={shadowIntensity.get()}
						onChange={(e) =>
							shadowIntensity.set(parseFloat(e.target.value))
						}
						className='w-32'
					/>
				</div>

				<div className='flex flex-col gap-2'>
					<label className='text-sm text-white opacity-50'>
						Shadow Softness
					</label>
					<input
						type='range'
						min='0'
						max='1'
						step='0.01'
						defaultValue={shadowSoftness.get()}
						onChange={(e) =>
							shadowSoftness.set(parseFloat(e.target.value))
						}
						className='w-32'
					/>
				</div>

				<div className='flex flex-col gap-2'>
					<label className='text-sm text-white opacity-50'>
						Cone Shape
					</label>
					<input
						type='range'
						min='0'
						max='1'
						step='0.01'
						defaultValue={coneShape.get()}
						onChange={(e) => coneShape.set(parseFloat(e.target.value))}
						className='w-32'
					/>
				</div>

				<div className='flex flex-col gap-2'>
					<label className='text-sm text-white opacity-50'>
						Color Blend
					</label>
					<input
						type='range'
						min='0'
						max='1'
						step='0.01'
						defaultValue={colorBlend.get()}
						onChange={(e) => colorBlend.set(parseFloat(e.target.value))}
						className='w-32'
					/>
				</div>
			</div>
		</div>
	);
};

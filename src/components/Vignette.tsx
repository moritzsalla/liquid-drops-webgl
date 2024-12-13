import React, { useEffect } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import { COLORS } from "../config";

const SPRING_CONFIG = {
	bounce: 0,
	mass: 1.2,
	damping: 20,
};

export const Vignette = () => {
	// Motion values for colors and opacity
	// @ts-expect-error -- motion better than it's types
	const color1 = useSpring(COLORS.cereal, SPRING_CONFIG);
	// @ts-expect-error -- motion better than it's types
	const color2 = useSpring(COLORS.woody, SPRING_CONFIG);
	const opacity = useSpring(0.5, SPRING_CONFIG);

	// Mouse tracking
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			const centerX = window.innerWidth / 2;
			const centerY = window.innerHeight / 2;
			const relativeX = (e.clientX - centerX) / (window.innerWidth / 2);
			const relativeY = (e.clientY - centerY) / (window.innerHeight / 2);
			mouseX.set(relativeX);
			mouseY.set(relativeY);
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, [mouseX, mouseY]);

	// Smooth out the mouse movement
	const smoothX = useSpring(mouseX, SPRING_CONFIG);
	const smoothY = useSpring(mouseY, SPRING_CONFIG);

	// Transform mouse position into gradient positions
	const gradientX = useTransform(smoothX, [-1, 1], ["0%", "100%"]);
	const gradientY = useTransform(smoothY, [-1, 1], ["0%", "100%"]);

	// Dynamic intensity based on mouse movement
	const intensity = useTransform<number, number>(
		[smoothX, smoothY],
		([x, y]) => {
			const distance = Math.sqrt(x * x + y * y);
			return 0.3 + distance * 0.2;
		},
	);

	return (
		<div className='fixed inset-0 w-full h-full fadeIn'>
			{/* Base atmospheric layer */}
			<motion.div
				className='absolute inset-0'
				style={{
					background:
						"radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%)",
				}}
			/>

			{/* Dynamic shadow layer */}
			<motion.div
				className='absolute inset-0'
				style={{
					background: useTransform(
						// @ts-expect-error -- motion better than it's types
						[gradientX, gradientY, intensity],
						// @ts-expect-error -- motion better than it's types
						([x, y, i]) =>
							`radial-gradient(circle at ${x} ${y}, transparent 0%, rgba(0,0,0,${i}) 100%)`,
					),
				}}
			/>

			{/* Vignette effect */}
			<div
				className='absolute inset-0'
				style={{
					background:
						"radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.15) 100%)",
					pointerEvents: "none",
				}}
			/>

			{/* Color tint layer */}
			<motion.div
				className='absolute inset-0 mix-blend-multiply'
				style={{
					background: useTransform(
						[color1, color2, opacity],
						([c1, c2, o]) =>
							`radial-gradient(circle at center, ${c1} 0%, ${c2} 100%)`,
					),
					opacity,
					pointerEvents: "none",
				}}
			/>

			{/* Controls */}
			<div className='fixed bottom-0 left-0 p-4 flex gap-4'>
				<div className='flex flex-col gap-2'>
					<div className='text-sm text-white opacity-50'>
						Primary Color
					</div>
					<div className='flex flex-wrap gap-2'>
						{Object.entries(COLORS).map(([name, value]) => (
							<button
								key={name}
								className='w-8 h-8 rounded-full border-2 transition-transform hover:scale-110'
								style={{
									backgroundColor: value,
									borderColor:
										// @ts-expect-error -- motion better than it's types
										color1.get() === value ? "white" : "transparent",
								}}
								// @ts-expect-error -- motion better than it's types
								onClick={() => color1.set(value)}
							/>
						))}
					</div>
				</div>

				<div className='flex flex-col gap-2'>
					<div className='text-sm text-white opacity-50'>
						Secondary Color
					</div>
					<div className='flex flex-wrap gap-2'>
						{Object.entries(COLORS).map(([name, value]) => (
							<button
								key={name}
								className='w-8 h-8 rounded-full border-2 transition-transform hover:scale-110'
								style={{
									backgroundColor: value,
									borderColor:
										// @ts-expect-error -- motion better than it's types
										color2.get() === value ? "white" : "transparent",
								}}
								// @ts-expect-error -- motion better than it's types
								onClick={() => color2.set(value)}
							/>
						))}
					</div>
				</div>

				<div className='flex flex-col gap-2'>
					<div className='text-sm text-white opacity-50'>Opacity</div>
					<input
						type='range'
						min='0'
						max='1'
						step='0.1'
						defaultValue={opacity.get()}
						onChange={(e) => opacity.set(parseFloat(e.target.value))}
						className='w-32'
					/>
				</div>
			</div>
		</div>
	);
};

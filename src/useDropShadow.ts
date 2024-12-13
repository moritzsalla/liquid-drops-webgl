import {
	MotionValue,
	useMotionTemplate,
	useSpring,
	useTransform,
	type SpringOptions,
} from "framer-motion";
import { useEffect } from "react";

const SPRING_CONFIG: SpringOptions = {
	bounce: 0,
	mass: 0.1,
	damping: 10,
};

// Light source configuration
const SHADOW_OFFSET_MULTIPLIER = 30;
const SHADOW_BLUR_MULTIPLIER = 20;
const SHADOW_BLUR_BASE = 2;
const SHADOW_OPACITY_MULTIPLIER = 0.5;
const SHADOW_OPACITY_BASE = 0.7;
const SHADOW_OPACITY_MAX = 1;

// Normalized: 0 - 1
const useMousePosition = () => {
	const mouseX = useSpring(0, SPRING_CONFIG);
	const mouseY = useSpring(0, SPRING_CONFIG);

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

	return {
		mouseX,
		mouseY,
	};
};

export const useDropShadow = (): MotionValue<string> => {
	const { mouseX, mouseY } = useMousePosition();
	const shadowX = useTransform(mouseX, (x) => -x * SHADOW_OFFSET_MULTIPLIER);
	const shadowY = useTransform(mouseY, (y) => -y * SHADOW_OFFSET_MULTIPLIER);

	const shadowBlur = useTransform<number, number>(
		[mouseX, mouseY],
		([x, y]) =>
			Math.sqrt(x * x + y * y) * SHADOW_BLUR_MULTIPLIER + SHADOW_BLUR_BASE,
	);

	const shadowOpacity = useTransform<number, number>(
		[mouseX, mouseY],
		([x, y]) =>
			Math.min(
				Math.sqrt(x * x + y * y) * SHADOW_OPACITY_MULTIPLIER +
					SHADOW_OPACITY_BASE,
				SHADOW_OPACITY_MAX,
			),
	);

	const dropShadow = useMotionTemplate`drop-shadow(${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity}))`;
	return dropShadow;
};

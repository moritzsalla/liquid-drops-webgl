import { useSpring } from "framer-motion";
import { useEffect } from "react";
import { SPRING_CONFIG } from "../config";

// Normalized: 0 - 1
export const useMousePosition = () => {
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

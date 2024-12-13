import { Link } from "react-router-dom";

export const Navigation = () => {
	return (
		<nav className='bg-gray-800 text-white p-4 pointer-events-auto z-50 fixed top-0 left-0'>
			<ul className='flex space-x-8'>
				<li>
					<Link to='/' className='hover:text-gray-300'>
						Sphere
					</Link>
				</li>
				<li>
					<Link to='/liquid' className='hover:text-gray-300'>
						Liquid
					</Link>
				</li>
				<li>
					<Link to='/shadow' className='hover:text-gray-300'>
						Shadow
					</Link>
				</li>
			</ul>
		</nav>
	);
};

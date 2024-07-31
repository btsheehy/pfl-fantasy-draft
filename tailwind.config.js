/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Poppins", "sans-serif"],
			},
			colors: {
				blue: {
					600: "#2563eb",
					800: "#1e40af",
				},
				yellow: {
					400: "#fbbf24",
				},
			},
		},
	},
	plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
			primary: {
				DEFAULT: '#bf2231'
			},
			secondary: {
				DEFAULT: '#3498db'
			},
			accent: {
				DEFAULT: '#1abc9c'
			},
			light: {
				bg: '#f4f9f4',
				text: '#2c3e50'
			},
			dark: {
				bg: '#222222',
				text: '#e0e6ed'
			}
		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
}


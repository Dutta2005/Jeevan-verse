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
  		fontFamily: {
  			ibm: [
  				'IBM Plex Sans',
  				'sans-serif'
  			],
  			samarkan: [
  				'Samarkan',
  				'sans-serif'
  			]
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
  		keyframes: {
  			marquee: {
  				from: {
  					transform: 'translateX(0)'
  				},
  				to: {
  					transform: 'translateX(calc(-100% - var(--gap)))'
  				}
  			},
  			'marquee-vertical': {
  				from: {
  					transform: 'translateY(0)'
  				},
  				to: {
  					transform: 'translateY(calc(-100% - var(--gap)))'
  				}
  			}
  		},
  		animation: {
  			marquee: 'marquee var(--duration) infinite linear',
  			'marquee-vertical': 'marquee-vertical var(--duration) linear infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}


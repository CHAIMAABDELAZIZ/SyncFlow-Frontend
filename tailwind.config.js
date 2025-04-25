/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bgblue: '#789599',
        orangePtrm: '#FF8500', 
        redPtrm: '#DE3D28', 
        greenPtrm: '#449A65',  
        whitePtrm: '#EFF5F5',  
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Raleway', 'sans-serif'],
      },
      colors: {
        bgblue: '#789599',
        orangePtrm: '#FF8500', 
        redPtrm: '#DE3D28', 
        greenPtrm: '#449A65',  
        whitePtrm: '#EFF5F5',  
             'header-bg': '#FCFCFD',
        'divider': '#EAECF0',
        'alert-yellow': '#FFC300',
        'alert-green': '#008304',
        'alert-blue': '#85C8FF',
        'low-green': '#D1FADF',
        'medium-yellow': '#FEF0C7',
        'critical-red': '#FEE4E2',
      },
    },
  },
  plugins: [],
}

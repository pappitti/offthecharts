import './globals.css'
import { Inter, Roboto_Flex } from 'next/font/google'
import localFont from 'next/font/local'

const inter = Inter({ subsets: ['latin'] })

const materialSymbols = localFont({
  variable: '--font-family-symbols', // Variable name (to reference after in CSS/styles)
  style: 'normal',
  src: '../../node_modules/material-symbols/material-symbols-rounded.woff2', // This is a reference to woff2 file from NPM package "material-symbols"
  display: 'block',
  weight: '100 700',
})

const roboto = Roboto_Flex({
  subsets: ['latin'], 
  display: "swap",
  variable: '--font-roboto-flex',  // Variable name (to reference after in CSS/styles)
}); 

export const metadata = {
  title: 'Off_the_charts',
  description: 'Visualizing athletes performance using complex fantasy sports matrices',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${materialSymbols.variable}`}>
      <body className={`${inter.className} ${roboto.className}`}>
        <div className="content">
          {children}
        </div>
      </body>
      
    </html>
  )
}


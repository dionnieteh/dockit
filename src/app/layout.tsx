import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MolecularDock: Accelerating Dengue Cure Research with Automated Molecular Docking',
  description: 'MolecularDock is an automated platform designed to streamline molecular docking processes specifically for dengue research. It simplifies the conversion of mol2 and pdb files to pdbqt format and runs Autodock Vina simulations, accelerating the search for potential dengue treatments.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

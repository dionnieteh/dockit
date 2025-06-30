import type { Metadata } from 'next'
import './globals.css'
import { Suspense } from 'react' // Import Suspense
import { Toaster } from '@/components/ui/toaster' // Import your Toaster component
import { ToastProvider } from '@/hooks/use-toast' // Import ToastProvider

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
      <body>
        {/* Wrap your entire application content (children and Toaster) with ToastProvider */}
        <ToastProvider>
          {/* Wrap children with Suspense to handle client-side components during prerendering */}
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
          {/* Place your Toaster component here, typically at the end of the body */}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 scale-105"
      >
        <source src="/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/60 to-black/80 z-10"></div>
      <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl supports-[backdrop-filter]:bg-black/30 transition-all duration-300">
        <div className="container flex h-20 items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center h-12 group">
              <img
                src="/dockit-white.svg"
                alt="DockIt Logo"
                className="h-12 w-auto transition-transform duration-300 group-hover:scale-110"
              />
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/login">
              <Button variant="ghost">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="ghost">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 relative z-20">
        <section className="w-full py-10 md:py-20 lg:py-32 min-h-[90vh] flex items-center">
          <div className="container px-6 md:px-12">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className="space-y-6 animate-fade-in">
                <div className="inline-block">
                  <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm">
                    🧬 Advanced Molecular Research Platform
                  </span>
                </div>
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl/none text-white max-w-4xl mx-auto">
                  Accelerate{" "}
                  <span className="bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent animate-pulse">
                    Dengue Cure
                  </span>{" "}
                  Research
                </h1>
                <p className="mx-auto max-w-[800px] text-white/90 text-lg sm:text-xl md:text-2xl leading-relaxed font-light">
                  Streamline your anti-dengue drug discovery with our all-in-one platform, enabling batch processing of up to 50 ligand files for efficient molecular docking.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-8 animate-slide-up">
                <Link href="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-primary via-secondary to-primary hover:from-secondary hover:via-primary hover:to-secondary text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 text-lg px-8 py-4 h-auto font-semibold">
                    Get Started
                    <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-20 md:py-32 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)] pointer-events-none"></div>

          <div className="container px-6 md:px-12 relative z-10">
            <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-8 animate-slide-in-left">
                <div className="space-y-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-medium">
                    ⚡ Powerful Technology
                  </span>
                  <h2 className="text-4xl font-black tracking-tight sm:text-5xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Advanced Molecular Docking
                  </h2>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    Our platform automates the conversion of mol2 and pdb files to pdbqt format and runs{" "}
                    <span className="font-semibold text-blue-600">Autodock Vina</span> for highly accurate molecular
                    docking simulations.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Automatic File Conversion</h3>
                      <p className="text-slate-600 text-sm">Drag & drop ligand files in PDB or MOL2 files, we convert them for you.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Configurable Grid Parameters</h3>
                      <p className="text-slate-600 text-sm">Utilize default grid parameters or customize them for precise docking.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Select Receptor Files</h3>
                      <p className="text-slate-600 text-sm">Choose from our receptor files to dock with, no uploads required!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center animate-slide-in-right">
                <div className="relative">
                  {/* Glowing background effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>

                  <div className="relative rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Docking Pipeline</h3>
                        <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">Upload Ligand Files</div>
                            <div className="text-xs text-green-600 font-medium">COMPLETED</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
                            <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">Configure Grid Parameters</div>
                            <div className="text-xs text-blue-600 font-medium">PROCESSING...</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-purple-800">Select Receptor Files</div>
                            <div className="text-xs text-purple-600 font-medium">PENDING</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-md">
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-yellow-800">Download Docking Results</div>
                            <div className="text-xs text-yellow-600 font-medium">QUEUED</div>
                          </div>
                        </div>

                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Progress</span>
                          <span className="font-semibold text-blue-600">67%</span>
                        </div>
                        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t py-6 bg-background/95 backdrop-blur relative z-10">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <p className="text-center text-sm text-muted-foreground">© 2025 DockIt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
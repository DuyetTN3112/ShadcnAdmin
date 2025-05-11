import React from 'react'
import { Head } from '@inertiajs/react'
import Navbar from '@/components/layout/nav_bar'

interface AppLayoutProps {
  title: string
  children: React.ReactNode
}

export default function AppLayout({ title, children }: AppLayoutProps) {
  return (
    <>
      <Head title={title} />
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t py-4">
          <div className="container text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ShadcnAdmin. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  )
} 
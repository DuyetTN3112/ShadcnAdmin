import React from 'react'
import { Link } from '@inertiajs/react'
import { Button } from '../ui/button'

export default function Navbar() {
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            ShadcnAdmin
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/users"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Người dùng
            </Link>
            <Link
              href="/tasks"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Nhiệm vụ
            </Link>
            <Link
              href="/settings"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Cài đặt
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile">
              Tài khoản
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/logout" method="post" as="button">
              Đăng xuất
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
} 
"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Trophy, 
  User, 
  LogOut, 
  Menu,
  Bell,
  Settings
} from "lucide-react"
import { useState } from "react"

export function Header() {
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              LeagueFlow
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/leagues"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Leagues
            </Link>
            <Link
              href="/teams"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Teams
            </Link>
            <Link
              href="/matches"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Matches
            </Link>
            {session?.user?.role === "LEAGUE_ADMIN" && (
              <Link
                href="/admin"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="flex items-center space-x-2 md:hidden">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-bold">LeagueFlow</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-2">
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session ? (
              <>
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                </Button>
                
                <div className="flex items-center space-x-2">
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.role.replace("_", " ").toLowerCase()}
                    </p>
                  </div>
                  
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/profile">
                      <User className="h-4 w-4" />
                      <span className="sr-only">Profile</span>
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings">
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">Settings</span>
                    </Link>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Sign out</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button variant="sports" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="border-t md:hidden">
          <div className="container py-4">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/leagues"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Leagues
              </Link>
              <Link
                href="/teams"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Teams
              </Link>
              <Link
                href="/matches"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Matches
              </Link>
              {session?.user?.role === "LEAGUE_ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
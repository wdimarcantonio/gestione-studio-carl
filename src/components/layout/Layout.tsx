import { ReactNode, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { PatientSelector } from '@/components/layout/PatientSelector'
import {
  House,
  UsersThree,
  ChartLine,
  ChatCircleText,
  Folder,
  SignOut,
  List,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'ADMIN'

  const adminNav = [
    { path: '/admin', label: 'Pannello', icon: House },
    { path: '/admin/patients', label: 'Pazienti', icon: UsersThree },
    { path: '/admin/measurements', label: 'Misurazioni', icon: ChartLine },
    { path: '/admin/messages', label: 'Messaggi', icon: ChatCircleText },
    { path: '/admin/documents', label: 'Documenti', icon: Folder },
  ]

  const patientNav = [
    { path: '/patient', label: 'Pannello', icon: House },
    { path: '/patient/messages', label: 'Messaggi', icon: ChatCircleText },
    { path: '/patient/documents', label: 'Documenti', icon: Folder },
  ]

  const navItems = isAdmin ? adminNav : patientNav

  const NavigationContent = () => (
    <>
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-semibold text-primary">NutriTrack</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin ? 'Portale Dietista' : 'Portale Paziente'}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  isActive && 'bg-secondary text-secondary-foreground'
                )}
              >
                <Icon size={20} />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center gap-3 px-2">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <SignOut size={20} />
          Esci
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-background">
      {isMobile ? (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 md:hidden"
            >
              <List size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 flex flex-col">
            <NavigationContent />
          </SheetContent>
        </Sheet>
      ) : (
        <aside className="w-64 border-r border-border bg-card flex flex-col">
          <NavigationContent />
        </aside>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {isAdmin && (
          <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-foreground">Lavora con:</h2>
              <PatientSelector />
            </div>
          </header>
        )}
        
        <main className="flex-1 overflow-auto">
          <div className={cn('p-8', isMobile && !isAdmin && 'pt-20')}>{children}</div>
        </main>
      </div>
    </div>
  )
}

import { AuthProvider } from '../../contexts/AuthContext'
import AuthLayoutClient from './AuthLayoutClient'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <AuthLayoutClient>{children}</AuthLayoutClient>
      </main>
    </AuthProvider>
  )
}

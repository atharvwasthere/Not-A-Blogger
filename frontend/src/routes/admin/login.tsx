import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminLogin } from '@/features/admin/components/AdminLogin'

export const Route = createFileRoute('/admin/login')({
  component: AdminLogin
})

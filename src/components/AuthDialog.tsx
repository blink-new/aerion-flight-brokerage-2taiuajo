import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Plane, Mail, User, Phone, Building } from 'lucide-react'
import { blink } from '../lib/blink'
import toast from 'react-hot-toast'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    company: ''
  })

  const handleLogin = () => {
    setIsLoading(true)
    try {
      // Blink maneja automáticamente la redirección a la página de login
      blink.auth.login()
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      toast.error('Error al iniciar sesión')
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!formData.email || !formData.fullName) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setIsLoading(true)
    try {
      // Blink maneja automáticamente el registro y redirección
      blink.auth.login()
      toast.success('Redirigiendo al registro...')
    } catch (error) {
      console.error('Error al registrarse:', error)
      toast.error('Error al registrarse')
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center space-x-2 justify-center mb-4">
            <Plane className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl font-bold text-primary">Aerion</DialogTitle>
          </div>
          <DialogDescription className="text-center text-lg">
            Accede a vuelos privados exclusivos y ofertas de empty legs
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">Bienvenido de vuelta</CardTitle>
                <CardDescription>
                  Accede a tu cuenta para ver vuelos disponibles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
                >
                  {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
                </Button>
                <p className="text-sm text-gray-600 text-center">
                  Serás redirigido a una página segura para autenticarte
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <Card>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">Únete a Aerion</CardTitle>
                <CardDescription>
                  Crea tu cuenta y descubre la aviación privada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      placeholder="Tu nombre completo"
                      value={formData.fullName}
                      onChange={(e) => updateFormData('fullName', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="+54 11 1234-5678"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa (Opcional)</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="company"
                      placeholder="Nombre de tu empresa"
                      value={formData.company}
                      onChange={(e) => updateFormData('company', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
                >
                  {isLoading ? 'Cargando...' : 'Crear Cuenta'}
                </Button>

                <p className="text-sm text-gray-600 text-center">
                  Al registrarte, aceptas nuestros términos y condiciones
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
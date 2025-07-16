import { useState } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Plane, MapPin, Calendar, Users, Clock, Star, ArrowRight, Calculator, Shield, Zap } from 'lucide-react'
import { AuthDialog } from './components/AuthDialog'
import { UserMenu } from './components/UserMenu'
import { FlightsTable } from './components/FlightsTable'
import { CharterQuote } from './components/CharterQuote'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { useAuth } from './hooks/useAuth'
import toast from 'react-hot-toast'

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'flights'>('home')
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '1'
  })
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  const handleSearch = () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para buscar vuelos')
      setAuthDialogOpen(true)
      return
    }
    console.log('Searching flights:', searchData)
    setCurrentPage('flights')
    toast.success('Mostrando vuelos disponibles...')
  }

  const handleAuthClick = () => {
    if (isAuthenticated) {
      // Si ya está autenticado, no hacer nada (el UserMenu maneja las acciones)
      return
    }
    setAuthDialogOpen(true)
  }

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada correctamente')
  }

  const handleViewFlights = () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para ver vuelos')
      setAuthDialogOpen(true)
      return
    }
    setCurrentPage('flights')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">Aerion</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setCurrentPage('home')} 
                className={`transition-colors ${currentPage === 'home' ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'}`}
              >
                Inicio
              </button>
              <button 
                onClick={handleViewFlights} 
                className={`transition-colors ${currentPage === 'flights' ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'}`}
              >
                Ver Vuelos
              </button>
              <a href="#" className="text-gray-700 hover:text-primary transition-colors">Cómo Funciona</a>
              <a href="#" className="text-gray-700 hover:text-primary transition-colors">Contacto</a>
            </div>
            {isLoading ? (
              <Button disabled className="bg-primary hover:bg-primary/90">
                Cargando...
              </Button>
            ) : isAuthenticated && user ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <Button 
                onClick={handleAuthClick}
                className="bg-primary hover:bg-primary/90"
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      {currentPage === 'home' ? (
        <>
          {/* Hero Section */}
          <section className="relative py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <Badge className="mb-6 bg-accent/10 text-accent border-accent/20 hover:bg-accent/20">
                  🚁 Aviación Privada Accesible
                </Badge>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  {isAuthenticated && user ? (
                    <>
                      Bienvenido, {user.displayName || user.email.split('@')[0]}
                      <span className="block text-primary">¿Listo para volar?</span>
                    </>
                  ) : (
                    <>
                      Vuela en Privado
                      <span className="block text-primary">Sin Ser Millonario</span>
                    </>
                  )}
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                  {isAuthenticated ? (
                    'Encuentra tu próximo vuelo privado. Compara precios entre vuelos charter completos y ofertas exclusivas de empty legs.'
                  ) : (
                    <>
                      Conectamos pasajeros con jets privados. Desde vuelos charter premium completos 
                      hasta asientos empty leg accesibles. <span className="text-primary font-semibold">Desde $500 USD por persona.</span>
                    </>
                  )}
                </p>
              </div>

              {/* Flight Search Card */}
              <Card className="max-w-5xl mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl text-gray-900">Busca tu próximo vuelo</CardTitle>
                  <CardDescription className="text-lg">
                    Encuentra vuelos premium o aprovecha nuestros empty legs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Origen"
                        value={searchData.from}
                        onChange={(e) => setSearchData({...searchData, from: e.target.value})}
                        className="pl-10 h-12 text-lg"
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Destino"
                        value={searchData.to}
                        onChange={(e) => setSearchData({...searchData, to: e.target.value})}
                        className="pl-10 h-12 text-lg"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type="date"
                        value={searchData.date}
                        onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                        className="pl-10 h-12 text-lg"
                      />
                    </div>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="Pasajeros"
                        value={searchData.passengers}
                        onChange={(e) => setSearchData({...searchData, passengers: e.target.value})}
                        className="pl-10 h-12 text-lg"
                        min="1"
                        max="12"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleSearch}
                    className="w-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-lg"
                  >
                    <Plane className="mr-2 h-5 w-5" />
                    Buscar Vuelos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Comparison Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                  Dos Modelos, Una Experiencia Premium
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Elige entre vuelos charter completos o aprovecha nuestros empty legs para volar a precios increíbles
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Premium Charter */}
                <Card className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-white">Premium</Badge>
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Plane className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">Vuelo Charter Completo</CardTitle>
                    </div>
                    <CardDescription className="text-lg">
                      El avión completo para ti y tu grupo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span>Elige día y horario</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <span>Si te demorás, te espera</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <span>Atención personalizada</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Zap className="h-5 w-5 text-primary" />
                        <span>Conectividad durante el vuelo</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">$6,900 USD</div>
                        <div className="text-sm text-gray-600 mb-3">Avión completo (Corrientes → Buenos Aires)</div>
                        <div className="text-lg font-semibold text-accent">
                          $690 USD por persona (10 pasajeros)
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Empty Leg */}
                <Card className="relative overflow-hidden border-2 border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-xl">
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-accent text-white">Oferta</Badge>
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-accent/10 rounded-full">
                        <Calculator className="h-6 w-6 text-accent" />
                      </div>
                      <CardTitle className="text-2xl">Empty Leg</CardTitle>
                    </div>
                    <CardDescription className="text-lg">
                      Asientos individuales en vuelos programados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-accent" />
                        <span>Rutas ya programadas</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-accent" />
                        <span>Ideal para viajeros individuales</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-accent" />
                        <span>Misma experiencia premium</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-accent" />
                        <span>Horarios flexibles</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-accent mb-2">$500 USD</div>
                        <div className="text-sm text-gray-600 mb-3">Por persona</div>
                        <div className="text-lg font-semibold text-primary">
                          Hasta 75% menos que charter completo
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-12">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
                  onClick={handleViewFlights}
                >
                  Ver Vuelos Disponibles
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-20 bg-gradient-to-br from-blue-50 to-amber-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                  ¿Por qué elegir Aerion?
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Democratizamos la aviación privada con tecnología y experiencia
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-8">
                    <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">125+ Destinos</h3>
                    <p className="text-gray-600">
                      Llegamos donde las aerolíneas comerciales no pueden. Aeropuertos secundarios y pistas privadas.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-8">
                    <div className="p-4 bg-accent/10 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                      <Clock className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Sin Escalas</h3>
                    <p className="text-gray-600">
                      Evita las 4 horas de escala en Buenos Aires. Vuela directo a tu destino.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-8">
                    <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                      <Calculator className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Precios Transparentes</h3>
                    <p className="text-gray-600">
                      Sin sorpresas. Compara precios y encuentra la mejor opción para tu presupuesto.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-primary text-white">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                ¿Listo para volar en privado?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Antes de sacar tu próximo pasaje comercial, consultanos. 
                Podemos ofrecerte algo mejor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="text-lg px-8 py-4"
                  onClick={handleViewFlights}
                >
                  Ver Empty Legs Disponibles
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
                  Solicitar Cotización
                </Button>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Página de Vuelos */
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Vuelos Disponibles
              </h1>
              <p className="text-lg text-gray-600">
                Explora nuestros vuelos charter completos y ofertas exclusivas de empty legs
              </p>
            </div>
            
            <Tabs defaultValue="empty-legs" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="empty-legs" className="text-lg py-3">
                  <Calculator className="h-4 w-4 mr-2" />
                  Empty Legs
                </TabsTrigger>
                <TabsTrigger value="charter" className="text-lg py-3">
                  <Plane className="h-4 w-4 mr-2" />
                  Charter Completo
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="empty-legs" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Vuelos Empty Leg Disponibles</h2>
                  <p className="text-gray-600">
                    Aprovecha estos vuelos ya programados y ahorra hasta 70% en tu próximo viaje
                  </p>
                </div>
                <FlightsTable searchParams={searchData} />
              </TabsContent>
              
              <TabsContent value="charter" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Cotización Charter Personalizada</h2>
                  <p className="text-gray-600">
                    Obtén una cotización para tu vuelo privado completo con total flexibilidad
                  </p>
                </div>
                <CharterQuote />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Plane className="h-6 w-6" />
                <span className="text-xl font-bold">Aerion</span>
              </div>
              <p className="text-gray-400">
                Democratizando la aviación privada en Argentina y Latinoamérica.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Vuelos Charter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Empty Legs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Gestión de Flota</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+54 11 1234-5678</li>
                <li>info@aerion.com.ar</li>
                <li>Buenos Aires, Argentina</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Aerion. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen} 
      />
    </div>
  )
}

export default App
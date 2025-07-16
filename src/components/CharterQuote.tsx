import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Plane, MapPin, Users, Calendar, DollarSign, Calculator } from 'lucide-react'
import toast from 'react-hot-toast'

interface Airport {
  id: string
  code: string
  name: string
  city: string
  country: string
  lat: number
  lng: number
}

interface Aircraft {
  id: string
  model: string
  manufacturer: string
  capacity: number
  category: string
  hourly_rate: number
}

interface Quote {
  origin: Airport
  destination: Airport
  aircraft: Aircraft
  distance_km: number
  duration_minutes: number
  total_price: number
  price_per_person: number
  passengers: number
  date: string
}

export function CharterQuote() {
  const [airports, setAirports] = useState<Airport[]>([])
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  
  const [quoteForm, setQuoteForm] = useState({
    origin: '',
    destination: '',
    aircraft_id: '',
    passengers: '4',
    date: ''
  })

  // Cargar datos iniciales
  const loadInitialData = async () => {
    if (airports.length > 0 && aircraft.length > 0) return // Ya cargados
    
    setLoadingData(true)
    try {
      const [airportsRes, aircraftRes] = await Promise.all([
        fetch('https://2taiuajo--flights.functions.blink.new/airports'),
        fetch('https://2taiuajo--flights.functions.blink.new/aircraft')
      ])
      
      const airportsData = await airportsRes.json()
      const aircraftData = await aircraftRes.json()
      
      if (airportsData.success) setAirports(airportsData.data)
      if (aircraftData.success) setAircraft(aircraftData.data)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoadingData(false)
    }
  }

  const handleFormChange = (key: string, value: string) => {
    setQuoteForm(prev => ({ ...prev, [key]: value }))
    
    // Cargar datos cuando el usuario empiece a interactuar
    if (airports.length === 0 || aircraft.length === 0) {
      loadInitialData()
    }
  }

  const generateQuote = async () => {
    if (!quoteForm.origin || !quoteForm.destination || !quoteForm.aircraft_id || !quoteForm.passengers) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('https://2taiuajo--flights.functions.blink.new/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          origin: quoteForm.origin,
          destination: quoteForm.destination,
          aircraft_id: quoteForm.aircraft_id,
          passengers: parseInt(quoteForm.passengers),
          date: quoteForm.date
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setQuote(data.data)
        toast.success('Cotización generada exitosamente')
      } else {
        toast.error('Error al generar cotización')
      }
    } catch (error) {
      console.error('Error generating quote:', error)
      toast.error('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      'light': 'Jet Ligero',
      'midsize': 'Jet Mediano', 
      'heavy': 'Jet Pesado',
      'ultra-long-range': 'Ultra Largo Alcance'
    }
    return labels[category as keyof typeof labels] || category
  }

  const handleBookCharter = () => {
    if (!quote) return
    toast.success('Iniciando proceso de reserva de charter completo')
    // Aquí implementarías la lógica de reserva
  }

  return (
    <div className="space-y-6">
      {/* Formulario de Cotización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cotización Charter Completo
          </CardTitle>
          <CardDescription>
            Obtén una cotización personalizada para tu vuelo privado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Select 
              value={quoteForm.origin} 
              onValueChange={(value) => handleFormChange('origin', value)}
              disabled={loadingData}
            >
              <SelectTrigger>
                <SelectValue placeholder="Aeropuerto de origen" />
              </SelectTrigger>
              <SelectContent>
                {airports.map((airport) => (
                  <SelectItem key={airport.id} value={airport.id}>
                    {airport.code} - {airport.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={quoteForm.destination} 
              onValueChange={(value) => handleFormChange('destination', value)}
              disabled={loadingData}
            >
              <SelectTrigger>
                <SelectValue placeholder="Aeropuerto de destino" />
              </SelectTrigger>
              <SelectContent>
                {airports.map((airport) => (
                  <SelectItem key={airport.id} value={airport.id}>
                    {airport.code} - {airport.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={quoteForm.aircraft_id} 
              onValueChange={(value) => handleFormChange('aircraft_id', value)}
              disabled={loadingData}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de aeronave" />
              </SelectTrigger>
              <SelectContent>
                {aircraft.map((plane) => (
                  <SelectItem key={plane.id} value={plane.id}>
                    {plane.model} ({getCategoryLabel(plane.category)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Número de pasajeros"
              value={quoteForm.passengers}
              onChange={(e) => handleFormChange('passengers', e.target.value)}
              min="1"
              max="20"
            />

            <Input
              type="date"
              value={quoteForm.date}
              onChange={(e) => handleFormChange('date', e.target.value)}
            />

            <Button 
              onClick={generateQuote} 
              disabled={loading || loadingData}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Cotizar
                </>
              )}
            </Button>
          </div>

          {loadingData && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Cargando datos...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultado de Cotización */}
      {quote && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tu Cotización Charter
            </CardTitle>
            <CardDescription>
              Cotización válida por 24 horas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Detalles del vuelo */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-semibold">
                      {quote.origin.code} → {quote.destination.code}
                    </div>
                    <div className="text-sm text-gray-500">
                      {quote.origin.city} → {quote.destination.city}
                    </div>
                    <div className="text-xs text-gray-400">
                      {quote.distance_km} km • {formatDuration(quote.duration_minutes)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-semibold">{quote.aircraft.model}</div>
                    <div className="text-sm text-gray-500">
                      {quote.aircraft.manufacturer}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {getCategoryLabel(quote.aircraft.category)}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-semibold">{quote.passengers} pasajeros</div>
                    <div className="text-sm text-gray-500">
                      Capacidad máxima: {quote.aircraft.capacity}
                    </div>
                  </div>
                </div>

                {quote.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-semibold">
                        {new Date(quote.date).toLocaleDateString('es-AR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Precios */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      ${quote.total_price.toLocaleString()} USD
                    </div>
                    <div className="text-lg text-gray-600 mb-1">
                      Precio total del charter
                    </div>
                    <div className="text-sm text-gray-500">
                      ${quote.price_per_person.toLocaleString()} USD por persona
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Vuelo base:</span>
                    <span>${Math.round(quote.total_price * 0.7).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Combustible:</span>
                    <span>${Math.round(quote.distance_km * 0.8).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tasas aeroportuarias:</span>
                    <span>$500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margen operativo:</span>
                    <span>${Math.round(quote.total_price * 0.25).toLocaleString()}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${quote.total_price.toLocaleString()} USD</span>
                  </div>
                </div>

                <Button 
                  onClick={handleBookCharter}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Reservar Charter
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  * Precios sujetos a disponibilidad y condiciones del mercado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
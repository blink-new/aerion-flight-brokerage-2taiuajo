import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Plane, MapPin, Clock, Users, Filter, Calendar, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

interface Flight {
  id: string
  flight_type: 'charter' | 'empty_leg'
  origin_code: string
  origin_city: string
  origin_country: string
  destination_code: string
  destination_city: string
  destination_country: string
  departure_date: string
  departure_time: string
  arrival_time: string
  duration_minutes: number
  distance_km: number
  aircraft_type: string
  aircraft_category: string
  max_passengers: number
  operator_name: string
  aircraft_registration: string
  charter_price_usd: number
  empty_leg_price_per_seat_usd: number | null
  available_seats: number
  status: string
}

interface FlightsTableProps {
  searchParams?: {
    from?: string
    to?: string
    date?: string
    passengers?: string
  }
}

export function FlightsTable({ searchParams }: FlightsTableProps) {
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    flight_type: '',
    origin: searchParams?.from || '',
    destination: searchParams?.to || '',
    date: searchParams?.date || '',
    max_price: '',
    min_seats: searchParams?.passengers || '',
    aircraft_category: ''
  })

  const fetchFlights = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value)
        }
      })

      const response = await fetch(`https://2taiuajo--flights.functions.blink.new?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setFlights(data.data)
      } else {
        toast.error('Error al cargar vuelos')
      }
    } catch (error) {
      console.error('Error fetching flights:', error)
      toast.error('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFlights()
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    fetchFlights()
  }

  const clearFilters = () => {
    setFilters({
      flight_type: '',
      origin: '',
      destination: '',
      date: '',
      max_price: '',
      min_seats: '',
      aircraft_category: ''
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatPrice = (flight: Flight) => {
    if (flight.flight_type === 'charter') {
      return {
        main: `$${flight.charter_price_usd.toLocaleString()} USD`,
        sub: `Avión completo (${flight.max_passengers} pax)`
      }
    } else {
      const perSeat = flight.empty_leg_price_per_seat_usd || 0
      return {
        main: `$${perSeat.toLocaleString()} USD`,
        sub: `Por persona (${flight.available_seats} disponibles)`
      }
    }
  }

  const handleBookFlight = (flight: Flight) => {
    toast.success(`Iniciando reserva para vuelo ${flight.id}`)
    // Aquí implementarías la lógica de reserva
  }

  if (loading) {
    return (
      <div className=\"flex items-center justify-center py-20\">\n        <div className=\"text-center\">\n          <Plane className=\"h-12 w-12 text-primary mx-auto mb-4 animate-pulse\" />\n          <p className=\"text-lg text-gray-600\">Cargando vuelos disponibles...</p>\n        </div>\n      </div>\n    )
  }

  return (
    <div className=\"space-y-6\">\n      {/* Filtros */}\n      <Card>\n        <CardHeader>\n          <CardTitle className=\"flex items-center gap-2\">\n            <Filter className=\"h-5 w-5\" />\n            Filtros de Búsqueda\n          </CardTitle>\n          <CardDescription>\n            Refina tu búsqueda para encontrar el vuelo perfecto\n          </CardDescription>\n        </CardHeader>\n        <CardContent>\n          <div className=\"grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4\">\n            <Select value={filters.flight_type} onValueChange={(value) => handleFilterChange('flight_type', value)}>\n              <SelectTrigger>\n                <SelectValue placeholder=\"Tipo de vuelo\" />\n              </SelectTrigger>\n              <SelectContent>\n                <SelectItem value=\"\">Todos los tipos</SelectItem>\n                <SelectItem value=\"charter\">Charter Completo</SelectItem>\n                <SelectItem value=\"empty_leg\">Empty Leg</SelectItem>\n              </SelectContent>\n            </Select>\n\n            <Input\n              placeholder=\"Origen\"\n              value={filters.origin}\n              onChange={(e) => handleFilterChange('origin', e.target.value)}\n            />\n\n            <Input\n              placeholder=\"Destino\"\n              value={filters.destination}\n              onChange={(e) => handleFilterChange('destination', e.target.value)}\n            />\n\n            <Input\n              type=\"date\"\n              value={filters.date}\n              onChange={(e) => handleFilterChange('date', e.target.value)}\n            />\n\n            <Input\n              type=\"number\"\n              placeholder=\"Precio máximo (USD)\"\n              value={filters.max_price}\n              onChange={(e) => handleFilterChange('max_price', e.target.value)}\n            />\n\n            <Input\n              type=\"number\"\n              placeholder=\"Mín. asientos\"\n              value={filters.min_seats}\n              onChange={(e) => handleFilterChange('min_seats', e.target.value)}\n            />\n\n            <Select value={filters.aircraft_category} onValueChange={(value) => handleFilterChange('aircraft_category', value)}>\n              <SelectTrigger>\n                <SelectValue placeholder=\"Categoría\" />\n              </SelectTrigger>\n              <SelectContent>\n                <SelectItem value=\"\">Todas las categorías</SelectItem>\n                <SelectItem value=\"light_jet\">Jet Ligero</SelectItem>\n                <SelectItem value=\"mid_size\">Jet Mediano</SelectItem>\n                <SelectItem value=\"heavy_jet\">Jet Pesado</SelectItem>\n                <SelectItem value=\"turboprop\">Turbohélice</SelectItem>\n              </SelectContent>\n            </Select>\n          </div>\n\n          <div className=\"flex gap-2\">\n            <Button onClick={applyFilters} className=\"bg-primary hover:bg-primary/90\">\n              <Filter className=\"h-4 w-4 mr-2\" />\n              Aplicar Filtros\n            </Button>\n            <Button variant=\"outline\" onClick={clearFilters}>\n              Limpiar\n            </Button>\n          </div>\n        </CardContent>\n      </Card>\n\n      {/* Resultados */}\n      <Card>\n        <CardHeader>\n          <CardTitle className=\"flex items-center justify-between\">\n            <span>Vuelos Disponibles ({flights.length})</span>\n            <Badge variant=\"secondary\">\n              {flights.filter(f => f.flight_type === 'empty_leg').length} Empty Legs • \n              {flights.filter(f => f.flight_type === 'charter').length} Charter\n            </Badge>\n          </CardTitle>\n        </CardHeader>\n        <CardContent>\n          {flights.length === 0 ? (\n            <div className=\"text-center py-12\">\n              <Plane className=\"h-16 w-16 text-gray-300 mx-auto mb-4\" />\n              <h3 className=\"text-lg font-semibold text-gray-600 mb-2\">No se encontraron vuelos</h3>\n              <p className=\"text-gray-500\">Intenta ajustar tus filtros de búsqueda</p>\n            </div>\n          ) : (\n            <div className=\"space-y-4\">\n              {flights.map((flight) => {\n                const price = formatPrice(flight)\n                return (\n                  <Card key={flight.id} className=\"hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary\">\n                    <CardContent className=\"p-6\">\n                      <div className=\"flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4\">\n                        {/* Información del vuelo */}\n                        <div className=\"flex-1 space-y-3\">\n                          <div className=\"flex items-center gap-3\">\n                            <Badge \n                              variant={flight.flight_type === 'charter' ? 'default' : 'secondary'}\n                              className={flight.flight_type === 'charter' ? 'bg-primary' : 'bg-accent'}\n                            >\n                              {flight.flight_type === 'charter' ? 'Charter Completo' : 'Empty Leg'}\n                            </Badge>\n                            <span className=\"text-sm text-gray-500\">{flight.operator_name}</span>\n                          </div>\n\n                          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">\n                            {/* Ruta */}\n                            <div className=\"flex items-center gap-2\">\n                              <MapPin className=\"h-4 w-4 text-gray-400\" />\n                              <div>\n                                <div className=\"font-semibold\">\n                                  {flight.origin_code} → {flight.destination_code}\n                                </div>\n                                <div className=\"text-sm text-gray-500\">\n                                  {flight.origin_city} → {flight.destination_city}\n                                </div>\n                              </div>\n                            </div>\n\n                            {/* Horario */}\n                            <div className=\"flex items-center gap-2\">\n                              <Clock className=\"h-4 w-4 text-gray-400\" />\n                              <div>\n                                <div className=\"font-semibold\">\n                                  {flight.departure_time} - {flight.arrival_time}\n                                </div>\n                                <div className=\"text-sm text-gray-500\">\n                                  {new Date(flight.departure_date).toLocaleDateString('es-AR')} • {formatDuration(flight.duration_minutes)}\n                                </div>\n                              </div>\n                            </div>\n\n                            {/* Aeronave */}\n                            <div className=\"flex items-center gap-2\">\n                              <Plane className=\"h-4 w-4 text-gray-400\" />\n                              <div>\n                                <div className=\"font-semibold\">{flight.aircraft_type}</div>\n                                <div className=\"text-sm text-gray-500\">\n                                  <Users className=\"h-3 w-3 inline mr-1\" />\n                                  {flight.available_seats} de {flight.max_passengers} disponibles\n                                </div>\n                              </div>\n                            </div>\n                          </div>\n                        </div>\n\n                        {/* Precio y acción */}\n                        <div className=\"flex flex-col items-end gap-3 min-w-[200px]\">\n                          <div className=\"text-right\">\n                            <div className=\"text-2xl font-bold text-primary\">{price.main}</div>\n                            <div className=\"text-sm text-gray-500\">{price.sub}</div>\n                          </div>\n                          <Button \n                            onClick={() => handleBookFlight(flight)}\n                            className=\"bg-primary hover:bg-primary/90 w-full\"\n                          >\n                            <DollarSign className=\"h-4 w-4 mr-2\" />\n                            Reservar\n                          </Button>\n                        </div>\n                      </div>\n                    </CardContent>\n                  </Card>\n                )\n              })}\n            </div>\n          )}\n        </CardContent>\n      </Card>\n    </div>\n  )\n}
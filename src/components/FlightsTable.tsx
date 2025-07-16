import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Plane, MapPin, Clock, Users, Filter, DollarSign, Search } from 'lucide-react'
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

interface Flight {
  id: string
  flight_type: 'charter' | 'empty_leg'
  aircraft_id: string
  aircraft: Aircraft
  departure_airport_id: string
  departure_airport: Airport
  arrival_airport_id: string
  arrival_airport: Airport
  departure_date: string
  departure_time: string
  arrival_date: string
  arrival_time: string
  duration_minutes: number
  distance_km: number
  price_total: number
  price_per_seat?: number
  available_seats?: number
  status: string
  operator: string
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
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: 'empty_leg',
    origin: searchParams?.from || '',
    destination: searchParams?.to || '',
    date: searchParams?.date || '',
    maxPrice: '',
    category: ''
  })

  // Cargar aeropuertos al inicio
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await fetch('https://2taiuajo--flights.functions.blink.new/airports')
        const data = await response.json()
        if (data.success) {
          setAirports(data.data)
        }
      } catch (error) {
        console.error('Error fetching airports:', error)
      }
    }
    fetchAirports()
  }, [])

  // Cargar vuelos iniciales
  useEffect(() => {
    const fetchInitialFlights = async () => {
      setLoading(true)
      try {
        const response = await fetch('https://2taiuajo--flights.functions.blink.new/flights?type=empty_leg')
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
    fetchInitialFlights()
  }, [])

  const fetchFlights = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value)
        }
      })

      const response = await fetch(`https://2taiuajo--flights.functions.blink.new/flights?${params}`)
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    fetchFlights()
  }

  const clearFilters = () => {
    setFilters({
      type: 'empty_leg',
      origin: '',
      destination: '',
      date: '',
      maxPrice: '',
      category: ''
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
        main: `$${flight.price_total.toLocaleString()} USD`,
        sub: `Avión completo (${flight.aircraft.capacity} pax)`
      }
    } else {
      const perSeat = flight.price_per_seat || 0
      return {
        main: `$${perSeat.toLocaleString()} USD`,
        sub: `Por persona (${flight.available_seats} disponibles)`
      }
    }
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

  const handleBookFlight = (flight: Flight) => {
    toast.success(`Iniciando reserva para vuelo ${flight.id}`)
    // Aquí implementarías la lógica de reserva
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Plane className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Cargando vuelos disponibles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Refina tu búsqueda para encontrar el vuelo perfecto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de vuelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empty_leg">Empty Leg</SelectItem>
                <SelectItem value="charter">Charter Completo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.origin} onValueChange={(value) => handleFilterChange('origin', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Origen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los orígenes</SelectItem>
                {airports.map((airport) => (
                  <SelectItem key={airport.id} value={airport.id}>
                    {airport.code} - {airport.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.destination} onValueChange={(value) => handleFilterChange('destination', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los destinos</SelectItem>
                {airports.map((airport) => (
                  <SelectItem key={airport.id} value={airport.id}>
                    {airport.code} - {airport.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
            />

            <Input
              type="number"
              placeholder="Precio máximo (USD)"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />

            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las categorías</SelectItem>
                <SelectItem value="light">Jet Ligero</SelectItem>
                <SelectItem value="midsize">Jet Mediano</SelectItem>
                <SelectItem value="heavy">Jet Pesado</SelectItem>
                <SelectItem value="ultra-long-range">Ultra Largo Alcance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={applyFilters} className="bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4 mr-2" />
              Buscar Vuelos
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Vuelos Disponibles ({flights.length})</span>
            <Badge variant="secondary">
              {flights.filter(f => f.flight_type === 'empty_leg').length} Empty Legs • 
              {flights.filter(f => f.flight_type === 'charter').length} Charter
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {flights.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No se encontraron vuelos</h3>
              <p className="text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flights.map((flight) => {
                const price = formatPrice(flight)
                return (
                  <Card key={flight.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Información del vuelo */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={flight.flight_type === 'charter' ? 'default' : 'secondary'}
                              className={flight.flight_type === 'charter' ? 'bg-primary' : 'bg-accent'}
                            >
                              {flight.flight_type === 'charter' ? 'Charter Completo' : 'Empty Leg'}
                            </Badge>
                            <span className="text-sm text-gray-500">{flight.operator}</span>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(flight.aircraft.category)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Ruta */}
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-semibold">
                                  {flight.departure_airport.code} → {flight.arrival_airport.code}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {flight.departure_airport.city} → {flight.arrival_airport.city}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {flight.distance_km} km
                                </div>
                              </div>
                            </div>

                            {/* Horario */}
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-semibold">
                                  {flight.departure_time} - {flight.arrival_time}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(flight.departure_date).toLocaleDateString('es-AR')}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {formatDuration(flight.duration_minutes)}
                                </div>
                              </div>
                            </div>

                            {/* Aeronave */}
                            <div className="flex items-center gap-2">
                              <Plane className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-semibold">{flight.aircraft.model}</div>
                                <div className="text-sm text-gray-500">
                                  {flight.aircraft.manufacturer}
                                </div>
                                <div className="text-xs text-gray-400 flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {flight.flight_type === 'empty_leg' 
                                    ? `${flight.available_seats} de ${flight.aircraft.capacity} disponibles`
                                    : `${flight.aircraft.capacity} pasajeros`
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Precio y acción */}
                        <div className="flex flex-col items-end gap-3 min-w-[200px]">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{price.main}</div>
                            <div className="text-sm text-gray-500">{price.sub}</div>
                            {flight.flight_type === 'empty_leg' && (
                              <div className="text-xs text-green-600 font-medium">
                                ¡Hasta 70% de descuento!
                              </div>
                            )}
                          </div>
                          <Button 
                            onClick={() => handleBookFlight(flight)}
                            className="bg-primary hover:bg-primary/90 w-full"
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            {flight.flight_type === 'charter' ? 'Cotizar' : 'Reservar'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Datos de aeropuertos argentinos e internacionales
const airports = [
  // Argentina - Principales
  { id: "eze", code: "EZE", name: "Aeropuerto Internacional Ezeiza", city: "Buenos Aires", country: "Argentina", lat: -34.8222, lng: -58.5358 },
  { id: "arp", code: "ARP", name: "Aeropuerto Jorge Newbery", city: "Buenos Aires", country: "Argentina", lat: -34.5592, lng: -58.4156 },
  { id: "cor", code: "COR", name: "Aeropuerto Córdoba", city: "Córdoba", country: "Argentina", lat: -31.3236, lng: -64.2081 },
  { id: "mdz", code: "MDZ", name: "Aeropuerto Mendoza", city: "Mendoza", country: "Argentina", lat: -32.8317, lng: -68.7928 },
  { id: "brc", code: "BRC", name: "Aeropuerto Bariloche", city: "San Carlos de Bariloche", country: "Argentina", lat: -41.1511, lng: -71.1575 },
  { id: "ush", code: "USH", name: "Aeropuerto Ushuaia", city: "Ushuaia", country: "Argentina", lat: -54.8433, lng: -68.295 },
  { id: "igt", code: "IGT", name: "Aeropuerto Iguazú", city: "Puerto Iguazú", country: "Argentina", lat: -25.7372, lng: -54.4736 },
  { id: "sla", code: "SLA", name: "Aeropuerto Salta", city: "Salta", country: "Argentina", lat: -24.8561, lng: -65.4864 },
  { id: "tuc", code: "TUC", name: "Aeropuerto Tucumán", city: "San Miguel de Tucumán", country: "Argentina", lat: -26.8409, lng: -65.1049 },
  { id: "rgl", code: "RGL", name: "Aeropuerto Río Gallegos", city: "Río Gallegos", country: "Argentina", lat: -51.6089, lng: -69.3128 },
  { id: "ftl", code: "FTL", name: "Aeropuerto Formosa", city: "Formosa", country: "Argentina", lat: -26.2128, lng: -58.2281 },
  { id: "res", code: "RES", name: "Aeropuerto Resistencia", city: "Resistencia", country: "Argentina", lat: -27.45, lng: -59.0561 },
  { id: "crd", code: "CRD", name: "Aeropuerto Comodoro Rivadavia", city: "Comodoro Rivadavia", country: "Argentina", lat: -45.7853, lng: -67.4656 },
  { id: "nqn", code: "NQN", name: "Aeropuerto Neuquén", city: "Neuquén", country: "Argentina", lat: -38.9489, lng: -68.1558 },
  { id: "pmr", code: "PMR", name: "Aeropuerto Puerto Madryn", city: "Puerto Madryn", country: "Argentina", lat: -42.7592, lng: -65.1028 },
  
  // Internacionales
  { id: "scl", code: "SCL", name: "Aeropuerto Santiago", city: "Santiago", country: "Chile", lat: -33.3928, lng: -70.7858 },
  { id: "pde", code: "PDE", name: "Aeropuerto Punta del Este", city: "Punta del Este", country: "Uruguay", lat: -34.8553, lng: -55.0944 },
  { id: "asu", code: "ASU", name: "Aeropuerto Asunción", city: "Asunción", country: "Paraguay", lat: -25.2397, lng: -57.5194 },
  { id: "gru", code: "GRU", name: "Aeropuerto São Paulo", city: "São Paulo", country: "Brasil", lat: -23.4356, lng: -46.4731 }
];

// Datos de aeronaves
const aircraft = [
  { id: "citation_cj3", model: "Citation CJ3+", manufacturer: "Cessna", capacity: 7, category: "light", hourly_rate: 2800 },
  { id: "learjet_75", model: "Learjet 75", manufacturer: "Bombardier", capacity: 8, category: "light", hourly_rate: 3200 },
  { id: "hawker_850xp", model: "Hawker 850XP", manufacturer: "Hawker Beechcraft", capacity: 8, category: "midsize", hourly_rate: 3800 },
  { id: "citation_sovereign", model: "Citation Sovereign", manufacturer: "Cessna", capacity: 9, category: "midsize", hourly_rate: 4200 },
  { id: "challenger_350", model: "Challenger 350", manufacturer: "Bombardier", capacity: 10, category: "midsize", hourly_rate: 4800 },
  { id: "gulfstream_g280", model: "Gulfstream G280", manufacturer: "Gulfstream", capacity: 10, category: "heavy", hourly_rate: 6500 },
  { id: "falcon_2000", model: "Falcon 2000", manufacturer: "Dassault", capacity: 12, category: "heavy", hourly_rate: 7200 },
  { id: "global_6000", model: "Global 6000", manufacturer: "Bombardier", capacity: 14, category: "ultra-long-range", hourly_rate: 9800 }
];

// Función para calcular distancia entre dos puntos
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

// Función para calcular duración de vuelo
function calculateFlightDuration(distance: number): number {
  const avgSpeed = 750; // km/h promedio para jets privados
  return Math.round((distance / avgSpeed) * 60); // en minutos
}

// Función para calcular precio basado en distancia y tipo de aeronave
function calculatePrice(distance: number, aircraft: any, flightType: string): { total: number, perSeat?: number } {
  const duration = calculateFlightDuration(distance);
  const basePrice = (duration / 60) * aircraft.hourly_rate;
  
  // Factores adicionales
  const fuelSurcharge = distance * 0.8; // USD por km
  const landingFees = 500; // USD fijo
  const operatorMargin = basePrice * 0.25; // 25% margen
  
  const totalPrice = Math.round(basePrice + fuelSurcharge + landingFees + operatorMargin);
  
  if (flightType === 'empty_leg') {
    // Empty legs son 60-80% más baratos
    const discountedTotal = Math.round(totalPrice * 0.3);
    const pricePerSeat = Math.round(discountedTotal / aircraft.capacity);
    return { total: discountedTotal, perSeat: pricePerSeat };
  }
  
  return { total: totalPrice };
}

// Generar vuelos empty legs
function generateEmptyLegFlights(): any[] {
  const flights = [];
  const operators = ["Aerolíneas Ejecutivas", "Sky Charter", "Elite Aviation", "Platinum Jets", "VIP Airways"];
  
  // Rutas populares dentro de Argentina
  const domesticRoutes = [
    ["eze", "cor"], ["eze", "mdz"], ["eze", "brc"], ["eze", "sla"], ["eze", "tuc"],
    ["eze", "igt"], ["eze", "ush"], ["eze", "rgl"], ["eze", "nqn"], ["eze", "crd"],
    ["arp", "cor"], ["arp", "mdz"], ["arp", "brc"], ["arp", "sla"], ["arp", "pmr"],
    ["cor", "mdz"], ["cor", "sla"], ["cor", "tuc"], ["mdz", "brc"], ["sla", "tuc"],
    ["brc", "ush"], ["brc", "nqn"], ["nqn", "crd"], ["crd", "rgl"], ["igt", "sla"]
  ];
  
  // Rutas internacionales
  const internationalRoutes = [
    ["eze", "scl"], ["eze", "pde"], ["eze", "asu"], ["eze", "gru"],
    ["arp", "scl"], ["arp", "pde"], ["cor", "scl"], ["mdz", "scl"],
    ["brc", "scl"], ["sla", "asu"], ["igt", "asu"]
  ];
  
  const allRoutes = [...domesticRoutes, ...internationalRoutes];
  
  // Generar fechas para los próximos 30 días
  const today = new Date();
  
  let flightId = 1;
  
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const flightDate = new Date(today);
    flightDate.setDate(today.getDate() + dayOffset);
    
    // 2-4 vuelos por día
    const flightsPerDay = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < flightsPerDay; i++) {
      const route = allRoutes[Math.floor(Math.random() * allRoutes.length)];
      const aircraftData = aircraft[Math.floor(Math.random() * aircraft.length)];
      
      const depAirport = airports.find(a => a.id === route[0]);
      const arrAirport = airports.find(a => a.id === route[1]);
      
      if (!depAirport || !arrAirport) continue;
      
      const distance = calculateDistance(depAirport.lat, depAirport.lng, arrAirport.lat, arrAirport.lng);
      const duration = calculateFlightDuration(distance);
      const pricing = calculatePrice(distance, aircraftData, 'empty_leg');
      
      // Horarios aleatorios
      const depHour = Math.floor(Math.random() * 16) + 6; // 6 AM a 10 PM
      const depMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
      
      const depTime = `${depHour.toString().padStart(2, '0')}:${depMinute.toString().padStart(2, '0')}`;
      
      // Calcular hora de llegada
      const arrivalTime = new Date(flightDate);
      arrivalTime.setHours(depHour, depMinute);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + duration);
      
      const arrTime = `${arrivalTime.getHours().toString().padStart(2, '0')}:${arrivalTime.getMinutes().toString().padStart(2, '0')}`;
      
      // Fecha de llegada (puede ser el día siguiente)
      const arrDate = new Date(flightDate);
      if (arrivalTime.getDate() !== flightDate.getDate()) {
        arrDate.setDate(arrDate.getDate() + 1);
      }
      
      const availableSeats = Math.floor(Math.random() * (aircraftData.capacity - 2)) + 1; // 1 a capacity-2 asientos
      
      flights.push({
        id: `empty_leg_${flightId.toString().padStart(3, '0')}`,
        flight_type: 'empty_leg',
        aircraft_id: aircraftData.id,
        aircraft: aircraftData,
        departure_airport_id: depAirport.id,
        departure_airport: depAirport,
        arrival_airport_id: arrAirport.id,
        arrival_airport: arrAirport,
        departure_date: flightDate.toISOString().split('T')[0],
        departure_time: depTime,
        arrival_date: arrDate.toISOString().split('T')[0],
        arrival_time: arrTime,
        duration_minutes: duration,
        distance_km: distance,
        price_total: pricing.total,
        price_per_seat: pricing.perSeat,
        available_seats: availableSeats,
        status: 'available',
        operator: operators[Math.floor(Math.random() * operators.length)]
      });
      
      flightId++;
      
      if (flights.length >= 60) break;
    }
    
    if (flights.length >= 60) break;
  }
  
  return flights.slice(0, 60);
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    if (path === '/flights' && req.method === 'GET') {
      // Obtener parámetros de búsqueda
      const flightType = url.searchParams.get('type') || 'empty_leg';
      const origin = url.searchParams.get('origin');
      const destination = url.searchParams.get('destination');
      const date = url.searchParams.get('date');
      const maxPrice = url.searchParams.get('maxPrice');
      
      let flights = generateEmptyLegFlights();
      
      // Aplicar filtros
      if (origin) {
        flights = flights.filter(f => f.departure_airport_id === origin);
      }
      
      if (destination) {
        flights = flights.filter(f => f.arrival_airport_id === destination);
      }
      
      if (date) {
        flights = flights.filter(f => f.departure_date === date);
      }
      
      if (maxPrice) {
        const maxPriceNum = parseInt(maxPrice);
        flights = flights.filter(f => f.price_per_seat <= maxPriceNum);
      }
      
      // Ordenar por fecha y hora
      flights.sort((a, b) => {
        const dateA = new Date(`${a.departure_date}T${a.departure_time}`);
        const dateB = new Date(`${b.departure_date}T${b.departure_time}`);
        return dateA.getTime() - dateB.getTime();
      });
      
      return new Response(JSON.stringify({
        success: true,
        data: flights,
        total: flights.length
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    if (path === '/airports' && req.method === 'GET') {
      return new Response(JSON.stringify({
        success: true,
        data: airports
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    if (path === '/aircraft' && req.method === 'GET') {
      return new Response(JSON.stringify({
        success: true,
        data: aircraft
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    if (path === '/quote' && req.method === 'POST') {
      const body = await req.json();
      const { origin, destination, aircraft_id, passengers, date } = body;
      
      const depAirport = airports.find(a => a.id === origin);
      const arrAirport = airports.find(a => a.id === destination);
      const aircraftData = aircraft.find(a => a.id === aircraft_id);
      
      if (!depAirport || !arrAirport || !aircraftData) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid parameters'
        }), { status: 400 });
      }
      
      const distance = calculateDistance(depAirport.lat, depAirport.lng, arrAirport.lat, arrAirport.lng);
      const duration = calculateFlightDuration(distance);
      const pricing = calculatePrice(distance, aircraftData, 'charter');
      
      const quote = {
        origin: depAirport,
        destination: arrAirport,
        aircraft: aircraftData,
        distance_km: distance,
        duration_minutes: duration,
        total_price: pricing.total,
        price_per_person: Math.round(pricing.total / passengers),
        passengers: passengers,
        date: date
      };
      
      return new Response(JSON.stringify({
        success: true,
        data: quote
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Endpoint not found'
    }), { 
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
});
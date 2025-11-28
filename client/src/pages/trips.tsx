import Layout from "@/components/layout";
import TripCard from "@/components/trip-card";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function TripsPage() {
  const { trips } = useStore();
  const [filter, setFilter] = useState("All");

  const regions = ["All", "Europe", "Asia", "Africa", "Americas"];
  
  // Simple mock filtering logic based on location text
  const filteredTrips = filter === "All" 
    ? trips 
    : trips.filter(t => {
        if (filter === "Europe") return t.location.includes("France") || t.location.includes("Italy") || t.location.includes("Greece") || t.location.includes("Switzerland");
        if (filter === "Asia") return t.location.includes("Japan") || t.location.includes("Indonesia") || t.location.includes("Bali") || t.location.includes("Thailand");
        if (filter === "Africa") return t.location.includes("Tanzania") || t.location.includes("South Africa") || t.location.includes("Morocco");
        if (filter === "Americas") return t.location.includes("USA") || t.location.includes("Mexico") || t.location.includes("Peru");
        return true;
    });

  return (
    <Layout>
      <div className="bg-primary py-20 text-center text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')] bg-cover bg-center" />
         <div className="relative z-10 container mx-auto px-6">
            <h1 className="font-serif text-5xl font-bold mb-4">Signature Journeys</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Immersive travel experiences designed to inspire and rejuvenate.</p>
         </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-wrap gap-4 mb-10 justify-center">
           {regions.map(region => (
             <Button 
               key={region}
               variant={filter === region ? "default" : "ghost"} 
               className={`rounded-full ${filter === region ? "bg-primary text-white" : "hover:bg-primary/5"}`}
               onClick={() => setFilter(region)}
             >
               {region}
             </Button>
           ))}
        </div>

        {filteredTrips.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No trips found for this region. Check back soon for new additions!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrips.map((trip) => (
              <TripCard 
                key={trip.id}
                id={trip.id}
                image={trip.image}
                title={trip.title}
                location={trip.location}
                price={trip.price}
                rating={trip.rating}
                duration={trip.duration}
                type="trip"
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
import Layout from "@/components/layout";
import TripCard from "@/components/trip-card";
import { useStore } from "@/lib/store-context";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isWithinInterval, parseISO } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export default function HotelsPage() {
  const { hotels } = useStore();
  const [searchLocation, setSearchLocation] = useState("");
  const [date, setDate] = useState<DateRange | undefined>();

  const filteredHotels = hotels.filter(hotel => {
    // Filter by location
    if (searchLocation && !hotel.location.toLowerCase().includes(searchLocation.toLowerCase())) {
      return false;
    }

    // Filter by Active Status (if property exists, default to true if not present for backward compatibility)
    if (hotel.isActive === false) return false;

    // Filter by Date Availability
    if (date?.from && date?.to) {
      if (hotel.alwaysAvailable) return true;
      
      if (hotel.availableFrom && hotel.availableTo) {
        const hotelStart = parseISO(hotel.availableFrom);
        const hotelEnd = parseISO(hotel.availableTo);
        
        // Simple logic: Check if user's requested start date is within hotel's open period
        // More complex logic would be checking full overlap
        const isStartValid = isWithinInterval(date.from, { start: hotelStart, end: hotelEnd });
        // const isEndValid = isWithinInterval(date.to, { start: hotelStart, end: hotelEnd });
        
        return isStartValid;
      }
      
      // If hotel has no dates set but is not always available, maybe assume unavailable? 
      // Or assume available. Let's assume unavailable if strict dates required but missing.
      return false; 
    }

    return true;
  });

  return (
    <Layout>
      <div className="bg-primary py-20 text-center text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
         <div className="relative z-10 container mx-auto px-6">
            <h1 className="font-serif text-5xl font-bold mb-4">Luxury Stays</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">Handpicked hotels and resorts offering unparalleled comfort and style.</p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20 shadow-xl flex flex-col md:flex-row gap-4">
               <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-3 text-white/70 w-5 h-5" />
                  <Input 
                    placeholder="Where do you want to stay?" 
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
               </div>
               
               <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white",
                          !date && "text-white/60"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} -{" "}
                              {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Check-in - Check-out</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
               </div>
               
               <Button className="bg-secondary hover:bg-secondary/90 text-white min-w-[120px]">
                  <Search className="w-4 h-4 mr-2" /> Search
               </Button>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        {filteredHotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHotels.map((hotel) => (
              <TripCard 
                key={hotel.id}
                id={hotel.id}
                image={hotel.image}
                title={hotel.title}
                location={hotel.location}
                price={hotel.price}
                rating={hotel.rating}
                type="hotel"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-serif font-bold mb-2">No hotels found</h3>
            <p className="text-muted-foreground">Try adjusting your search dates or location.</p>
            <Button 
              variant="link" 
              onClick={() => { setSearchLocation(""); setDate(undefined); }}
              className="mt-4 text-secondary"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
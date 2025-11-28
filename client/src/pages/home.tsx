import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImage from "@assets/generated_images/luxury_bora_bora_overwater_bungalows_at_sunset.png";
import TripCard from "@/components/trip-card";
import LastMinuteCard from "@/components/last-minute-card";
import { useStore } from "@/lib/store-context";
import { ArrowRight, Globe, Shield, Star, Clock, Car } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { trips, hotels, cars, offers, loading } = useStore();
  const featuredTrips = trips.slice(0, 3);
  const featuredCars = cars.slice(0, 3);
  const featuredOffers = offers.slice(0, 3);
  const featuredHotel = hotels[0];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Luxury Travel Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight drop-shadow-lg">
              Discover the <span className="text-secondary italic">Extraordinary</span>
            </h1>
            <p className="text-lg md:text-2xl font-light max-w-2xl mx-auto mb-10 text-white/90 drop-shadow-md">
              Curated luxury travel experiences for those who seek the world's most exclusive destinations.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/trips">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  Explore Journeys
                </Button>
              </Link>
              <Link href="/hotels">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white hover:text-primary rounded-full px-8 py-6 text-lg font-medium text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  View Hotels
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce">
           <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
             <div className="w-1 h-2 bg-white rounded-full" />
           </div>
        </div>
      </section>

      {/* Last Minute Offers Section */}
      <section className="py-20 bg-gradient-to-b from-background to-red-50/50 dark:to-red-950/20">
         <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-destructive font-bold uppercase tracking-widest text-sm block">Limited Time Only</span>
                   <Clock className="w-4 h-4 text-destructive animate-pulse" />
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary">Last Minute Offers</h2>
              </div>
              <Link href="/last-minute">
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-white mt-4 md:mt-0 group">
                  View All Deals <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {featuredOffers.map((offer) => (
                 <LastMinuteCard key={offer.id} {...offer} />
               ))}
            </div>
         </div>
      </section>

      {/* Value Props */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-2">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold">Global Access</h3>
              <p className="text-muted-foreground leading-relaxed">
                Exclusive entry to the world's most coveted destinations and hidden gems.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-2">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold">Premium Service</h3>
              <p className="text-muted-foreground leading-relaxed">
                24/7 concierge support ensuring every detail of your journey is flawless.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-2">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold">Secure Booking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Peace of mind with our secure payment systems and flexible cancellation policies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Trips */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <span className="text-secondary font-bold uppercase tracking-widest text-sm mb-2 block">Curated Collections</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary">Featured Journeys</h2>
            </div>
            <Link href="/trips">
              <Button variant="ghost" className="group text-primary mt-4 md:mt-0">
                View All Trips <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTrips.map((trip) => (
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
        </div>
      </section>

      {/* Hotels Teaser (Linked) */}
      {featuredHotel && (
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 cursor-pointer group">
              <Link href={`/details/hotel/${featuredHotel.id}`}>
                <div className="relative rounded-lg overflow-hidden shadow-2xl h-[500px]">
                  <img 
                    src={featuredHotel.image} 
                    alt="Luxury Hotel" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>
              </Link>
              <div className="hidden lg:block absolute -bottom-10 -left-10 w-48 h-48 bg-secondary/10 rounded-full z-[-1]" />
              <div className="hidden lg:block absolute -top-10 -right-10 w-32 h-32 border-2 border-secondary rounded-full z-[-1]" />
            </div>
            <div className="order-1 lg:order-2 space-y-8">
              <span className="text-secondary font-bold uppercase tracking-widest text-sm">Sanctuaries</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary leading-tight">
                Stay in the World's Most Exceptional Hotels
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                From private islands in the Maldives to historic palaces in Paris, we handpick accommodations that define luxury.
              </p>
              <Link href="/hotels">
                <Button size="lg" className="bg-primary text-white hover:bg-primary/90 rounded-full px-8">
                  Find Your Stay
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Rental Cars Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <span className="text-secondary font-bold uppercase tracking-widest text-sm mb-2 block">Drive in Style</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary">Premium Rentals</h2>
            </div>
            <Link href="/cars">
              <Button variant="ghost" className="group text-primary mt-4 md:mt-0">
                View All Cars <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <TripCard 
                key={car.id}
                id={car.id}
                image={car.image}
                title={car.title}
                location={car.location}
                price={car.price}
                rating={car.rating}
                type="car"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6">Ready for your next adventure?</h2>
          <p className="text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10">
            Let our travel specialists craft a bespoke itinerary just for you.
          </p>
          <Link href="/trips">
            <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 rounded-full px-10 py-6 text-lg shadow-xl">
              Start Planning
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
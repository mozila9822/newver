import Layout from "@/components/layout";
import TripCard from "@/components/trip-card";
import { useStore } from "@/lib/store-context";

export default function CarsPage() {
  const { cars } = useStore();

  return (
    <Layout>
      <div className="bg-primary py-20 text-center text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
         <div className="relative z-10 container mx-auto px-6">
            <h1 className="font-serif text-5xl font-bold mb-4">Private Transport</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Arrive in style with our fleet of luxury vehicles and private jets.</p>
         </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
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
    </Layout>
  );
}
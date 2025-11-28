import Layout from "@/components/layout";
import LastMinuteCard from "@/components/last-minute-card";
import { useStore } from "@/lib/store-context";
import { Clock, AlertCircle } from "lucide-react";

export default function LastMinutePage() {
  const { offers } = useStore();

  return (
    <Layout>
      <div className="bg-destructive/90 py-20 text-center text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center" />
         <div className="relative z-10 container mx-auto px-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-sm font-bold mb-6 animate-pulse border border-white/30">
               <Clock className="w-4 h-4" />
               <span>Limited Time Offers</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">Last Minute Deals</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">Spontaneous luxury at unprecedented value. These offers expire soon.</p>
         </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-12 flex items-start gap-3 text-yellow-800 max-w-3xl mx-auto">
           <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
           <p className="text-sm">
             <strong>Note:</strong> Last minute offers are non-refundable and require immediate payment confirmation. Prices shown include all taxes and fees.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <LastMinuteCard 
              key={offer.id}
              {...offer}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
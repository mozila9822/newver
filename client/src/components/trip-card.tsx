import { motion } from "framer-motion";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useStore } from "@/lib/store-context";

interface TripCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  price: string;
  rating: number;
  duration?: string;
  type: "trip" | "hotel" | "car" | "offer";
}

export default function TripCard({ id, image, title, location, price, rating, duration, type }: TripCardProps) {
  const { getReviewCount } = useStore();
  const reviewCount = getReviewCount(id, type);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative bg-card rounded-lg overflow-hidden border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
    >
      <Link href={`/details/${type}/${id}`} className="absolute inset-0 z-20 focus:outline-none">
        <span className="sr-only">View details for {title}</span>
      </Link>

      <div className="relative h-[240px] overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-primary shadow-sm z-10 pointer-events-none">
          {type === "trip" ? "Package" : type === "hotel" ? "Stay" : type === "car" ? "Rental" : "Deal"}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
          <MapPin className="w-3 h-3 text-secondary" />
          <span>{location}</span>
        </div>
        
        <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-secondary transition-colors">{title}</h3>
        
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-secondary text-secondary" />
            <span className="font-medium">{rating}</span>
            <span className="text-muted-foreground text-xs">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
          </div>
          {duration && (
            <div className="text-muted-foreground border-l border-border pl-4">
              {duration}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between gap-2 relative z-30">
          <div>
            <span className="text-xs text-muted-foreground block">Starting from</span>
            <span className="text-lg font-bold text-primary">{price}</span>
          </div>
          <Link href={`/details/${type}/${id}`}>
            <Button 
              variant="outline" 
              className="border-primary/20 hover:bg-primary hover:text-white group-hover:border-primary transition-all"
            >
              Book <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
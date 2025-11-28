import { motion } from "framer-motion";
import { MapPin, Star, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useStore } from "@/lib/store-context";

interface LastMinuteCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  price: string;
  originalPrice: string;
  rating: number;
  endsIn: string;
  discount: string;
}

export default function LastMinuteCard({ id, image, title, location, price, originalPrice, rating, endsIn, discount }: LastMinuteCardProps) {
  const { getReviewCount } = useStore();
  const reviewCount = getReviewCount(id, 'offer');
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative bg-card rounded-lg overflow-hidden border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full ring-1 ring-destructive/10"
    >
      <Link href={`/details/offer/${id}`} className="absolute inset-0 z-20 focus:outline-none">
        <span className="sr-only">View offer details for {title}</span>
      </Link>

      <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <Badge variant="destructive" className="font-bold animate-pulse">{discount}</Badge>
      </div>

      <div className="relative h-[260px] overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
        
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-red-300 border border-red-500/30">
              <Clock className="w-3 h-3" />
              <span>Ends in: {endsIn}</span>
            </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-white to-red-50/30 dark:from-gray-900 dark:to-red-900/10">
        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
          <MapPin className="w-3 h-3 text-destructive" />
          <span>{location}</span>
        </div>
        
        <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-destructive transition-colors">{title}</h3>
        
        <div className="flex items-center gap-1 mb-4 text-sm">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{rating}</span>
          <span className="text-muted-foreground text-xs ml-1">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
        </div>

        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between gap-2 relative z-30">
          <div>
            <span className="text-xs text-muted-foreground block line-through">{originalPrice}</span>
            <span className="text-2xl font-bold text-destructive">{price}</span>
          </div>
          <Link href={`/details/offer/${id}`}>
            <Button 
              className="bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20"
            >
              Claim <Tag className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
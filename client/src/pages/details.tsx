import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import Layout from "@/components/layout";
import { useStore, Review } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MapPin, Star, Check, ArrowLeft, Share2, Heart, Clock, Shield, Globe, User } from "lucide-react";
import BookingModal from "@/components/booking-modal";
import { useToast } from "@/hooks/use-toast";

export default function DetailsPage() {
  const [match, params] = useRoute("/details/:type/:id");
  const { trips, hotels, cars, offers, getApprovedReviewsByItem, reviews } = useStore();
  const { toast } = useToast();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [itemReviews, setItemReviews] = useState<Review[]>([]);

  const type = params?.type;
  const id = params?.id;

  // Find the item
  let item: any;
  if (type === "trip") item = trips.find(t => t.id === id);
  else if (type === "hotel") item = hotels.find(h => h.id === id);
  else if (type === "car") item = cars.find(c => c.id === id);
  else if (type === "offer") item = offers.find(o => o.id === id);

  // Room Type Selection
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("");
  
  useEffect(() => {
    if (item && item.roomTypes && item.roomTypes.length > 0 && !selectedRoomTypeId) {
      setSelectedRoomTypeId(item.roomTypes[0].id);
    }
  }, [item, selectedRoomTypeId]);

  // Fetch reviews for this item
  useEffect(() => {
    const fetchItemReviews = async () => {
      if (type && id) {
        const fetchedReviews = await getApprovedReviewsByItem(id, type);
        setItemReviews(fetchedReviews);
      }
    };
    fetchItemReviews();
  }, [type, id, reviews]); // Re-fetch when global reviews change

  // Calculate the average rating from reviews
  const avgRating = itemReviews.length > 0 
    ? (itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length).toFixed(1)
    : item?.rating;

  const selectedRoomType = item?.roomTypes?.find((r: any) => r.id === selectedRoomTypeId);
  const currentPrice = selectedRoomType ? selectedRoomType.price : item?.price;

  if (!item) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Item not found</h1>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Normalize data structure for display
  const features = item.features || item.amenities || [];
  const specs = item.specs; // for cars

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied", description: "Page URL copied to clipboard." });
  };

  return (
    <Layout>
      {/* Hero Image with Overlay */}
      <div className="relative h-[60vh] w-full">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute top-4 left-0 right-0 container mx-auto px-6 flex justify-between items-start">
           <Link href={type === 'offer' ? '/last-minute' : `/${type}s`}>
             <Button variant="secondary" size="sm" className="rounded-full backdrop-blur-md bg-white/20 hover:bg-white/40 border-none text-white">
               <ArrowLeft className="w-4 h-4 mr-2" /> Back to {type}s
             </Button>
           </Link>
           <div className="flex gap-2">
             <Button 
               variant="secondary" 
               size="icon" 
               className="rounded-full backdrop-blur-md bg-white/20 hover:bg-white/40 border-none text-white"
               onClick={handleShare}
             >
               <Share2 className="w-4 h-4" />
             </Button>
             <Button 
               variant="secondary" 
               size="icon" 
               className={`rounded-full backdrop-blur-md bg-white/20 hover:bg-white/40 border-none ${isFavorite ? 'text-red-500' : 'text-white'}`}
               onClick={() => setIsFavorite(!isFavorite)}
             >
               <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
             </Button>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-32 relative z-10 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
               <div className="flex items-center gap-2 mb-2">
                 <Badge variant="secondary" className="uppercase tracking-widest text-xs">{type === 'offer' ? 'Last Minute Deal' : type}</Badge>
                 {item.category && <Badge variant="outline" className="bg-white/10 backdrop-blur border-white/20 text-white">{item.category}</Badge>}
               </div>
               <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 drop-shadow-sm">{item.title}</h1>
               <div className="flex items-center gap-4 text-white/80 text-sm">
                 <div className="flex items-center gap-1">
                   <MapPin className="w-4 h-4" /> {item.location}
                 </div>
                 <div className="flex items-center gap-1">
                   <Star className="w-4 h-4 fill-secondary text-secondary" /> {avgRating} ({itemReviews.length} review{itemReviews.length !== 1 ? 's' : ''})
                 </div>
                 {item.duration && (
                   <div className="flex items-center gap-1">
                     <Clock className="w-4 h-4" /> {item.duration}
                   </div>
                 )}
               </div>
            </div>

            <div className="bg-card rounded-xl p-8 shadow-sm border border-border/50">
              <h2 className="text-2xl font-serif font-bold mb-4">Overview</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Experience the epitome of luxury with our {item.title}. Meticulously curated to ensure an unforgettable journey, 
                this exclusive package offers unparalleled access to the finest amenities and personalized services. 
                Whether you seek relaxation, adventure, or cultural immersion, this is the perfect choice for the discerning traveler.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                 <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-bold mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-secondary" /> Premium Inclusions</h3>
                    <ul className="space-y-2">
                      {features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                 </div>
                 {specs && (
                   <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="font-bold mb-2 flex items-center gap-2"><Globe className="w-4 h-4 text-secondary" /> Specifications</h3>
                      <p className="text-sm text-muted-foreground">{specs}</p>
                   </div>
                 )}
              </div>
            </div>
            
            {/* Gallery (Mock) */}
            <div>
               <h2 className="text-2xl font-serif font-bold mb-4">Gallery</h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-square rounded-lg bg-muted overflow-hidden">
                       <img src={`https://source.unsplash.com/random/400x400?luxury,travel,${i}`} alt="Gallery" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                    </div>
                  ))}
               </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-card rounded-xl p-8 shadow-sm border border-border/50">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif font-bold">Guest Reviews</h2>
                  {itemReviews.length > 0 && (
                    <div className="flex items-center gap-2">
                       <Star className="w-5 h-5 fill-secondary text-secondary" />
                       <span className="text-xl font-bold">{avgRating}</span>
                       <span className="text-muted-foreground">({itemReviews.length} review{itemReviews.length !== 1 ? 's' : ''})</span>
                    </div>
                  )}
               </div>

               {itemReviews.length > 0 ? (
                  <div className="space-y-6">
                     {itemReviews.map((review) => (
                        <div key={review.id} className="border-b border-border/50 pb-6 last:border-0 last:pb-0">
                           <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                 <User className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                 <div className="flex items-center justify-between mb-2">
                                    <div>
                                       <h4 className="font-semibold">{review.userName}</h4>
                                       {review.createdAt && (
                                          <p className="text-xs text-muted-foreground">
                                             {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                             })}
                                          </p>
                                       )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                       {[...Array(5)].map((_, i) => (
                                          <Star 
                                             key={i} 
                                             className={`w-4 h-4 ${i < review.rating ? 'fill-secondary text-secondary' : 'text-muted'}`} 
                                          />
                                       ))}
                                    </div>
                                 </div>
                                 <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-8">
                     <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
                  </div>
               )}
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
             <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50 sticky top-24">
                <div className="mb-6">
                   <p className="text-sm text-muted-foreground mb-1">Starting from</p>
                   <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-primary">{currentPrice}</span>
                      {item.originalPrice && <span className="text-lg text-muted-foreground line-through mb-1">{item.originalPrice}</span>}
                   </div>
                   {type === 'hotel' && <span className="text-sm text-muted-foreground">per night</span>}
                </div>

                {type === 'hotel' && item.roomTypes && item.roomTypes.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <Label>Select Room Type</Label>
                    <RadioGroup value={selectedRoomTypeId} onValueChange={setSelectedRoomTypeId}>
                      {item.roomTypes.map((room: any) => (
                        <div key={room.id} className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all ${selectedRoomTypeId === room.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={room.id} id={room.id} />
                            <Label htmlFor={room.id} className="cursor-pointer font-medium">
                              {room.name}
                              {room.description && <span className="block text-xs text-muted-foreground font-normal mt-0.5">{room.description}</span>}
                            </Label>
                          </div>
                          <span className="text-sm font-bold">{room.price}</span>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {selectedRoomType && selectedRoomType.facilities && selectedRoomType.facilities.length > 0 && (
                   <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-2">
                      <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                         <Star className="w-3 h-3 text-secondary fill-secondary" /> 
                         {selectedRoomType.name} Exclusives
                      </h4>
                      <div className="flex flex-wrap gap-2">
                         {selectedRoomType.facilities.map((facility: string, idx: number) => (
                            <span key={idx} className="text-xs bg-background px-2 py-1 rounded border text-muted-foreground flex items-center gap-1">
                               <Check className="w-3 h-3 text-green-600" /> {facility}
                            </span>
                         ))}
                      </div>
                   </div>
                )}

                <div className="space-y-4 mb-6">
                   <div className="flex justify-between text-sm py-2 border-b">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{item.duration || "Flexible"}</span>
                   </div>
                   <div className="flex justify-between text-sm py-2 border-b">
                      <span className="text-muted-foreground">Max Guests</span>
                      <span className="font-medium">2 Adults, 1 Child</span>
                   </div>
                   <div className="flex justify-between text-sm py-2 border-b">
                      <span className="text-muted-foreground">Cancellation</span>
                      <span className="font-medium text-green-600">Free up to 48h</span>
                   </div>
                </div>

                <Button size="lg" className="w-full mb-4" onClick={() => setIsBookingOpen(true)}>
                  Book Now
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                   No payment charged yet. Availability is confirmed instantly.
                </p>
             </div>
          </div>
        </div>
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        itemTitle={item.title}
        itemPrice={currentPrice}
        subTitle={selectedRoomType ? `Room Type: ${selectedRoomType.name}` : undefined}
      />
    </Layout>
  );
}

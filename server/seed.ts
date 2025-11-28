import { db } from "./db";
import { trips, hotels, roomTypes, cars, lastMinuteOffers, bookings, reviews } from "@shared/schema";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Seed trips
    await db.insert(trips).values([
      {
        id: "t1",
        title: "Santorini Sunset Escape",
        location: "Santorini, Greece",
        image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=1000&auto=format&fit=crop",
        price: "$3,200",
        rating: "4.9",
        duration: "7 Days",
        category: "Romantic",
        features: ["All Inclusive", "Private Transfers", "Sunset Cruise"]
      },
      {
        id: "t2",
        title: "Kyoto Autumn Retreat",
        location: "Kyoto, Japan",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop",
        price: "$4,500",
        rating: "5.0",
        duration: "10 Days",
        category: "Cultural",
        features: ["Guided Tours", "Tea Ceremony", "Meals Included"]
      },
      {
        id: "t3",
        title: "Amalfi Coast Drive",
        location: "Amalfi, Italy",
        image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1000&auto=format&fit=crop",
        price: "$5,100",
        rating: "4.8",
        duration: "8 Days",
        category: "Luxury",
        features: ["Luxury Car Rental", "5-Star Hotels", "Breakfast Daily"]
      },
      {
        id: "t4",
        title: "Safari in Serengeti",
        location: "Tanzania",
        image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1000&auto=format&fit=crop",
        price: "$6,800",
        rating: "4.9",
        duration: "9 Days",
        category: "Adventure",
        features: ["Game Drives", "Park Fees", "Full Board"]
      }
    ]).onConflictDoNothing();

    // Seed hotels
    await db.insert(hotels).values([
      {
        id: "h1",
        title: "The Grand Palace",
        location: "Paris, France",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
        price: "$850/night",
        rating: "4.9",
        amenities: ["Spa", "Michelin Dining", "City View", "WiFi", "Concierge"],
        alwaysAvailable: true,
        isActive: true
      },
      {
        id: "h2",
        title: "Azure Resort & Spa",
        location: "Maldives",
        image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1000&auto=format&fit=crop",
        price: "$1,200/night",
        rating: "5.0",
        amenities: ["Overwater Villa", "Private Pool", "Butler", "Spa", "Gym"],
        alwaysAvailable: true,
        isActive: true
      },
      {
        id: "h3",
        title: "Alpine Lodge",
        location: "Zermatt, Switzerland",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop",
        price: "$950/night",
        rating: "4.8",
        amenities: ["Ski-in/Ski-out", "Fireplace", "Spa", "Restaurant"],
        alwaysAvailable: false,
        isActive: true,
        availableFrom: "2024-12-01",
        availableTo: "2025-04-30"
      }
    ]).onConflictDoNothing();

    // Seed room types for hotels
    await db.insert(roomTypes).values([
      {
        id: "rt1",
        hotelId: "h1",
        name: "Deluxe Room",
        price: "$850",
        description: "Spacious room with city view",
        facilities: ["City View", "Mini Bar", "Rain Shower"]
      },
      {
        id: "rt2",
        hotelId: "h1",
        name: "Executive Suite",
        price: "$1,250",
        description: "Separate living area and premium amenities",
        facilities: ["Lounge Access", "Jacuzzi", "Work Desk", "City View"]
      },
      {
        id: "rt3",
        hotelId: "h1",
        name: "Presidential Suite",
        price: "$3,500",
        description: "Ultimate luxury with panoramic views",
        facilities: ["Private Butler", "Grand Piano", "Sauna", "Panoramic Terrace"]
      }
    ]).onConflictDoNothing();

    // Seed cars
    await db.insert(cars).values([
      {
        id: "c1",
        title: "Convertible GT",
        location: "Monaco",
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1000&auto=format&fit=crop",
        price: "$1,500/day",
        rating: "5.0",
        specs: "Automatic • 2 Seats",
        features: ["GPS", "Bluetooth", "Sport Mode", "Convertible Top"]
      },
      {
        id: "c2",
        title: "Luxury SUV",
        location: "Dubai, UAE",
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop",
        price: "$900/day",
        rating: "4.7",
        specs: "Automatic • 5 Seats",
        features: ["GPS", "Leather Seats", "Sunroof", "All-Wheel Drive"]
      },
      {
        id: "c3",
        title: "Classic Vintage",
        location: "Tuscany, Italy",
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop",
        price: "$1,100/day",
        rating: "4.9",
        specs: "Manual • 2 Seats",
        features: ["Vintage Style", "Convertible", "Manual Transmission"]
      }
    ]).onConflictDoNothing();

    // Seed last minute offers
    await db.insert(lastMinuteOffers).values([
      {
        id: "lm1",
        title: "Bali Beach Villa - 48h Sale",
        location: "Bali, Indonesia",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop",
        price: "$1,800",
        originalPrice: "$3,200",
        rating: "4.8",
        endsIn: "12h 30m",
        discount: "45% OFF"
      },
      {
        id: "lm2",
        title: "New York Weekend",
        location: "New York, USA",
        image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000&auto=format&fit=crop",
        price: "$1,200",
        originalPrice: "$1,800",
        rating: "4.7",
        endsIn: "08h 15m",
        discount: "33% OFF"
      },
      {
        id: "lm3",
        title: "Swiss Alps Chalet",
        location: "Interlaken, Switzerland",
        image: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=80&w=1000&auto=format&fit=crop",
        price: "$2,100",
        originalPrice: "$2,800",
        rating: "4.9",
        endsIn: "24h 00m",
        discount: "25% OFF"
      }
    ]).onConflictDoNothing();

    // Seed bookings
    await db.insert(bookings).values([
      {
        id: "BKG-001",
        customer: "Alice Freeman",
        item: "Santorini Sunset Escape",
        date: "2024-05-12",
        status: "Confirmed",
        amount: "$3,200"
      },
      {
        id: "BKG-002",
        customer: "Robert Chen",
        item: "The Grand Palace",
        date: "2024-06-01",
        status: "Pending",
        amount: "$2,550"
      },
      {
        id: "BKG-003",
        customer: "Elena Rodriguez",
        item: "Convertible GT",
        date: "2024-06-15",
        status: "Cancelled",
        amount: "$4,500"
      },
      {
        id: "BKG-004",
        customer: "David Smith",
        item: "Kyoto Autumn Retreat",
        date: "2024-10-20",
        status: "Cancelled",
        amount: "$4,500"
      },
      {
        id: "BKG-005",
        customer: "Sarah Johnson",
        item: "Azure Resort & Spa",
        date: "2024-07-08",
        status: "Confirmed",
        amount: "$6,000"
      }
    ]).onConflictDoNothing();

    // Seed reviews
    await db.insert(reviews).values([
      {
        id: "rev-1",
        itemId: "t1",
        itemType: "trip",
        itemTitle: "Santorini Sunset Escape",
        userName: "Alice Freeman",
        userEmail: "alice@example.com",
        rating: 5,
        comment: "Absolutely breathtaking views! The sunset cruise was the highlight of our trip. The private transfers were seamless and the whole experience exceeded our expectations.",
        status: "approved"
      },
      {
        id: "rev-2",
        itemId: "t1",
        itemType: "trip",
        itemTitle: "Santorini Sunset Escape",
        userName: "Michael Davis",
        userEmail: "michael@example.com",
        rating: 5,
        comment: "An unforgettable romantic getaway. Every detail was perfectly planned. Highly recommend for couples!",
        status: "approved"
      },
      {
        id: "rev-3",
        itemId: "h1",
        itemType: "hotel",
        itemTitle: "The Grand Palace",
        userName: "Robert Chen",
        userEmail: "robert@example.com",
        rating: 5,
        comment: "Exceptional service and stunning location. The Presidential Suite was worth every penny. The staff went above and beyond.",
        status: "approved"
      },
      {
        id: "rev-4",
        itemId: "h1",
        itemType: "hotel",
        itemTitle: "The Grand Palace",
        userName: "Emma Wilson",
        userEmail: "emma@example.com",
        rating: 4,
        comment: "Beautiful hotel with amazing amenities. The spa was incredible. Only minor issue was the slow room service on one occasion.",
        status: "approved"
      },
      {
        id: "rev-5",
        itemId: "h2",
        itemType: "hotel",
        itemTitle: "Azure Resort & Spa",
        userName: "Sarah Johnson",
        userEmail: "sarah@example.com",
        rating: 5,
        comment: "Paradise on Earth! The overwater villa was a dream come true. Private pool, personal butler - pure luxury.",
        status: "approved"
      },
      {
        id: "rev-6",
        itemId: "c1",
        itemType: "car",
        itemTitle: "Convertible GT",
        userName: "Elena Rodriguez",
        userEmail: "elena@example.com",
        rating: 4,
        comment: "Driving the Convertible GT through Monaco was an amazing experience! Car was in pristine condition. Pick up was slightly delayed.",
        status: "approved"
      },
      {
        id: "rev-7",
        itemId: "t2",
        itemType: "trip",
        itemTitle: "Kyoto Autumn Retreat",
        userName: "Jennifer Lee",
        userEmail: "jennifer@example.com",
        rating: 5,
        comment: "The tea ceremony was a magical experience. Our guide was extremely knowledgeable about Japanese culture.",
        status: "approved"
      },
      {
        id: "rev-8",
        itemId: "lm1",
        itemType: "offer",
        itemTitle: "Bali Beach Villa - 48h Sale",
        userName: "Chris Martin",
        userEmail: "chris@example.com",
        rating: 5,
        comment: "Incredible value! Got this deal last minute and it was absolutely worth it. The villa was stunning.",
        status: "approved"
      },
      {
        id: "rev-9",
        itemId: "t3",
        itemType: "trip",
        itemTitle: "Amalfi Coast Drive",
        userName: "Sophie Taylor",
        userEmail: "sophie@example.com",
        rating: 5,
        comment: "The views along the Amalfi Coast were spectacular. Luxury accommodations and amazing food!",
        status: "approved"
      },
      {
        id: "rev-10",
        itemId: "h3",
        itemType: "hotel",
        itemTitle: "Alpine Lodge",
        userName: "James Brown",
        userEmail: "james@example.com",
        rating: 5,
        comment: "Perfect ski vacation! Ski-in/ski-out convenience was amazing. Cozy fireplace and excellent restaurant.",
        status: "approved"
      }
    ]).onConflictDoNothing();

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();

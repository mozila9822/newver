import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define types based on the data structure
export interface Trip {
  id: string;
  title: string;
  location: string;
  image: string;
  price: string;
  rating: number;
  duration: string;
  category: string;
  features: string[];
}

export interface Car {
  id: string;
  title: string;
  location: string;
  image: string;
  price: string;
  rating: number;
  specs: string;
  features: string[];
}

export interface Offer {
  id: string;
  title: string;
  location: string;
  image: string;
  price: string;
  originalPrice: string;
  rating: number;
  endsIn: string;
  discount: string;
}

export interface RoomType {
  id: string;
  name: string;
  price: string;
  description?: string;
  facilities: string[];
}

export interface Hotel {
  id: string;
  title: string;
  location: string;
  image: string;
  price: string;
  rating: number;
  amenities: string[];
  alwaysAvailable: boolean;
  isActive: boolean;
  availableFrom?: string;
  availableTo?: string;
  roomTypes?: RoomType[];
}

export interface Booking {
  id: string;
  customer: string;
  item: string;
  date: string;
  amount: string;
  status: "Confirmed" | "Pending" | "Cancelled";
}

export interface Review {
  id: string;
  itemId: string;
  itemType: 'trip' | 'hotel' | 'car' | 'offer';
  itemTitle: string;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
}

export interface PaymentCard {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
  cardholderName: string;
}

export interface RewardLevel {
  level: "Silver" | "Gold" | "Platinum" | "Black";
  points: number;
  nextLevelPoints: number;
  benefits: string[];
}

export interface TicketReply {
  id: string;
  sender: "user" | "support";
  message: string;
  date: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: "Open" | "In Progress" | "Closed";
  date: string;
  priority: "Low" | "Medium" | "High";
  userEmail: string;
  replies: TicketReply[];
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  reward: RewardLevel;
}

export interface LinkItem {
  label: string;
  href: string;
}

export interface FooterData {
  description: string;
  experiences: LinkItem[];
  company: LinkItem[];
  socials: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
}

export interface WebsiteSettings {
  name: string;
  logo: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

interface StoreContextType {
  trips: Trip[];
  hotels: Hotel[];
  cars: Car[];
  offers: Offer[];
  loading: boolean;
  
  // Trip CRUD
  addTrip: (trip: Omit<Trip, 'id'>) => Promise<Trip | null>;
  updateTrip: (id: string, trip: Partial<Trip>) => Promise<boolean>;
  deleteTrip: (id: string) => Promise<boolean>;
  
  // Hotel CRUD
  addHotel: (hotel: Omit<Hotel, 'id'>) => Promise<Hotel | null>;
  updateHotel: (hotel: Hotel) => Promise<boolean>;
  deleteHotel: (id: string) => Promise<boolean>;
  
  // Car CRUD
  addCar: (car: Omit<Car, 'id'>) => Promise<Car | null>;
  updateCar: (id: string, car: Partial<Car>) => Promise<boolean>;
  deleteCar: (id: string) => Promise<boolean>;
  
  // Offer CRUD
  addOffer: (offer: Omit<Offer, 'id'>) => Promise<Offer | null>;
  updateOffer: (id: string, offer: Partial<Offer>) => Promise<boolean>;
  deleteOffer: (id: string) => Promise<boolean>;
  
  // Legacy deleteItem for backwards compatibility
  deleteItem: (id: string, type: "trip" | "hotel" | "car" | "offer") => Promise<boolean>;
  
  footer: FooterData;
  updateFooter: (data: Partial<FooterData>) => void;
  updateFooterLink: (section: "experiences" | "company", index: number, link: LinkItem) => void;
  userProfile: UserProfile;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  paymentCards: PaymentCard[];
  addPaymentCard: (card: PaymentCard) => void;
  deletePaymentCard: (id: string) => void;
  userTickets: SupportTicket[];
  allTickets: SupportTicket[];
  fetchUserTickets: (userEmail: string) => Promise<void>;
  fetchAllTickets: () => Promise<void>;
  createTicket: (ticket: Omit<SupportTicket, "id" | "replies" | "status" | "date" | "userEmail">, userEmail: string) => Promise<SupportTicket | null>;
  replyToTicket: (ticketId: string, message: string, userEmail: string) => Promise<boolean>;
  replyToTicketAsAdmin: (ticketId: string, message: string) => Promise<boolean>;
  updateTicketStatus: (ticketId: string, status: "Open" | "In Progress" | "Closed") => Promise<boolean>;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => Promise<boolean>;
  deleteBooking: (id: string) => Promise<boolean>;
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<Review | null>;
  updateReview: (id: string, review: Partial<Omit<Review, 'id' | 'createdAt'>>) => Promise<Review | null>;
  updateReviewStatus: (id: string, status: "approved" | "rejected") => Promise<boolean>;
  deleteReview: (id: string) => Promise<boolean>;
  getReviewsByItem: (itemId: string, itemType: string) => Promise<Review[]>;
  getApprovedReviewsByItem: (itemId: string, itemType: string) => Promise<Review[]>;
  getReviewCount: (itemId: string, itemType: string) => number;
  websiteSettings: WebsiteSettings;
  updateWebsiteSettings: (settings: Partial<WebsiteSettings>) => void;
  refetchData: () => void;
}

// Reviews will be fetched from database

const initialWebsiteSettings: WebsiteSettings = {
  name: "Voyager Hub",
  logo: "",
  seoTitle: "Voyager Hub | Luxury Travel Experiences",
  seoDescription: "Curating exceptional journeys for the discerning traveler. We believe in the art of travel and the luxury of experience.",
  seoKeywords: "luxury travel, exclusive trips, 5-star hotels, private transport"
};

const initialUserProfile: UserProfile = {
  name: "John Doe",
  email: "john@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Luxury Lane, Beverly Hills, CA 90210",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  reward: {
    level: "Gold",
    points: 12500,
    nextLevelPoints: 20000,
    benefits: ["Priority Check-in", "Free Room Upgrade", "Late Checkout", "Welcome Gift"]
  }
};

const initialPaymentCards: PaymentCard[] = [
  { id: "card_1", last4: "4242", brand: "Visa", expiry: "12/28", cardholderName: "JOHN DOE" },
  { id: "card_2", last4: "8888", brand: "Mastercard", expiry: "09/26", cardholderName: "JOHN DOE" }
];

const initialUserTickets: SupportTicket[] = [
  { 
    id: "TK-2024", 
    subject: "Booking Modification Request", 
    status: "Open", 
    date: "2025-05-15", 
    priority: "High",
    userEmail: "user@example.com",
    replies: [
      { id: "r1", sender: "user", message: "I need to change the dates for my Bali trip to next week.", date: "2025-05-15 10:00 AM" }
    ]
  },
  { 
    id: "TK-1985", 
    subject: "Refund Inquiry", 
    status: "Closed", 
    date: "2025-04-10", 
    priority: "Medium",
    userEmail: "user@example.com",
    replies: [
      { id: "r1", sender: "user", message: "When will I receive my refund for the cancelled car rental?", date: "2025-04-10 09:00 AM" },
      { id: "r2", sender: "support", message: "Hello John, the refund was processed yesterday. It should appear in 3-5 business days.", date: "2025-04-11 11:30 AM" }
    ]
  }
];

const initialFooter: FooterData = {
  description: "Curating exceptional journeys for the discerning traveler. We believe in the art of travel and the luxury of experience.",
  experiences: [
    { label: "Signature Journeys", href: "/trips" },
    { label: "Luxury Stays", href: "/hotels" },
    { label: "Private Transport", href: "/cars" },
    { label: "Last Minute Offers", href: "/last-minute" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Concierge Services", href: "#" },
    { label: "Press & Media", href: "#" },
    { label: "Careers", href: "#" },
  ],
  socials: {
    facebook: "#",
    twitter: "#",
    instagram: "#"
  }
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// LocalStorage keys
const FOOTER_STORAGE_KEY = "voyager_footer";
const SETTINGS_STORAGE_KEY = "voyager_settings";

// Helper to safely get from localStorage
function getStoredData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load footer and settings from localStorage
  const [footer, setFooter] = useState<FooterData>(() => getStoredData(FOOTER_STORAGE_KEY, initialFooter));
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>(initialPaymentCards);
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([]);
  const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(() => getStoredData(SETTINGS_STORAGE_KEY, initialWebsiteSettings));

  // Persist footer to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(FOOTER_STORAGE_KEY, JSON.stringify(footer));
  }, [footer]);

  // Persist website settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(websiteSettings));
  }, [websiteSettings]);

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripsRes, hotelsRes, carsRes, offersRes, bookingsRes, reviewsRes] = await Promise.all([
        fetch('/api/trips'),
        fetch('/api/hotels'),
        fetch('/api/cars'),
        fetch('/api/last-minute-offers'),
        fetch('/api/bookings'),
        fetch('/api/reviews')
      ]);

      if (tripsRes.ok) {
        const tripsData = await tripsRes.json();
        setTrips(tripsData);
      }
      
      if (hotelsRes.ok) {
        const hotelsData = await hotelsRes.json();
        setHotels(hotelsData);
      }
      
      if (carsRes.ok) {
        const carsData = await carsRes.json();
        setCars(carsData);
      }
      
      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setOffers(offersData);
      }
      
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error('Error fetching data from API:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetchData = () => {
    fetchData();
  };

  // ============== TRIP CRUD ==============
  const addTrip = async (trip: Omit<Trip, 'id'>): Promise<Trip | null> => {
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip)
      });
      if (res.ok) {
        const newTrip = await res.json();
        setTrips(prev => [...prev, newTrip]);
        return newTrip;
      }
    } catch (error) {
      console.error('Error adding trip:', error);
    }
    return null;
  };

  const updateTrip = async (id: string, trip: Partial<Trip>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip)
      });
      if (res.ok) {
        const updatedTrip = await res.json();
        setTrips(prev => prev.map(t => t.id === id ? updatedTrip : t));
        return true;
      }
    } catch (error) {
      console.error('Error updating trip:', error);
    }
    return false;
  };

  const deleteTrip = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTrips(prev => prev.filter(t => t.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
    return false;
  };

  // ============== HOTEL CRUD ==============
  const addHotel = async (hotel: Omit<Hotel, 'id'>): Promise<Hotel | null> => {
    try {
      const res = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hotel)
      });
      if (res.ok) {
        const newHotel = await res.json();
        setHotels(prev => [...prev, newHotel]);
        return newHotel;
      }
    } catch (error) {
      console.error('Error adding hotel:', error);
    }
    return null;
  };

  const updateHotel = async (hotel: Hotel): Promise<boolean> => {
    try {
      const res = await fetch(`/api/hotels/${hotel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hotel)
      });
      if (res.ok) {
        const updatedHotel = await res.json();
        setHotels(prev => prev.map(h => h.id === hotel.id ? updatedHotel : h));
        return true;
      }
    } catch (error) {
      console.error('Error updating hotel:', error);
    }
    return false;
  };

  const deleteHotel = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/hotels/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHotels(prev => prev.filter(h => h.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting hotel:', error);
    }
    return false;
  };

  // ============== CAR CRUD ==============
  const addCar = async (car: Omit<Car, 'id'>): Promise<Car | null> => {
    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(car)
      });
      if (res.ok) {
        const newCar = await res.json();
        setCars(prev => [...prev, newCar]);
        return newCar;
      }
    } catch (error) {
      console.error('Error adding car:', error);
    }
    return null;
  };

  const updateCar = async (id: string, car: Partial<Car>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(car)
      });
      if (res.ok) {
        const updatedCar = await res.json();
        setCars(prev => prev.map(c => c.id === id ? updatedCar : c));
        return true;
      }
    } catch (error) {
      console.error('Error updating car:', error);
    }
    return false;
  };

  const deleteCar = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/cars/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCars(prev => prev.filter(c => c.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting car:', error);
    }
    return false;
  };

  // ============== OFFER CRUD ==============
  const addOffer = async (offer: Omit<Offer, 'id'>): Promise<Offer | null> => {
    try {
      const res = await fetch('/api/last-minute-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offer)
      });
      if (res.ok) {
        const newOffer = await res.json();
        setOffers(prev => [...prev, newOffer]);
        return newOffer;
      }
    } catch (error) {
      console.error('Error adding offer:', error);
    }
    return null;
  };

  const updateOffer = async (id: string, offer: Partial<Offer>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/last-minute-offers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offer)
      });
      if (res.ok) {
        const updated = await res.json();
        setOffers(prev => prev.map(o => o.id === id ? updated : o));
        return true;
      }
    } catch (error) {
      console.error('Error updating offer:', error);
    }
    return false;
  };

  const deleteOffer = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/last-minute-offers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOffers(prev => prev.filter(o => o.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
    return false;
  };

  // Legacy deleteItem for backwards compatibility
  const deleteItem = async (id: string, type: "trip" | "hotel" | "car" | "offer"): Promise<boolean> => {
    if (type === "trip") return deleteTrip(id);
    if (type === "hotel") return deleteHotel(id);
    if (type === "car") return deleteCar(id);
    if (type === "offer") return deleteOffer(id);
    return false;
  };

  const updateFooter = (data: Partial<FooterData>) => {
    setFooter(prev => ({ ...prev, ...data }));
  };

  const updateFooterLink = (section: "experiences" | "company", index: number, link: LinkItem) => {
    setFooter(prev => {
      const newLinks = [...prev[section]];
      newLinks[index] = link;
      return { ...prev, [section]: newLinks };
    });
  };
  
  const updateUserProfile = (data: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...data }));
  };
  
  const addPaymentCard = (card: PaymentCard) => {
    setPaymentCards([...paymentCards, card]);
  };
  
  const deletePaymentCard = (id: string) => {
    setPaymentCards(paymentCards.filter(c => c.id !== id));
  };
  
  // ============== SUPPORT TICKETS ==============
  const fetchUserTickets = async (userEmail: string): Promise<void> => {
    try {
      const res = await fetch(`/api/tickets/user/${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const ticketsData = await res.json();
        setUserTickets(ticketsData);
      }
    } catch (error) {
      console.error('Error fetching user tickets:', error);
    }
  };

  const createTicket = async (ticket: Omit<SupportTicket, "id" | "replies" | "status" | "date" | "userEmail">, userEmail: string): Promise<SupportTicket | null> => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ticket,
          userEmail
        })
      });
      if (res.ok) {
        const newTicket = await res.json();
        setUserTickets(prev => [newTicket, ...prev]);
        return newTicket;
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
    return null;
  };
  
  const replyToTicket = async (ticketId: string, message: string, userEmail: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'user',
          message
        })
      });
      if (res.ok) {
        // Refresh tickets to get updated replies
        await fetchUserTickets(userEmail);
        return true;
      }
    } catch (error) {
      console.error('Error replying to ticket:', error);
    }
    return false;
  };

  const fetchAllTickets = async (): Promise<void> => {
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const ticketsData = await res.json();
        setAllTickets(ticketsData);
      }
    } catch (error) {
      console.error('Error fetching all tickets:', error);
    }
  };

  const replyToTicketAsAdmin = async (ticketId: string, message: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'support',
          message
        })
      });
      if (res.ok) {
        // Refresh all tickets to get updated replies
        await fetchAllTickets();
        return true;
      }
    } catch (error) {
      console.error('Error replying to ticket as admin:', error);
    }
    return false;
  };

  const updateTicketStatus = async (ticketId: string, status: "Open" | "In Progress" | "Closed"): Promise<boolean> => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Refresh all tickets
        await fetchAllTickets();
        return true;
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
    return false;
  };

  const addBooking = (booking: Booking) => {
    setBookings([booking, ...bookings]);
  };

  const updateBooking = async (id: string, booking: Partial<Booking>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, ...booking } : b));
        return true;
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
    return false;
  };

  const deleteBooking = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings(prev => prev.filter(b => b.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
    return false;
  };

  // ============== REVIEW CRUD ==============
  const addReview = async (review: Omit<Review, 'id' | 'createdAt'>): Promise<Review | null> => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews(prev => [newReview, ...prev]);
        return newReview;
      }
    } catch (error) {
      console.error('Error adding review:', error);
    }
    return null;
  };

  const updateReview = async (id: string, review: Partial<Omit<Review, 'id' | 'createdAt'>>): Promise<Review | null> => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      if (res.ok) {
        const updatedReview = await res.json();
        setReviews(prev => prev.map(r => r.id === id ? updatedReview : r));
        return updatedReview;
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
    return null;
  };

  const updateReviewStatus = async (id: string, status: "approved" | "rejected"): Promise<boolean> => {
    try {
      const res = await fetch(`/api/reviews/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        return true;
      }
    } catch (error) {
      console.error('Error updating review status:', error);
    }
    return false;
  };

  const deleteReview = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
    return false;
  };

  const getReviewsByItem = async (itemId: string, itemType: string): Promise<Review[]> => {
    try {
      const res = await fetch(`/api/reviews/${itemType}/${itemId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
    return [];
  };

  const getApprovedReviewsByItem = async (itemId: string, itemType: string): Promise<Review[]> => {
    try {
      const res = await fetch(`/api/reviews/${itemType}/${itemId}/approved`);
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.error('Error fetching approved reviews:', error);
    }
    return [];
  };

  const getReviewCount = (itemId: string, itemType: string): number => {
    return reviews.filter(r => r.itemId === itemId && r.itemType === itemType && r.status === 'approved').length;
  };

  const updateWebsiteSettings = (settings: Partial<WebsiteSettings>) => {
    setWebsiteSettings(prev => ({ ...prev, ...settings }));
  };

  return (
    <StoreContext.Provider value={{ 
      trips, hotels, cars, offers, footer, loading,
      addTrip, updateTrip, deleteTrip,
      addHotel, updateHotel, deleteHotel,
      addCar, updateCar, deleteCar,
      addOffer, updateOffer, deleteOffer,
      deleteItem, updateFooter, updateFooterLink,
      userProfile, updateUserProfile, paymentCards, addPaymentCard, deletePaymentCard, userTickets, allTickets, fetchUserTickets, fetchAllTickets, createTicket, replyToTicket, replyToTicketAsAdmin, updateTicketStatus,
      bookings, addBooking, updateBooking, deleteBooking, reviews, addReview, updateReview, updateReviewStatus, deleteReview, getReviewsByItem, getApprovedReviewsByItem, getReviewCount,
      websiteSettings, updateWebsiteSettings, refetchData
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

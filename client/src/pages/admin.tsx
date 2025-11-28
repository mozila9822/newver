import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Plane, 
  TrendingUp, 
  DollarSign, 
  Briefcase,
  Plus,
  Edit,
  Trash,
  User,
  Map,
  Building,
  Car,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  LayoutTemplate,
  Star,
  Check,
  X,
  Upload,
  ExternalLink,
  Mail,
  FileText,
  Send,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useStore } from "@/lib/store-context";
import { useAuth } from "@/lib/auth-context";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

// Email Template Form Component
function EmailTemplateForm({ template, onSuccess, onClose }: { template?: any; onSuccess: () => void; onClose?: () => void }) {
  const [name, setName] = useState(template?.name || "");
  const [subject, setSubject] = useState(template?.subject || "");
  const [body, setBody] = useState(template?.body || "");
  const [variables, setVariables] = useState<string[]>(template?.variables || []);
  const [newVariable, setNewVariable] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = template ? `/api/email-templates/${template.id}` : '/api/email-templates';
      const method = template ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject, body, variables })
      });

      if (res.ok) {
        toast({ title: template ? "Template updated" : "Template created", description: "Email template has been saved." });
        onSuccess();
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save template.", variant: "destructive" });
    }
  };

  const addVariable = () => {
    if (newVariable && !variables.includes(newVariable)) {
      setVariables([...variables, newVariable]);
      setNewVariable("");
    }
  };

  const removeVariable = (varName: string) => {
    setVariables(variables.filter(v => v !== varName));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Template Name *</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Welcome Email"
          required
        />
      </div>
      <div>
        <Label>Subject *</Label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject (use {{variableName}} for variables)"
          required
        />
      </div>
      <div>
        <Label>Body *</Label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Email body (use {{variableName}} for variables)"
          className="min-h-[200px]"
          required
        />
      </div>
      <div>
        <Label>Variables</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newVariable}
            onChange={(e) => setNewVariable(e.target.value)}
            placeholder="Variable name (e.g., name)"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addVariable();
              }
            }}
          />
          <Button type="button" onClick={addVariable}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {variables.map(v => (
            <Badge key={v} variant="secondary" className="flex items-center gap-1">
              {`{{${v}}}`}
              <button
                type="button"
                onClick={() => removeVariable(v)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Use variables in your subject and body like: {`{{name}}`}, {`{{email}}`}, etc.
        </p>
      </div>
      <DialogFooter>
        <Button type="submit">
          {template ? "Update Template" : "Create Template"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { 
    trips, hotels, cars, offers, footer, updateFooter, updateFooterLink, 
    addTrip, updateTrip, deleteTrip, addHotel, updateHotel, deleteHotel, addCar, updateCar, deleteCar,
    addOffer, updateOffer, deleteOffer,
    reviews, updateReviewStatus, deleteReview,
    websiteSettings, updateWebsiteSettings,
    bookings, updateBooking, deleteBooking,
    allTickets, fetchAllTickets, replyToTicketAsAdmin, updateTicketStatus,
    refetchData
  } = useStore();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Local state for settings form
  const [localSettings, setLocalSettings] = useState(websiteSettings);
  
  // Support ticket state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{ name: string; email: string; role: string; status: string } | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<any[]>([]);
  const [settingsSubTab, setSettingsSubTab] = useState<"general" | "payments" | "email">("general");
  const [loadingPaymentSettings, setLoadingPaymentSettings] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [emailVariables, setEmailVariables] = useState<Record<string, string>>({});
  const [createTemplateDialogOpen, setCreateTemplateDialogOpen] = useState(false);
  const [editTemplateDialogOpen, setEditTemplateDialogOpen] = useState<string | null>(null);
  const [emailSettings, setEmailSettings] = useState<any>(null);
  const [loadingEmailSettings, setLoadingEmailSettings] = useState(false);
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false);

  // Fetch tickets when support tab is active
  useEffect(() => {
    if (activeTab === "support") {
      fetchAllTickets();
    }
  }, [activeTab]);

  // Fetch data when overview tab is active to ensure live stats
  useEffect(() => {
    if (activeTab === "overview") {
      fetchAllTickets();
      refetchData();
    }
  }, [activeTab]);

  // Fetch payment settings when settings tab is active or when switching to payments sub-tab
  useEffect(() => {
    if (activeTab === "settings") {
      if (settingsSubTab === "payments") {
        fetchPaymentSettings();
      } else if (settingsSubTab === "email") {
        fetchEmailSettings();
      }
    }
  }, [activeTab, settingsSubTab]);

  const fetchPaymentSettings = async () => {
    setLoadingPaymentSettings(true);
    try {
      const res = await fetch('/api/payment-settings');
      if (res.ok) {
        const settings = await res.json();
        setPaymentSettings(settings);
      } else {
        console.error('Failed to fetch payment settings:', res.statusText);
        toast({ title: "Error", description: "Failed to load payment settings.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      toast({ title: "Error", description: "Failed to load payment settings.", variant: "destructive" });
    } finally {
      setLoadingPaymentSettings(false);
    }
  };

  const updatePaymentSetting = async (provider: string, updates: any) => {
    try {
      const res = await fetch(`/api/payment-settings/${provider}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setPaymentSettings(prev => prev.map(s => s.provider === provider ? updated : s));
        toast({ title: "Payment Settings Updated", description: `${provider} settings have been saved.` });
        return true;
      }
    } catch (error) {
      console.error('Error updating payment settings:', error);
      toast({ title: "Error", description: "Failed to update payment settings.", variant: "destructive" });
    }
    return false;
  };

  // Fetch subscribers
  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/subscribers');
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast({ title: "Error", description: "Failed to load subscribers.", variant: "destructive" });
    }
  };

  // Fetch email templates
  const fetchEmailTemplates = async () => {
    try {
      const res = await fetch('/api/email-templates');
      if (res.ok) {
        const data = await res.json();
        setEmailTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
      toast({ title: "Error", description: "Failed to load email templates.", variant: "destructive" });
    }
  };

  // Delete subscriber
  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;
    try {
      const res = await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: "Subscriber deleted", description: "Subscriber has been removed." });
        fetchSubscribers();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete subscriber.", variant: "destructive" });
    }
  };

  // Send emails
  const handleSendEmails = async () => {
    if (selectedSubscribers.length === 0) {
      toast({ title: "No subscribers selected", description: "Please select at least one subscriber.", variant: "destructive" });
      return;
    }
    if (!emailSubject || !emailBody) {
      toast({ title: "Missing information", description: "Please provide both subject and body.", variant: "destructive" });
      return;
    }

    try {
      // Check if all active subscribers are selected - if so, send "all"
      const activeSubscribers = subscribers.filter(s => s.status === 'active');
      const subscriberIds = selectedSubscribers.length === activeSubscribers.length && activeSubscribers.length > 0
        ? ['all']
        : selectedSubscribers;

      const res = await fetch('/api/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberIds: subscriberIds,
          templateId: selectedTemplateId || undefined,
          subject: emailSubject,
          body: emailBody,
          variables: emailVariables
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast({ title: "Emails sent", description: data.message });
        setSendEmailDialogOpen(false);
        setSelectedSubscribers([]);
        setEmailSubject("");
        setEmailBody("");
        setSelectedTemplateId("");
        setEmailVariables({});
      } else {
        throw new Error('Failed to send emails');
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send emails.", variant: "destructive" });
    }
  };

  // Load template
  const handleLoadTemplate = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setEmailSubject(template.subject);
      setEmailBody(template.body);
      // Extract variables from template
      const vars: Record<string, string> = {};
      (template.variables || []).forEach((v: string) => {
        vars[v] = '';
      });
      setEmailVariables(vars);
    }
  };

  // Fetch email settings
  const fetchEmailSettings = async () => {
    setLoadingEmailSettings(true);
    try {
      const res = await fetch('/api/email-settings');
      if (res.ok) {
        const settings = await res.json();
        setEmailSettings(settings);
      } else if (res.status === 404) {
        // Settings don't exist yet, create default
        setEmailSettings({
          enabled: false,
          host: '',
          port: 587,
          secure: false,
          username: '',
          password: '',
          fromEmail: '',
          fromName: ''
        });
      }
    } catch (error) {
      console.error('Error fetching email settings:', error);
      toast({ title: "Error", description: "Failed to load email settings.", variant: "destructive" });
    } finally {
      setLoadingEmailSettings(false);
    }
  };

  // Update email settings
  const updateEmailSettings = async (updates: any) => {
    try {
      const res = await fetch('/api/email-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setEmailSettings(updated);
        toast({ title: "Email Settings Updated", description: "Email settings have been saved." });
        return true;
      }
    } catch (error) {
      console.error('Error updating email settings:', error);
      toast({ title: "Error", description: "Failed to update email settings.", variant: "destructive" });
    }
    return false;
  };

  // Update local settings when store changes (initial load)
  if (localSettings.name === "" && websiteSettings.name !== "") {
     setLocalSettings(websiteSettings);
  }
  
  const handleAdminReply = async (ticketId: string) => {
    if (replyMessage.trim()) {
      const success = await replyToTicketAsAdmin(ticketId, replyMessage);
      if (success) {
        setReplyMessage("");
        toast({ title: "Reply Sent", description: "Your reply has been added to the ticket." });
      } else {
        toast({ title: "Error", description: "Failed to send reply. Please try again.", variant: "destructive" });
      }
    }
  };

  // Dialog States
  const [isHotelDialogOpen, setIsHotelDialogOpen] = useState(false);
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);
  const [isTripDialogOpen, setIsTripDialogOpen] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [isCarDialogOpen, setIsCarDialogOpen] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [newTrip, setNewTrip] = useState({ title: "", price: "", location: "", image: "", rating: 5.0, duration: "", category: "", features: [] as string[] });
  const [tripImageFile, setTripImageFile] = useState<File | null>(null);
  const [newHotel, setNewHotel] = useState({ 
    title: "", 
    price: "", 
    location: "",
    image: "",
    amenities: [] as string[],
    alwaysAvailable: true,
    isActive: true,
    availableFrom: undefined as Date | undefined,
    availableTo: undefined as Date | undefined,
    roomTypes: [] as { id: string; name: string; price: string; description?: string; facilities: string[] }[]
  });
  const [hotelImageFile, setHotelImageFile] = useState<File | null>(null);
  const [newRoomType, setNewRoomType] = useState({ name: "", price: "", facilities: [] as string[] });
  const [newFacility, setNewFacility] = useState("");
  const [newCar, setNewCar] = useState({ title: "", price: "", location: "", image: "", rating: 5.0, specs: "", features: [] as string[] });
  const [carImageFile, setCarImageFile] = useState<File | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [newOffer, setNewOffer] = useState({ title: "", price: "", originalPrice: "", location: "", image: "", rating: 5.0, endsIn: "", discount: "" });
  const [offerImageFile, setOfferImageFile] = useState<File | null>(null);

  const availableTripFeatures = ["All Inclusive", "Flights Included", "Transfers", "Guided Tours", "Meals", "Insurance", "Luxury Car Rental", "5-Star Hotels"];
  const availableHotelAmenities = ["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar", "Parking", "Room Service", "Concierge", "Ocean View", "Butler"];
  const availableCarFeatures = ["GPS", "Bluetooth", "Automatic", "Leather Seats", "Sunroof", "Backup Camera", "Apple CarPlay", "Unlimited Mileage", "Chauffeur"];

  // Helper function to convert file to base64
  const handleImageFileChange = async (file: File | null, setImage: (url: string) => void) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditTrip = (trip: any) => {
    setEditingTripId(trip.id);
    setNewTrip({
      title: trip.title || "",
      price: trip.price || "",
      location: trip.location || "",
      image: trip.image || "",
      rating: trip.rating || 5.0,
      duration: trip.duration || "",
      category: trip.category || "",
      features: trip.features || []
    });
    setTripImageFile(null);
    setIsTripDialogOpen(true);
  };

  const handleEditCar = (car: any) => {
    setEditingCarId(car.id);
    setNewCar({
      title: car.title || "",
      price: car.price || "",
      location: car.location || "",
      image: car.image || "",
      rating: car.rating || 5.0,
      specs: car.specs || "",
      features: car.features || []
    });
    setCarImageFile(null);
    setIsCarDialogOpen(true);
  };

  const handleEditOffer = (offer: any) => {
    setEditingOfferId(offer.id);
    setNewOffer({
      title: offer.title || "",
      price: offer.price || "",
      originalPrice: offer.originalPrice || "",
      location: offer.location || "",
      image: offer.image || "",
      rating: offer.rating || 5.0,
      endsIn: offer.endsIn || "",
      discount: offer.discount || ""
    });
    setOfferImageFile(null);
    setIsOfferDialogOpen(true);
  };

  const handleEditHotel = (hotel: any) => {
    setNewHotel({
      title: hotel.title,
      price: hotel.price,
      location: hotel.location,
      image: hotel.image || "",
      amenities: hotel.amenities || [],
      alwaysAvailable: hotel.alwaysAvailable ?? true,
      isActive: hotel.isActive ?? true,
      availableFrom: hotel.availableFrom ? new Date(hotel.availableFrom) : undefined,
      availableTo: hotel.availableTo ? new Date(hotel.availableTo) : undefined,
      roomTypes: hotel.roomTypes || []
    });
    setHotelImageFile(null);
    setEditingHotelId(hotel.id);
    setIsHotelDialogOpen(true);
  };

  const handleAddHotel = () => {
    setNewHotel({ 
      title: "", 
      price: "", 
      location: "",
      image: "",
      amenities: [],
      alwaysAvailable: true,
      isActive: true,
      availableFrom: undefined,
      availableTo: undefined,
      roomTypes: []
    });
    setHotelImageFile(null);
    setEditingHotelId(null);
    setIsHotelDialogOpen(true);
  };

  // Redirect if not admin
  if (!user || user.role !== "admin") {
     return (
       <div className="min-h-screen flex items-center justify-center flex-col gap-4">
         <h1 className="text-2xl font-bold">Access Denied</h1>
         <p>You must be an administrator to view this page.</p>
         <Link href="/login"><Button>Login as Admin</Button></Link>
       </div>
     );
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-muted/20 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-2">
           <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
             <Plane className="w-4 h-4" />
           </div>
           <span className="font-serif text-xl font-bold">Voyager Admin</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Button 
            variant={activeTab === "overview" ? "secondary" : "ghost"} 
            className="w-full justify-start text-white hover:text-white hover:bg-white/10"
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
          </Button>
          <Button 
            variant={activeTab === "bookings" ? "secondary" : "ghost"} 
            className="w-full justify-start text-white hover:text-white hover:bg-white/10"
            onClick={() => setActiveTab("bookings")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Bookings
          </Button>
          
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Inventory</div>
          
          <Button 
            variant={activeTab === "trips" ? "secondary" : "ghost"} 
            className="w-full justify-start text-white hover:text-white hover:bg-white/10"
            onClick={() => setActiveTab("trips")}
          >
            <Map className="mr-2 h-4 w-4" />
            Trips
          </Button>
          <Button 
            variant={activeTab === "hotels" ? "secondary" : "ghost"} 
            className="w-full justify-start text-white hover:text-white hover:bg-white/10"
            onClick={() => setActiveTab("hotels")}
          >
            <Building className="mr-2 h-4 w-4" />
            Hotels
          </Button>
          <Button 
            variant={activeTab === "cars" ? "secondary" : "ghost"} 
            className="w-full justify-start text-white hover:text-white hover:bg-white/10"
            onClick={() => setActiveTab("cars")}
          >
            <Car className="mr-2 h-4 w-4" />
            Cars
          </Button>
          <Button 
            variant={activeTab === "offers" ? "secondary" : "ghost"} 
            className="w-full justify-start text-white hover:text-white hover:bg-white/10"
            onClick={() => setActiveTab("offers")}
          >
            <Clock className="mr-2 h-4 w-4" />
            Last Minute Offers
          </Button>

          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Management</div>

          <Button 
            variant={activeTab === "users" ? "secondary" : "ghost"} 
            className="w-full justify-start text-white hover:text-white hover:bg-white/10"
            onClick={() => setActiveTab("users")}
          >
            <Users className="mr-2 h-4 w-4" />
            Users
          </Button>
          <Button 
            variant={activeTab === "support" ? "secondary" : "ghost"} 
            className="w-full justify-start text-white hover:text-white hover:bg-white/10"
            onClick={() => setActiveTab("support")}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Support
          </Button>
          <Button 
            variant={activeTab === "reviews" ? "secondary" : "ghost"} 
            className="w-full justify-start text-white hover:text-white hover:bg-white/10"
            onClick={() => setActiveTab("reviews")}
          >
            <Star className="mr-2 h-4 w-4" />
            Reviews
          </Button>
          <Button 
            variant={activeTab === "subscribers" ? "secondary" : "ghost"} 
            className="w-full justify-start text-white hover:text-white hover:bg-white/10"
            onClick={() => {
              setActiveTab("subscribers");
              fetchSubscribers();
            }}
          >
            <Mail className="mr-2 h-4 w-4" />
            Subscribers
          </Button>
          <Button 
            variant={activeTab === "footer" ? "secondary" : "ghost"} 
            className="w-full justify-start text-white hover:text-white hover:bg-white/10"
            onClick={() => setActiveTab("footer")}
          >
            <LayoutTemplate className="mr-2 h-4 w-4" />
            Footer
          </Button>
          <Button 
            variant={activeTab === "settings" ? "secondary" : "ghost"} 
            className="w-full justify-start text-white hover:text-white hover:bg-white/10"
            onClick={() => {
              setLocalSettings(websiteSettings); // Sync state on tab switch
              setActiveTab("settings");
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-secondary/80 bg-secondary/50">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Website
            </Button>
          </Link>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="font-serif text-3xl font-bold text-primary">
               {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>

          {activeTab === "overview" && (() => {
            // Calculate live statistics
            const totalRevenue = bookings
              .filter(b => b.status === "Confirmed")
              .reduce((sum, b) => {
                const amount = parseFloat(b.amount.replace(/[^0-9.]/g, '')) || 0;
                return sum + amount;
              }, 0);
            
            const activeBookings = bookings.filter(b => b.status === "Confirmed" || b.status === "Pending").length;
            const todayBookings = bookings.filter(b => {
              const bookingDate = new Date(b.date);
              const today = new Date();
              return bookingDate.toDateString() === today.toDateString();
            }).length;
            
            const uniqueUsers = new Set([
              ...bookings.map(b => b.customer),
              ...allTickets.map(t => t.userEmail)
            ]).size;
            
            const openTickets = allTickets.filter(t => t.status === "Open").length;
            const highPriorityTickets = allTickets.filter(t => t.status === "Open" && t.priority === "High").length;
            
            const confirmedBookingsThisMonth = bookings.filter(b => {
              if (b.status !== "Confirmed") return false;
              const bookingDate = new Date(b.date);
              const now = new Date();
              return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
            }).length;
            
            return (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-secondary" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold text-primary">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" /> {confirmedBookingsThisMonth} confirmed this month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-secondary" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold text-primary">{activeBookings}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {todayBookings} {todayBookings === 1 ? 'booking' : 'bookings'} today
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                    <Users className="h-4 w-4 text-secondary" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold text-primary">{uniqueUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {bookings.length} total bookings
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Open Support Tickets</CardTitle>
                    <MessageSquare className="h-4 w-4 text-secondary" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold text-primary">{openTickets}</div>
                    <p className="text-xs text-red-500 flex items-center mt-1">
                        {highPriorityTickets} {highPriorityTickets === 1 ? 'High Priority' : 'High Priority'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    {(() => {
                      // Calculate monthly revenue from bookings
                      const monthlyData = Array.from({ length: 6 }, (_, i) => {
                        const date = new Date();
                        date.setMonth(date.getMonth() - (5 - i));
                        const monthName = date.toLocaleString('default', { month: 'short' });
                        const monthRevenue = bookings
                          .filter(b => {
                            if (b.status !== "Confirmed") return false;
                            const bookingDate = new Date(b.date);
                            return bookingDate.getMonth() === date.getMonth() && 
                                   bookingDate.getFullYear() === date.getFullYear();
                          })
                          .reduce((sum, b) => {
                            const amount = parseFloat(b.amount.replace(/[^0-9.]/g, '')) || 0;
                            return sum + amount;
                          }, 0);
                        return { name: monthName, total: monthRevenue };
                      });
                      
                      return (
                    <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(220 40% 20%)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(220 40% 20%)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                        <Area type="monotone" dataKey="total" stroke="hsl(220 40% 20%)" fillOpacity={1} fill="url(#colorTotal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                      );
                    })()}
                  </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                       <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-4">
                          {bookings.slice(0, 5).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No recent bookings</p>
                          ) : bookings.slice(0, 5).map((booking) => {
                            const bookingDate = new Date(booking.date);
                            const now = new Date();
                            const diffMs = now.getTime() - bookingDate.getTime();
                            const diffMins = Math.floor(diffMs / 60000);
                            const diffHours = Math.floor(diffMins / 60);
                            const diffDays = Math.floor(diffHours / 24);
                            
                            let timeAgo = "";
                            if (diffMins < 1) timeAgo = "Just now";
                            else if (diffMins < 60) timeAgo = `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
                            else if (diffHours < 24) timeAgo = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
                            else if (diffDays < 7) timeAgo = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
                            else timeAgo = bookingDate.toLocaleDateString();
                            
                            return (
                              <div key={booking.id} className="flex items-center gap-4 pb-4 border-b border-border/50 last:border-0">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">New booking from {booking.customer}</p>
                                  <p className="text-xs text-muted-foreground">{booking.item} • {timeAgo}</p>
                                </div>
                                <Badge variant={
                                  booking.status === 'Confirmed' ? 'default' :
                                  booking.status === 'Pending' ? 'secondary' : 'destructive'
                                } className="text-xs">
                                  {booking.status}
                                </Badge>
                             </div>
                            );
                          })}
                       </div>
                    </CardContent>
                </Card>
              </div>
            </>
            );
          })()}

          {activeTab === "trips" && (
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold font-serif">Trips Management</h2>
                  <Dialog open={isTripDialogOpen} onOpenChange={(open) => {
                    setIsTripDialogOpen(open);
                    if (!open) {
                      setEditingTripId(null);
                      setNewTrip({ title: "", price: "", location: "", image: "", rating: 5.0, duration: "", category: "", features: [] });
                      setTripImageFile(null);
                    }
                  }}>
                     <DialogTrigger asChild>
                        <Button className="bg-primary text-white" onClick={() => {
                          setEditingTripId(null);
                          setNewTrip({ title: "", price: "", location: "", image: "", rating: 5.0, duration: "", category: "", features: [] });
                          setTripImageFile(null);
                        }}><Plus className="w-4 h-4 mr-2" /> Add Trip</Button>
                     </DialogTrigger>
                     <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                           <DialogTitle>{editingTripId ? "Edit Trip" : "Add New Trip"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                 <Label>Title</Label>
                                 <Input 
                                    placeholder="Ex: Bali Escape" 
                                    value={newTrip.title}
                                    onChange={(e) => setNewTrip({...newTrip, title: e.target.value})}
                                 />
                              </div>
                              <div className="grid gap-2">
                                 <Label>Price</Label>
                                 <Input 
                                    placeholder="Ex: $2,500" 
                                    value={newTrip.price}
                                    onChange={(e) => setNewTrip({...newTrip, price: e.target.value})}
                                 />
                              </div>
                           </div>
                           <div className="grid gap-2">
                              <Label>Location</Label>
                              <Input 
                                 placeholder="Ex: Bali, Indonesia" 
                                 value={newTrip.location}
                                 onChange={(e) => setNewTrip({...newTrip, location: e.target.value})}
                              />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                 <Label>Image URL</Label>
                                 <Input 
                                    placeholder="https://..." 
                                    value={newTrip.image}
                                    onChange={(e) => setNewTrip({...newTrip, image: e.target.value})}
                                 />
                              </div>
                              <div className="grid gap-2">
                                 <Label>Rating</Label>
                                 <Input 
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    placeholder="5.0" 
                                    value={newTrip.rating}
                                    onChange={(e) => setNewTrip({...newTrip, rating: parseFloat(e.target.value) || 5.0})}
                                 />
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                 <Label>Duration</Label>
                                 <Input 
                                    placeholder="Ex: 7 Days" 
                                    value={newTrip.duration}
                                    onChange={(e) => setNewTrip({...newTrip, duration: e.target.value})}
                                 />
                              </div>
                              <div className="grid gap-2">
                                 <Label>Category</Label>
                                 <Input 
                                    placeholder="Ex: Adventure" 
                                    value={newTrip.category}
                                    onChange={(e) => setNewTrip({...newTrip, category: e.target.value})}
                                 />
                              </div>
                           </div>
                           <div className="grid gap-3">
                              <Label>Included Features</Label>
                              <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-muted/20">
                                 {availableTripFeatures.map((feature) => (
                                    <div key={feature} className="flex items-center justify-between">
                                       <Label htmlFor={`trip-${feature}`} className="text-sm font-normal">{feature}</Label>
                                       <Switch 
                                          id={`trip-${feature}`}
                                          checked={newTrip.features.includes(feature)}
                                          onCheckedChange={(checked) => {
                                             if (checked) {
                                                setNewTrip({...newTrip, features: [...newTrip.features, feature]});
                                             } else {
                                                setNewTrip({...newTrip, features: newTrip.features.filter(f => f !== feature)});
                                             }
                                          }}
                                       />
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                        <DialogFooter>
                           <Button onClick={async () => {
                              if (editingTripId) {
                                 // Update existing trip
                                 const success = await updateTrip(editingTripId, {
                                    title: newTrip.title,
                                    location: newTrip.location,
                                    price: newTrip.price,
                                    image: newTrip.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000",
                                    rating: newTrip.rating,
                                    duration: newTrip.duration,
                                    category: newTrip.category,
                                    features: newTrip.features
                                 });
                                 if (success) {
                                    toast({ title: "Trip Updated", description: "The trip has been updated in the database." });
                                    setIsTripDialogOpen(false);
                                    setEditingTripId(null);
                                    setNewTrip({ title: "", price: "", location: "", image: "", rating: 5.0, duration: "", category: "", features: [] });
                                 } else {
                                    toast({ title: "Error", description: "Failed to update trip.", variant: "destructive" });
                                 }
                              } else {
                                 // Add new trip
                                 const result = await addTrip({
                                    title: newTrip.title || "New Trip",
                                    location: newTrip.location || "Unknown",
                                    price: newTrip.price || "$0",
                                    image: newTrip.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000",
                                    rating: newTrip.rating || 5.0,
                                    duration: newTrip.duration || "7 Days",
                                    category: newTrip.category || "New",
                                    features: newTrip.features
                                 });
                                 if (result) {
                                    toast({ title: "Trip Added", description: "The new trip has been saved to database." });
                                    setIsTripDialogOpen(false);
                                    setNewTrip({ title: "", price: "", location: "", image: "", rating: 5.0, duration: "", category: "", features: [] });
                                 } else {
                                    toast({ title: "Error", description: "Failed to save trip.", variant: "destructive" });
                                 }
                              }
                           }}>{editingTripId ? "Update Trip" : "Save Trip"}</Button>
                        </DialogFooter>
                     </DialogContent>
                  </Dialog>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trips.map(trip => (
                     <Card key={trip.id} className="overflow-hidden">
                        <div className="h-32 overflow-hidden relative">
                           <img src={trip.image} className="w-full h-full object-cover" />
                           <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-xs font-bold">
                             {trip.rating} ★
                           </div>
                        </div>
                        <CardContent className="p-4">
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold truncate pr-2">{trip.title}</h3>
                              <span className="text-primary font-bold whitespace-nowrap">{trip.price}</span>
                           </div>
                           <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <Map className="w-3 h-3" /> {trip.location}
                           </p>
                           {trip.features && trip.features.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-4">
                                 {trip.features.slice(0, 3).map((f, i) => (
                                    <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{f}</span>
                                 ))}
                                 {trip.features.length > 3 && <span className="text-[10px] text-muted-foreground">+{trip.features.length - 3} more</span>}
                              </div>
                           )}
                           <div className="flex gap-2 mt-auto">
                              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditTrip(trip)}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                              <Button variant="destructive" size="sm" className="flex-1" onClick={async () => {
                                 const deleted = await deleteTrip(trip.id);
                                 if (deleted) {
                                    toast({ title: "Trip Deleted", description: "Trip removed from database." });
                                 } else {
                                    toast({ title: "Error", description: "Failed to delete trip.", variant: "destructive" });
                                 }
                              }}><Trash className="w-3 h-3 mr-1" /> Delete</Button>
                           </div>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            </div>
          )}

          {activeTab === "hotels" && (
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold font-serif">Hotels Management</h2>
                  <Dialog open={isHotelDialogOpen} onOpenChange={setIsHotelDialogOpen}>
                     <Button onClick={handleAddHotel} className="bg-primary text-white"><Plus className="w-4 h-4 mr-2" /> Add Hotel</Button>
                     <DialogContent className="max-w-2xl h-[80vh] overflow-y-auto">
                        <DialogHeader>
                           <DialogTitle>{editingHotelId ? "Edit Hotel" : "Add New Hotel"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                 <Label>Hotel Name</Label>
                                 <Input 
                                    placeholder="Ex: The Grand Budapest" 
                                    value={newHotel.title}
                                    onChange={(e) => setNewHotel({...newHotel, title: e.target.value})}
                                 />
                              </div>
                              <div className="grid gap-2">
                                 <Label>Price per Night</Label>
                                 <Input 
                                    placeholder="Ex: $450/night" 
                                    value={newHotel.price}
                                    onChange={(e) => setNewHotel({...newHotel, price: e.target.value})}
                                 />
                              </div>
                           </div>
                           <div className="grid gap-2">
                              <Label>Location</Label>
                              <Input 
                                 placeholder="Ex: Budapest, Hungary" 
                                 value={newHotel.location}
                                 onChange={(e) => setNewHotel({...newHotel, location: e.target.value})}
                              />
                           </div>
                           <div className="grid gap-2">
                              <Label>Image</Label>
                              <div className="space-y-2">
                                 <Input 
                                    placeholder="Paste image URL..." 
                                    value={newHotel.image}
                                    onChange={(e) => {
                                      setNewHotel({...newHotel, image: e.target.value});
                                      setHotelImageFile(null);
                                    }}
                                 />
                                 <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                       <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                       <span className="bg-card px-2 text-muted-foreground">Or upload file</span>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Input 
                                       type="file"
                                       accept="image/*"
                                       className="flex-1"
                                       onChange={(e) => {
                                         const file = e.target.files?.[0];
                                         if (file) {
                                           setHotelImageFile(file);
                                           handleImageFileChange(file, (url) => {
                                             setNewHotel({...newHotel, image: url});
                                           });
                                         }
                                       }}
                                    />
                                    {hotelImageFile && (
                                       <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                          {hotelImageFile.name}
                                       </span>
                                    )}
                                 </div>
                                 {newHotel.image && (
                                    <div className="mt-2">
                                       <img src={newHotel.image} alt="Preview" className="w-full h-32 object-cover rounded-md border" />
                                    </div>
                                 )}
                              </div>
                           </div>
                           <div className="grid gap-3 pt-4 border-t">
                              <Label className="text-base">Availability Settings</Label>
                              
                              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
                                 <div className="space-y-0.5">
                                    <Label htmlFor="hotel-active">Active Status</Label>
                                    <p className="text-xs text-muted-foreground">Hotel is visible to customers</p>
                                 </div>
                                 <Switch 
                                    id="hotel-active"
                                    checked={newHotel.isActive}
                                    onCheckedChange={(checked) => setNewHotel({...newHotel, isActive: checked})}
                                 />
                              </div>

                              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
                                 <div className="space-y-0.5">
                                    <Label htmlFor="hotel-always">Always Available</Label>
                                    <p className="text-xs text-muted-foreground">No specific date restrictions</p>
                                 </div>
                                 <Switch 
                                    id="hotel-always"
                                    checked={newHotel.alwaysAvailable}
                                    onCheckedChange={(checked) => setNewHotel({...newHotel, alwaysAvailable: checked})}
                                 />
                              </div>

                              {!newHotel.alwaysAvailable && (
                                 <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                                    <Label>Available Date Range</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                       <Popover>
                                          <PopoverTrigger asChild>
                                             <Button
                                                variant={"outline"}
                                                className={cn(
                                                   "w-full justify-start text-left font-normal",
                                                   !newHotel.availableFrom && "text-muted-foreground"
                                                )}
                                             >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {newHotel.availableFrom ? format(newHotel.availableFrom, "PPP") : <span>Start Date</span>}
                                             </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0">
                                             <CalendarComponent
                                                mode="single"
                                                selected={newHotel.availableFrom}
                                                onSelect={(date) => setNewHotel({...newHotel, availableFrom: date})}
                                                initialFocus
                                             />
                                          </PopoverContent>
                                       </Popover>

                                       <Popover>
                                          <PopoverTrigger asChild>
                                             <Button
                                                variant={"outline"}
                                                className={cn(
                                                   "w-full justify-start text-left font-normal",
                                                   !newHotel.availableTo && "text-muted-foreground"
                                                )}
                                             >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {newHotel.availableTo ? format(newHotel.availableTo, "PPP") : <span>End Date</span>}
                                             </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0">
                                             <CalendarComponent
                                                mode="single"
                                                selected={newHotel.availableTo}
                                                onSelect={(date) => setNewHotel({...newHotel, availableTo: date})}
                                                initialFocus
                                                disabled={(date) => 
                                                   newHotel.availableFrom ? date < newHotel.availableFrom : false
                                                }
                                             />
                                          </PopoverContent>
                                       </Popover>
                                    </div>
                                 </div>
                              )}
                           </div>

                           <div className="grid gap-3 border-t pt-4">
                              <Label className="text-base">Room Types</Label>
                              <div className="grid gap-4 p-4 border rounded-md bg-muted/10">
                                 <div className="flex gap-2 items-end">
                                    <div className="grid gap-2 flex-1">
                                       <Label htmlFor="room-name">Room Name</Label>
                                       <Input 
                                          id="room-name"
                                          placeholder="Ex: Deluxe Suite" 
                                          value={newRoomType.name}
                                          onChange={(e) => setNewRoomType({...newRoomType, name: e.target.value})}
                                       />
                                    </div>
                                    <div className="grid gap-2 w-32">
                                       <Label htmlFor="room-price">Price</Label>
                                       <Input 
                                          id="room-price"
                                          placeholder="$500" 
                                          value={newRoomType.price}
                                          onChange={(e) => setNewRoomType({...newRoomType, price: e.target.value})}
                                       />
                                    </div>
                                    <Button 
                                       onClick={() => {
                                          if (newRoomType.name && newRoomType.price) {
                                             setNewHotel({
                                                ...newHotel, 
                                                roomTypes: [...newHotel.roomTypes, { 
                                                   id: `rt${Date.now()}`, 
                                                   name: newRoomType.name, 
                                                   price: newRoomType.price,
                                                   description: "",
                                                   facilities: newRoomType.facilities
                                                }]
                                             });
                                             setNewRoomType({ name: "", price: "", facilities: [] });
                                          }
                                       }}
                                       disabled={!newRoomType.name || !newRoomType.price}
                                    >
                                       Add
                                    </Button>
                                 </div>

                                 {/* Room Facilities Input */}
                                 <div className="bg-muted/20 p-3 rounded mt-2">
                                    <Label className="text-xs mb-2 block">Room Facilities (Optional)</Label>
                                    <div className="flex gap-2">
                                       <Input 
                                          placeholder="Add facility (e.g., Mini Bar)" 
                                          value={newFacility}
                                          onChange={(e) => setNewFacility(e.target.value)}
                                          className="h-8 text-sm"
                                          onKeyDown={(e) => {
                                             if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (newFacility.trim()) {
                                                   setNewRoomType({...newRoomType, facilities: [...newRoomType.facilities, newFacility.trim()]});
                                                   setNewFacility("");
                                                }
                                             }
                                          }}
                                       />
                                       <Button 
                                          size="sm" 
                                          variant="secondary"
                                          onClick={() => {
                                             if (newFacility.trim()) {
                                                setNewRoomType({...newRoomType, facilities: [...newRoomType.facilities, newFacility.trim()]});
                                                setNewFacility("");
                                             }
                                          }}
                                       >
                                          <Plus className="w-3 h-3" />
                                       </Button>
                                    </div>
                                    {newRoomType.facilities.length > 0 && (
                                       <div className="flex flex-wrap gap-1 mt-2">
                                          {newRoomType.facilities.map((f, i) => (
                                             <span key={i} className="text-[10px] bg-background border px-1.5 py-0.5 rounded flex items-center gap-1">
                                                {f}
                                                <X 
                                                   className="w-3 h-3 cursor-pointer hover:text-destructive" 
                                                   onClick={() => setNewRoomType({...newRoomType, facilities: newRoomType.facilities.filter((_, idx) => idx !== i)})}
                                                />
                                             </span>
                                          ))}
                                       </div>
                                    )}
                                 </div>

                                 {newHotel.roomTypes.length > 0 && (
                                    <div className="space-y-2 mt-2">
                                       {newHotel.roomTypes.map((room) => (
                                          <div key={room.id} className="flex flex-col bg-background p-3 rounded border">
                                             <div className="flex items-center justify-between mb-2">
                                                <div>
                                                   <span className="font-medium">{room.name}</span>
                                                   <span className="text-muted-foreground ml-2 text-sm">{room.price}</span>
                                                </div>
                                                <Button 
                                                   variant="ghost" 
                                                   size="sm"
                                                   onClick={() => {
                                                      setNewHotel({
                                                         ...newHotel,
                                                         roomTypes: newHotel.roomTypes.filter(r => r.id !== room.id)
                                                      });
                                                   }}
                                                >
                                                   <Trash className="w-4 h-4 text-destructive" />
                                                </Button>
                                             </div>
                                             {room.facilities && room.facilities.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                   {room.facilities.map((f, i) => (
                                                      <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{f}</span>
                                                   ))}
                                                </div>
                                             )}
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           </div>

                           <div className="grid gap-3">
                              <Label>Hotel Facilities</Label>
                              <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-muted/20">
                                 {availableHotelAmenities.map((amenity: string) => (
                                    <div key={amenity} className="flex items-center justify-between">
                                       <Label htmlFor={`hotel-${amenity}`} className="text-sm font-normal">{amenity}</Label>
                                       <Switch 
                                          id={`hotel-${amenity}`}
                                          checked={newHotel.amenities.includes(amenity)}
                                          onCheckedChange={(checked) => {
                                             if (checked) {
                                                setNewHotel({...newHotel, amenities: [...newHotel.amenities, amenity]});
                                             } else {
                                                setNewHotel({...newHotel, amenities: newHotel.amenities.filter(a => a !== amenity)});
                                             }
                                          }}
                                       />
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                        <DialogFooter>
                           <Button onClick={async () => {
                              const hotelData = {
                                 title: newHotel.title || "New Hotel",
                                 location: newHotel.location || "Unknown",
                                 price: newHotel.price || "$0",
                                 image: newHotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000",
                                 rating: 5.0,
                                 amenities: newHotel.amenities,
                                 alwaysAvailable: newHotel.alwaysAvailable,
                                 isActive: newHotel.isActive,
                                 availableFrom: newHotel.availableFrom ? newHotel.availableFrom.toISOString().split('T')[0] : undefined,
                                 availableTo: newHotel.availableTo ? newHotel.availableTo.toISOString().split('T')[0] : undefined,
                                 roomTypes: newHotel.roomTypes
                              };
                              
                              if (editingHotelId) {
                                 const originalHotel = hotels.find(h => h.id === editingHotelId);
                                 const success = await updateHotel({
                                    id: editingHotelId,
                                    ...hotelData,
                                    image: newHotel.image || originalHotel?.image || hotelData.image,
                                    rating: originalHotel?.rating || hotelData.rating
                                 });
                                 if (success) {
                                    toast({ title: "Hotel Updated", description: "Hotel saved to database." });
                              } else {
                                    toast({ title: "Error", description: "Failed to update hotel.", variant: "destructive" });
                                 }
                              } else {
                                 const result = await addHotel(hotelData);
                                 if (result) {
                                    toast({ title: "Hotel Added", description: "Hotel saved to database." });
                                 } else {
                                    toast({ title: "Error", description: "Failed to add hotel.", variant: "destructive" });
                                 }
                              }
                              setIsHotelDialogOpen(false);
                              setNewHotel({ title: "", price: "", location: "", image: "", amenities: [], alwaysAvailable: true, isActive: true, availableFrom: undefined, availableTo: undefined, roomTypes: [] });
                           }}>{editingHotelId ? "Save Changes" : "Save Hotel"}</Button>
                        </DialogFooter>
                     </DialogContent>
                  </Dialog>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotels.map(hotel => (
                     <Card key={hotel.id} className="overflow-hidden">
                        <div className="h-32 overflow-hidden relative">
                           <img src={hotel.image} className="w-full h-full object-cover" />
                           <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-xs font-bold">
                             {hotel.rating} ★
                           </div>
                        </div>
                        <CardContent className="p-4">
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold truncate pr-2">{hotel.title}</h3>
                              <span className="text-primary font-bold whitespace-nowrap">{hotel.price}</span>
                           </div>
                           <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <Building className="w-3 h-3" /> {hotel.location}
                           </p>
                           {hotel.amenities && hotel.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-4">
                                 {hotel.amenities.slice(0, 3).map((a: string, i: number) => (
                                    <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{a}</span>
                                 ))}
                                 {hotel.amenities.length > 3 && <span className="text-[10px] text-muted-foreground">+{hotel.amenities.length - 3} more</span>}
                              </div>
                           )}
                           <div className="flex gap-2 mt-auto">
                              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditHotel(hotel)}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                              <Button variant="destructive" size="sm" className="flex-1" onClick={async () => {
                                 const deleted = await deleteHotel(hotel.id);
                                 if (deleted) {
                                    toast({ title: "Hotel Deleted", description: "Hotel removed from database." });
                                 } else {
                                    toast({ title: "Error", description: "Failed to delete hotel.", variant: "destructive" });
                                 }
                              }}><Trash className="w-3 h-3 mr-1" /> Delete</Button>
                           </div>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            </div>
          )}

          {activeTab === "cars" && (
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold font-serif">Car Rentals Management</h2>
                  <Dialog open={isCarDialogOpen} onOpenChange={(open) => {
                    setIsCarDialogOpen(open);
                    if (!open) {
                      setEditingCarId(null);
                      setNewCar({ title: "", price: "", location: "", image: "", rating: 5.0, specs: "", features: [] });
                      setCarImageFile(null);
                    }
                  }}>
                     <DialogTrigger asChild>
                        <Button className="bg-primary text-white" onClick={() => {
                          setEditingCarId(null);
                          setNewCar({ title: "", price: "", location: "", image: "", rating: 5.0, specs: "", features: [] });
                          setCarImageFile(null);
                        }}><Plus className="w-4 h-4 mr-2" /> Add Car</Button>
                     </DialogTrigger>
                     <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                           <DialogTitle>{editingCarId ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                 <Label>Vehicle Name</Label>
                                 <Input 
                                    placeholder="Ex: Porsche 911 Carrera" 
                                    value={newCar.title}
                                    onChange={(e) => setNewCar({...newCar, title: e.target.value})}
                                 />
                              </div>
                              <div className="grid gap-2">
                                 <Label>Price per Day</Label>
                                 <Input 
                                    placeholder="Ex: $1,200/day" 
                                    value={newCar.price}
                                    onChange={(e) => setNewCar({...newCar, price: e.target.value})}
                                 />
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                 <Label>Location</Label>
                                 <Input 
                                    placeholder="Ex: Monaco" 
                                    value={newCar.location}
                                    onChange={(e) => setNewCar({...newCar, location: e.target.value})}
                                 />
                              </div>
                              <div className="grid gap-2">
                                 <Label>Specs</Label>
                                 <Input 
                                    placeholder="Ex: Automatic • 2 Seats" 
                                    value={newCar.specs}
                                    onChange={(e) => setNewCar({...newCar, specs: e.target.value})}
                                 />
                              </div>
                           </div>
                           <div className="grid gap-2">
                              <Label>Rating</Label>
                              <Input 
                                 type="number"
                                 step="0.1"
                                 min="0"
                                 max="5"
                                 placeholder="5.0" 
                                 value={newCar.rating}
                                 onChange={(e) => setNewCar({...newCar, rating: parseFloat(e.target.value) || 5.0})}
                              />
                           </div>
                           <div className="grid gap-2">
                              <Label>Image</Label>
                              <div className="space-y-2">
                                 <Input 
                                    placeholder="Paste image URL..." 
                                    value={newCar.image}
                                    onChange={(e) => {
                                      setNewCar({...newCar, image: e.target.value});
                                      setCarImageFile(null);
                                    }}
                                 />
                                 <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                       <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                       <span className="bg-card px-2 text-muted-foreground">Or upload file</span>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Input 
                                       type="file"
                                       accept="image/*"
                                       className="flex-1"
                                       onChange={(e) => {
                                         const file = e.target.files?.[0];
                                         if (file) {
                                           setCarImageFile(file);
                                           handleImageFileChange(file, (url) => {
                                             setNewCar({...newCar, image: url});
                                           });
                                         }
                                       }}
                                    />
                                    {carImageFile && (
                                       <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                          {carImageFile.name}
                                       </span>
                                    )}
                                 </div>
                                 {newCar.image && (
                                    <div className="mt-2">
                                       <img src={newCar.image} alt="Preview" className="w-full h-32 object-cover rounded-md border" />
                                    </div>
                                 )}
                              </div>
                           </div>
                           <div className="grid gap-3">
                              <Label>Vehicle Features</Label>
                              <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-muted/20">
                                 {availableCarFeatures.map((feature) => (
                                    <div key={feature} className="flex items-center justify-between">
                                       <Label htmlFor={`car-${feature}`} className="text-sm font-normal">{feature}</Label>
                                       <Switch 
                                          id={`car-${feature}`}
                                          checked={newCar.features.includes(feature)}
                                          onCheckedChange={(checked) => {
                                             if (checked) {
                                                setNewCar({...newCar, features: [...newCar.features, feature]});
                                             } else {
                                                setNewCar({...newCar, features: newCar.features.filter(f => f !== feature)});
                                             }
                                          }}
                                       />
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                        <DialogFooter>
                           <Button onClick={async () => {
                              if (editingCarId) {
                                 // Update existing car
                                 const success = await updateCar(editingCarId, {
                                    title: newCar.title,
                                    location: newCar.location,
                                    price: newCar.price,
                                    image: newCar.image || "https://images.unsplash.com/photo-1555215695-3004980adade?q=80&w=1000",
                                    rating: newCar.rating,
                                    specs: newCar.specs,
                                    features: newCar.features
                                 });
                                 if (success) {
                                    toast({ title: "Vehicle Updated", description: "The vehicle has been updated in the database." });
                                    setIsCarDialogOpen(false);
                                    setEditingCarId(null);
                                    setNewCar({ title: "", price: "", location: "", image: "", rating: 5.0, specs: "", features: [] });
                                 } else {
                                    toast({ title: "Error", description: "Failed to update vehicle.", variant: "destructive" });
                                 }
                              } else {
                                 // Add new car
                                 const result = await addCar({
                                    title: newCar.title || "New Car",
                                    location: newCar.location || "Unknown",
                                    price: newCar.price || "$0",
                                    image: newCar.image || "https://images.unsplash.com/photo-1555215695-3004980adade?q=80&w=1000",
                                    rating: newCar.rating || 5.0,
                                    specs: newCar.specs || "Standard",
                                    features: newCar.features
                                 });
                                 if (result) {
                                    toast({ title: "Vehicle Added", description: "Vehicle saved to database." });
                                    setIsCarDialogOpen(false);
                                    setNewCar({ title: "", price: "", location: "", image: "", rating: 5.0, specs: "", features: [] });
                                 } else {
                                    toast({ title: "Error", description: "Failed to save vehicle.", variant: "destructive" });
                                 }
                              }
                           }}>{editingCarId ? "Update Vehicle" : "Save Vehicle"}</Button>
                        </DialogFooter>
                     </DialogContent>
                  </Dialog>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map(car => (
                     <Card key={car.id} className="overflow-hidden">
                        <div className="h-32 overflow-hidden relative">
                           <img src={car.image} className="w-full h-full object-cover" />
                           <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-xs font-bold">
                             {car.rating} ★
                           </div>
                        </div>
                        <CardContent className="p-4">
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold truncate pr-2">{car.title}</h3>
                              <span className="text-primary font-bold whitespace-nowrap">{car.price}</span>
                           </div>
                           <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Map className="w-3 h-3" /> {car.location}
                           </p>
                           <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <Car className="w-3 h-3" /> {car.specs}
                           </p>
                           {car.features && car.features.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-4">
                                 {car.features.slice(0, 3).map((f, i) => (
                                    <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{f}</span>
                                 ))}
                                 {car.features.length > 3 && <span className="text-[10px] text-muted-foreground">+{car.features.length - 3} more</span>}
                              </div>
                           )}
                           <div className="flex gap-2 mt-auto">
                              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditCar(car)}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                              <Button variant="destructive" size="sm" className="flex-1" onClick={async () => {
                                 const deleted = await deleteCar(car.id);
                                 if (deleted) {
                                    toast({ title: "Vehicle Deleted", description: "Vehicle removed from database." });
                                 } else {
                                    toast({ title: "Error", description: "Failed to delete vehicle.", variant: "destructive" });
                                 }
                              }}><Trash className="w-3 h-3 mr-1" /> Delete</Button>
                           </div>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            </div>
          )}

          {activeTab === "offers" && (
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold font-serif">Last Minute Offers Management</h2>
                  <Dialog open={isOfferDialogOpen} onOpenChange={(open) => {
                    setIsOfferDialogOpen(open);
                    if (!open) {
                      setEditingOfferId(null);
                      setNewOffer({ title: "", price: "", originalPrice: "", location: "", image: "", rating: 5.0, endsIn: "", discount: "" });
                      setOfferImageFile(null);
                    }
                  }}>
                     <DialogTrigger asChild>
                        <Button className="bg-primary text-white" onClick={() => {
                          setEditingOfferId(null);
                          setNewOffer({ title: "", price: "", originalPrice: "", location: "", image: "", rating: 5.0, endsIn: "", discount: "" });
                          setOfferImageFile(null);
                        }}><Plus className="w-4 h-4 mr-2" /> Add Offer</Button>
                     </DialogTrigger>
                     <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                           <DialogTitle>{editingOfferId ? "Edit Offer" : "Add New Offer"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                 <Label>Title</Label>
                                 <Input 
                                    placeholder="Ex: Last Minute Bali Escape" 
                                    value={newOffer.title}
                                    onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                                 />
                              </div>
                              <div className="grid gap-2">
                                 <Label>Location</Label>
                                 <Input 
                                    placeholder="Ex: Bali, Indonesia" 
                                    value={newOffer.location}
                                    onChange={(e) => setNewOffer({...newOffer, location: e.target.value})}
                                 />
                              </div>
                           </div>
                           <div className="grid grid-cols-3 gap-4">
                              <div className="grid gap-2">
                                 <Label>Price</Label>
                                 <Input 
                                    placeholder="Ex: $1,500" 
                                    value={newOffer.price}
                                    onChange={(e) => setNewOffer({...newOffer, price: e.target.value})}
                                 />
                              </div>
                              <div className="grid gap-2">
                                 <Label>Original Price</Label>
                                 <Input 
                                    placeholder="Ex: $2,500" 
                                    value={newOffer.originalPrice}
                                    onChange={(e) => setNewOffer({...newOffer, originalPrice: e.target.value})}
                                 />
                              </div>
                              <div className="grid gap-2">
                                 <Label>Discount</Label>
                                 <Input 
                                    placeholder="Ex: 40% OFF" 
                                    value={newOffer.discount}
                                    onChange={(e) => setNewOffer({...newOffer, discount: e.target.value})}
                                 />
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                 <Label>Ends In</Label>
                                 <Input 
                                    placeholder="Ex: 2 Days" 
                                    value={newOffer.endsIn}
                                    onChange={(e) => setNewOffer({...newOffer, endsIn: e.target.value})}
                                 />
                              </div>
                              <div className="grid gap-2">
                                 <Label>Rating</Label>
                                 <Input 
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    placeholder="5.0" 
                                    value={newOffer.rating}
                                    onChange={(e) => setNewOffer({...newOffer, rating: parseFloat(e.target.value) || 5.0})}
                                 />
                              </div>
                           </div>
                           <div className="grid gap-2">
                              <Label>Image</Label>
                              <div className="space-y-2">
                                 <Input 
                                    placeholder="Paste image URL..." 
                                    value={newOffer.image}
                                    onChange={(e) => {
                                      setNewOffer({...newOffer, image: e.target.value});
                                      setOfferImageFile(null);
                                    }}
                                 />
                                 <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                       <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                       <span className="bg-card px-2 text-muted-foreground">Or upload file</span>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Input 
                                       type="file"
                                       accept="image/*"
                                       className="flex-1"
                                       onChange={(e) => {
                                         const file = e.target.files?.[0];
                                         if (file) {
                                           setOfferImageFile(file);
                                           handleImageFileChange(file, (url) => {
                                             setNewOffer({...newOffer, image: url});
                                           });
                                         }
                                       }}
                                    />
                                    {offerImageFile && (
                                       <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                          {offerImageFile.name}
                                       </span>
                                    )}
                                 </div>
                                 {newOffer.image && (
                                    <div className="mt-2">
                                       <img src={newOffer.image} alt="Preview" className="w-full h-32 object-cover rounded-md border" />
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                        <DialogFooter>
                           <Button onClick={async () => {
                              if (editingOfferId) {
                                 // Update existing offer
                                 const success = await updateOffer(editingOfferId, {
                                    title: newOffer.title,
                                    location: newOffer.location,
                                    price: newOffer.price,
                                    originalPrice: newOffer.originalPrice,
                                    image: newOffer.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000",
                                    rating: newOffer.rating,
                                    endsIn: newOffer.endsIn,
                                    discount: newOffer.discount
                                 });
                                 if (success) {
                                    toast({ title: "Offer Updated", description: "The offer has been updated in the database." });
                                    setIsOfferDialogOpen(false);
                                 } else {
                                    toast({ title: "Error", description: "Failed to update offer.", variant: "destructive" });
                                 }
                              } else {
                                 // Add new offer
                                 const result = await addOffer({
                                    title: newOffer.title || "New Offer",
                                    location: newOffer.location || "Unknown",
                                    price: newOffer.price || "$0",
                                    originalPrice: newOffer.originalPrice || "$0",
                                    image: newOffer.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000",
                                    rating: newOffer.rating || 5.0,
                                    endsIn: newOffer.endsIn || "Limited Time",
                                    discount: newOffer.discount || "0% OFF"
                                 });
                                 if (result) {
                                    toast({ title: "Offer Added", description: "Offer saved to database." });
                                    setIsOfferDialogOpen(false);
                                 } else {
                                    toast({ title: "Error", description: "Failed to save offer.", variant: "destructive" });
                                 }
                              }
                           }}>{editingOfferId ? "Update Offer" : "Save Offer"}</Button>
                        </DialogFooter>
                     </DialogContent>
                  </Dialog>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {offers.map(offer => (
                     <Card key={offer.id} className="overflow-hidden">
                        <div className="h-32 overflow-hidden relative">
                           <img src={offer.image} className="w-full h-full object-cover" />
                           <div className="absolute top-2 right-2 bg-destructive text-white px-2 py-0.5 rounded text-xs font-bold">
                              {offer.discount}
                           </div>
                        </div>
                        <CardContent className="p-4">
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold truncate pr-2">{offer.title}</h3>
                              <div className="text-right">
                                 <span className="text-primary font-bold whitespace-nowrap">{offer.price}</span>
                                 {offer.originalPrice && (
                                    <span className="text-xs text-muted-foreground line-through block">{offer.originalPrice}</span>
                                 )}
                              </div>
                           </div>
                           <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <Map className="w-3 h-3" /> {offer.location}
                           </p>
                           <p className="text-xs text-destructive mb-4 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Ends in {offer.endsIn}
                           </p>
                           <div className="flex gap-2 mt-auto">
                              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditOffer(offer)}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                              <Button variant="destructive" size="sm" className="flex-1" onClick={async () => {
                                 const deleted = await deleteOffer(offer.id);
                                 if (deleted) {
                                    toast({ title: "Offer Deleted", description: "Offer removed from database." });
                                 } else {
                                    toast({ title: "Error", description: "Failed to delete offer.", variant: "destructive" });
                                 }
                              }}><Trash className="w-3 h-3 mr-1" /> Delete</Button>
                           </div>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            </div>
          )}

          {activeTab === "users" && (
             <>
             <Card>
                <CardHeader>
                   <CardTitle>User Management</CardTitle>
                   <CardDescription>Manage access and roles.</CardDescription>
                </CardHeader>
                <CardContent>
                   <table className="w-full text-left">
                      <thead>
                         <tr className="border-b border-border">
                            <th className="py-3 pl-4">Name</th>
                            <th className="py-3">Email</th>
                            <th className="py-3">Role</th>
                            <th className="py-3">Status</th>
                            <th className="py-3 pr-4">Actions</th>
                         </tr>
                      </thead>
                      <tbody>
                         <tr className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-3 pl-4 font-medium">Admin User</td>
                            <td className="py-3">admin@voyager.com</td>
                            <td className="py-3"><span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold border border-primary/20">Admin</span></td>
                            <td className="py-3 text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</td>
                              <td className="py-3 pr-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingUser({ name: "Admin User", email: "admin@voyager.com", role: "Admin", status: "Active" });
                                    setIsUserDialogOpen(true);
                                  }}
                                >
                                  Edit
                                </Button>
                              </td>
                         </tr>
                         <tr className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-3 pl-4 font-medium">John Doe</td>
                            <td className="py-3">john@example.com</td>
                            <td className="py-3"><span className="bg-secondary/10 text-secondary px-2 py-1 rounded text-xs font-semibold border border-secondary/20">User</span></td>
                            <td className="py-3 text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</td>
                              <td className="py-3 pr-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingUser({ name: "John Doe", email: "john@example.com", role: "User", status: "Active" });
                                    setIsUserDialogOpen(true);
                                  }}
                                >
                                  Edit
                                </Button>
                              </td>
                         </tr>
                         <tr className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-3 pl-4 font-medium">Sarah Connor</td>
                            <td className="py-3">sarah@example.com</td>
                            <td className="py-3"><span className="bg-secondary/10 text-secondary px-2 py-1 rounded text-xs font-semibold border border-secondary/20">User</span></td>
                            <td className="py-3 text-red-500 flex items-center gap-1"><XCircle className="w-3 h-3" /> Suspended</td>
                              <td className="py-3 pr-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingUser({ name: "Sarah Connor", email: "sarah@example.com", role: "User", status: "Suspended" });
                                    setIsUserDialogOpen(true);
                                  }}
                                >
                                  Edit
                                </Button>
                              </td>
                         </tr>
                      </tbody>
                   </table>
                </CardContent>
             </Card>

               <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                  <DialogContent>
                     <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                     </DialogHeader>
                     {editingUser && (
                        <div className="grid gap-4 py-4">
                           <div className="grid gap-2">
                              <Label>Name</Label>
                              <Input 
                                 value={editingUser.name}
                                 onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                              />
                           </div>
                           <div className="grid gap-2">
                              <Label>Email</Label>
                              <Input 
                                 value={editingUser.email}
                                 onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                 disabled
                              />
                              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                           </div>
                           <div className="grid gap-2">
                              <Label>Role</Label>
                              <select
                                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                 value={editingUser.role}
                                 onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                              >
                                 <option value="Admin">Admin</option>
                                 <option value="User">User</option>
                              </select>
                           </div>
                           <div className="grid gap-2">
                              <Label>Status</Label>
                              <select
                                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                 value={editingUser.status}
                                 onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                              >
                                 <option value="Active">Active</option>
                                 <option value="Suspended">Suspended</option>
                              </select>
                           </div>
                        </div>
                     )}
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancel</Button>
                        <Button onClick={() => {
                           // TODO: Implement API call to update user
                           toast({ 
                              title: "User Updated", 
                              description: `${editingUser?.name}'s information has been updated.` 
                           });
                           setIsUserDialogOpen(false);
                        }}>
                           Save Changes
                        </Button>
                     </DialogFooter>
                  </DialogContent>
               </Dialog>
             </>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-serif">Review Management</h2>
                <Badge variant="outline">{reviews.length} Total Reviews</Badge>
              </div>

              <Card>
                <CardContent className="p-0">
                   <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                         <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                            <tr>
                               <th className="px-6 py-3">Service</th>
                               <th className="px-6 py-3">Type</th>
                               <th className="px-6 py-3">User</th>
                               <th className="px-6 py-3">Rating</th>
                               <th className="px-6 py-3">Comment</th>
                               <th className="px-6 py-3">Date</th>
                               <th className="px-6 py-3">Status</th>
                               <th className="px-6 py-3">Actions</th>
                            </tr>
                         </thead>
                         <tbody>
                            {reviews.map((review) => (
                               <tr key={review.id} className="bg-card border-b hover:bg-muted/20">
                                  <td className="px-6 py-4 font-medium text-primary">{review.itemTitle}</td>
                                  <td className="px-6 py-4">
                                    <Badge variant="outline" className="capitalize">{review.itemType}</Badge>
                                  </td>
                                  <td className="px-6 py-4">{review.userName}</td>
                                  <td className="px-6 py-4">
                                    <div className="flex text-yellow-500">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-300"}`} />
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 max-w-xs truncate" title={review.comment}>{review.comment}</td>
                                  <td className="px-6 py-4 text-muted-foreground">
                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td className="px-6 py-4">
                                     <Badge variant={
                                        review.status === "approved" ? "default" :
                                        review.status === "rejected" ? "destructive" : "secondary"
                                     }>
                                        {review.status}
                                     </Badge>
                                  </td>
                                  <td className="px-6 py-4">
                                     <div className="flex gap-2">
                                        {review.status === "pending" && (
                                          <>
                                            <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200" onClick={async () => {
                                              const success = await updateReviewStatus(review.id, "approved");
                                              if (success) {
                                              toast({ title: "Review Approved", description: "Review is now public." });
                                              }
                                            }}>
                                               <Check className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={async () => {
                                              const success = await updateReviewStatus(review.id, "rejected");
                                              if (success) {
                                              toast({ title: "Review Rejected", description: "Review has been hidden." });
                                              }
                                            }}>
                                               <X className="w-4 h-4" />
                                            </Button>
                                          </>
                                        )}
                                        {review.status === "approved" && (
                                          <>
                                            <Button size="icon" variant="outline" className="h-8 w-8 text-orange-600 hover:bg-orange-50 hover:text-orange-700 border-orange-200" onClick={async () => {
                                              const success = await updateReviewStatus(review.id, "rejected");
                                              if (success) {
                                                toast({ title: "Review Unpublished", description: "Review has been hidden from public view." });
                                              }
                                            }} title="Unpublish">
                                               <X className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={async () => {
                                              if (confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
                                                const success = await deleteReview(review.id);
                                                if (success) {
                                                  toast({ title: "Review Deleted", description: "Review has been permanently deleted." });
                                                } else {
                                                  toast({ title: "Error", description: "Failed to delete review.", variant: "destructive" });
                                                }
                                              }
                                            }} title="Delete">
                                               <Trash className="w-4 h-4" />
                                            </Button>
                                          </>
                                        )}
                                        {review.status === "rejected" && (
                                          <>
                                            <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200" onClick={async () => {
                                              const success = await updateReviewStatus(review.id, "approved");
                                              if (success) {
                                                toast({ title: "Review Published", description: "Review is now public." });
                                              }
                                            }} title="Publish">
                                               <Check className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={async () => {
                                              if (confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
                                                const success = await deleteReview(review.id);
                                                if (success) {
                                                  toast({ title: "Review Deleted", description: "Review has been permanently deleted." });
                                                } else {
                                                  toast({ title: "Error", description: "Failed to delete review.", variant: "destructive" });
                                                }
                                              }
                                            }} title="Delete">
                                               <Trash className="w-4 h-4" />
                                            </Button>
                                          </>
                                        )}
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                      {reviews.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                          No reviews found.
                        </div>
                      )}
                   </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "subscribers" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-serif">Subscriber Management</h2>
                <div className="flex gap-2">
                  <Badge variant="outline">{subscribers.filter(s => s.status === 'active').length} Active</Badge>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      fetchEmailTemplates();
                      setTemplatesDialogOpen(true);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Templates
                  </Button>
                  <Button 
                    onClick={() => setSendEmailDialogOpen(true)}
                    disabled={selectedSubscribers.length === 0}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Email ({selectedSubscribers.length})
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                        <tr>
                          <th className="px-6 py-3">
                            <input
                              type="checkbox"
                              checked={selectedSubscribers.length === subscribers.filter(s => s.status === 'active').length && subscribers.filter(s => s.status === 'active').length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSubscribers(subscribers.filter(s => s.status === 'active').map(s => s.id));
                                } else {
                                  setSelectedSubscribers([]);
                                }
                              }}
                            />
                          </th>
                          <th className="px-6 py-3">Email</th>
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Subscribed</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                              No subscribers yet
                            </td>
                          </tr>
                        ) : (
                          subscribers.map((subscriber) => (
                            <tr key={subscriber.id} className="bg-card border-b hover:bg-muted/20">
                              <td className="px-6 py-4">
                                {subscriber.status === 'active' && (
                                  <input
                                    type="checkbox"
                                    checked={selectedSubscribers.includes(subscriber.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedSubscribers([...selectedSubscribers, subscriber.id]);
                                      } else {
                                        setSelectedSubscribers(selectedSubscribers.filter(id => id !== subscriber.id));
                                      }
                                    }}
                                  />
                                )}
                              </td>
                              <td className="px-6 py-4 font-medium">{subscriber.email}</td>
                              <td className="px-6 py-4">{subscriber.name || '-'}</td>
                              <td className="px-6 py-4 text-muted-foreground">
                                {new Date(subscriber.subscribedAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={subscriber.status === 'active' ? 'default' : 'secondary'}>
                                  {subscriber.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSubscriber(subscriber.id)}
                                >
                                  <Trash className="w-4 h-4 text-destructive" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Send Email Dialog */}
              <Dialog open={sendEmailDialogOpen} onOpenChange={setSendEmailDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Send Email to Subscribers</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Email Template (Optional)</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={selectedTemplateId}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleLoadTemplate(e.target.value);
                          } else {
                            setSelectedTemplateId("");
                            setEmailSubject("");
                            setEmailBody("");
                            setEmailVariables({});
                          }
                        }}
                      >
                        <option value="">Select a template...</option>
                        {emailTemplates.map(template => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Subject *</Label>
                      <Input
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Email subject"
                        required
                      />
                    </div>
                    <div>
                      <Label>Body *</Label>
                      <textarea
                        className="w-full min-h-[200px] px-3 py-2 border rounded-md"
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        placeholder="Email body (use {{variableName}} for variables)"
                        required
                      />
                    </div>
                    {Object.keys(emailVariables).length > 0 && (
                      <div>
                        <Label>Template Variables</Label>
                        <div className="space-y-2">
                          {Object.keys(emailVariables).map(key => (
                            <div key={key} className="flex gap-2">
                              <Label className="w-32">{key}:</Label>
                              <Input
                                value={emailVariables[key]}
                                onChange={(e) => setEmailVariables({...emailVariables, [key]: e.target.value})}
                                placeholder={`Value for ${key}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Sending to {selectedSubscribers.length} subscriber{selectedSubscribers.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSendEmailDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSendEmails}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Templates Dialog */}
              <Dialog open={templatesDialogOpen} onOpenChange={setTemplatesDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <div className="flex justify-between items-center">
                      <DialogTitle>Email Templates</DialogTitle>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Template
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create Email Template</DialogTitle>
                          </DialogHeader>
                          <EmailTemplateForm
                            onSuccess={() => {
                              fetchEmailTemplates();
                            }}
                            onClose={() => {}}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </DialogHeader>
                  <div className="space-y-4">
                    {emailTemplates.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No email templates yet. Create your first template!
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {emailTemplates.map((template) => (
                          <Card key={template.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <CardTitle>{template.name}</CardTitle>
                                  <CardDescription className="mt-1">Subject: {template.subject}</CardDescription>
                                  <div className="text-sm text-muted-foreground mt-2">
                                    Variables: {template.variables && template.variables.length > 0 ? template.variables.join(', ') : 'None'}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleLoadTemplate(template.id);
                                      setTemplatesDialogOpen(false);
                                      setSendEmailDialogOpen(true);
                                    }}
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    Use
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Edit Email Template</DialogTitle>
                                      </DialogHeader>
                                      <EmailTemplateForm
                                        template={template}
                                        onSuccess={() => {
                                          fetchEmailTemplates();
                                        }}
                                        onClose={() => {}}
                                      />
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      if (confirm('Are you sure you want to delete this template?')) {
                                        try {
                                          const res = await fetch(`/api/email-templates/${template.id}`, { method: 'DELETE' });
                                          if (res.ok) {
                                            toast({ title: "Template deleted", description: "Email template has been removed." });
                                            fetchEmailTemplates();
                                          }
                                        } catch (error) {
                                          toast({ title: "Error", description: "Failed to delete template.", variant: "destructive" });
                                        }
                                      }
                                    }}
                                  >
                                    <Trash className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-sm bg-muted p-3 rounded max-h-32 overflow-y-auto">
                                {template.body.substring(0, 200)}{template.body.length > 200 ? '...' : ''}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === "footer" && (
             <div className="space-y-6">
                <Card>
                   <CardHeader>
                      <CardTitle>Footer Description</CardTitle>
                      <CardDescription>This text appears in the footer of every page.</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <div className="space-y-2">
                         <Label>Description Text</Label>
                         <textarea 
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={footer.description}
                            onChange={(e) => updateFooter({ description: e.target.value })}
                         />
                      </div>
                      <Button onClick={() => toast({ title: "Footer Updated", description: "Description updated successfully." })}>Save Changes</Button>
                   </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card>
                      <CardHeader>
                         <CardTitle>Experiences Links</CardTitle>
                         <CardDescription>Manage links in the Experiences column.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                         {footer.experiences.map((link, index) => (
                            <div key={index} className="flex gap-2 items-end">
                               <div className="space-y-1 flex-1">
                                  <Label className="text-xs">Label</Label>
                                  <Input 
                                     value={link.label} 
                                     onChange={(e) => updateFooterLink("experiences", index, { ...link, label: e.target.value })}
                                  />
                               </div>
                               <div className="space-y-1 flex-1">
                                  <Label className="text-xs">URL</Label>
                                  <Input 
                                     value={link.href} 
                                     onChange={(e) => updateFooterLink("experiences", index, { ...link, href: e.target.value })}
                                  />
                               </div>
                            </div>
                         ))}
                         <Button onClick={() => toast({ title: "Links Updated", description: "Experiences links saved successfully." })}>Save Links</Button>
                      </CardContent>
                   </Card>

                   <Card>
                      <CardHeader>
                         <CardTitle>Company Links</CardTitle>
                         <CardDescription>Manage links in the Company column.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                         {footer.company.map((link, index) => (
                            <div key={index} className="flex gap-2 items-end">
                               <div className="space-y-1 flex-1">
                                  <Label className="text-xs">Label</Label>
                                  <Input 
                                     value={link.label} 
                                     onChange={(e) => updateFooterLink("company", index, { ...link, label: e.target.value })}
                                  />
                               </div>
                               <div className="space-y-1 flex-1">
                                  <Label className="text-xs">URL</Label>
                                  <Input 
                                     value={link.href} 
                                     onChange={(e) => updateFooterLink("company", index, { ...link, href: e.target.value })}
                                  />
                               </div>
                            </div>
                         ))}
                         <Button onClick={() => toast({ title: "Links Updated", description: "Company links saved successfully." })}>Save Links</Button>
                      </CardContent>
                   </Card>
                </div>
             </div>
          )}

          {activeTab === "bookings" && (
             <Card>
                <CardHeader>
                   <CardTitle>All Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                         <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                         <tr>
                            <th className="px-6 py-3">Booking ID</th>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Item</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                         </tr>
                         </thead>
                         <tbody>
                         {bookings.map((booking) => (
                            <tr key={booking.id} className="bg-white border-b hover:bg-muted/5">
                               <td className="px-6 py-4 font-medium">{booking.id}</td>
                               <td className="px-6 py-4">{booking.customer}</td>
                               <td className="px-6 py-4">{booking.item}</td>
                               <td className="px-6 py-4">{booking.date}</td>
                               <td className="px-6 py-4 font-bold text-primary">{booking.amount}</td>
                               <td className="px-6 py-4">
                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                     booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                               }`}>
                                  {booking.status}
                               </span>
                               </td>
                               <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">View</Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Booking Details: {booking.id}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                              <p className="text-base font-semibold">{booking.customer}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium text-muted-foreground">Booking Date</p>
                                              <p className="text-base font-semibold">{new Date(booking.date).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium text-muted-foreground">Item</p>
                                              <p className="text-base font-semibold">{booking.item}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                              <p className="text-base font-semibold text-primary">{booking.amount}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium text-muted-foreground">Status</p>
                                              <Badge variant={
                                                booking.status === 'Confirmed' ? 'default' :
                                                booking.status === 'Pending' ? 'secondary' : 'destructive'
                                              }>
                                                {booking.status}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button variant="outline" onClick={() => {}}>Close</Button>
                                          {booking.status !== "Cancelled" && (
                                            <Button 
                                              variant="destructive" 
                                              onClick={async () => {
                                                if (confirm(`Are you sure you want to cancel booking ${booking.id}?`)) {
                                                  const success = await updateBooking(booking.id, { status: "Cancelled" });
                                                  if (success) {
                                                    toast({ title: "Booking Cancelled", description: "Booking has been cancelled successfully." });
                                                  } else {
                                                    toast({ title: "Error", description: "Failed to cancel booking.", variant: "destructive" });
                                                  }
                                                }
                                              }}
                                            >
                                              Cancel Booking
                                            </Button>
                                          )}
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                    {booking.status !== "Cancelled" && (
                                      <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={async () => {
                                          if (confirm(`Are you sure you want to cancel booking ${booking.id}?`)) {
                                            const success = await updateBooking(booking.id, { status: "Cancelled" });
                                            if (success) {
                                              toast({ title: "Booking Cancelled", description: "Booking has been cancelled successfully." });
                                            } else {
                                              toast({ title: "Error", description: "Failed to cancel booking.", variant: "destructive" });
                                            }
                                          }
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    )}
                                  </div>
                               </td>
                            </tr>
                         ))}
                         </tbody>
                      </table>
                   </div>
                </CardContent>
             </Card>
          )}

          {activeTab === "support" && (
             <div className="space-y-6">
               <div className="flex justify-between items-center">
                 <div>
                   <h2 className="text-xl font-bold font-serif">Support Tickets</h2>
                   <p className="text-sm text-muted-foreground">Manage customer inquiries and issues.</p>
                 </div>
                 <Badge variant="outline">{allTickets.length} Total Tickets</Badge>
               </div>

             <Card>
                 <CardContent className="p-0">
                   <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                       <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                         <tr>
                           <th className="px-6 py-3">Ticket ID</th>
                           <th className="px-6 py-3">User</th>
                           <th className="px-6 py-3">Subject</th>
                           <th className="px-6 py-3">Date</th>
                           <th className="px-6 py-3">Priority</th>
                           <th className="px-6 py-3">Status</th>
                           <th className="px-6 py-3">Last Reply</th>
                           <th className="px-6 py-3">Actions</th>
                         </tr>
                      </thead>
                      <tbody>
                         {allTickets.length === 0 ? (
                           <tr>
                             <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                               No support tickets found.
                             </td>
                           </tr>
                         ) : allTickets.map((ticket) => {
                           const lastReply = ticket.replies && ticket.replies.length > 0 ? ticket.replies[0] : null;
                           return (
                             <tr key={ticket.id} className="bg-card border-b hover:bg-muted/20">
                             <td className="px-6 py-4 font-medium text-primary">{ticket.id}</td>
                             <td className="px-6 py-4">{ticket.userEmail}</td>
                             <td className="px-6 py-4">{ticket.subject}</td>
                             <td className="px-6 py-4 text-muted-foreground">{ticket.date}</td>
                             <td className="px-6 py-4">
                               <Badge variant={
                                 ticket.priority === 'High' ? 'destructive' :
                                 ticket.priority === 'Medium' ? 'default' : 'secondary'
                               }>
                                     {ticket.priority}
                               </Badge>
                               </td>
                             <td className="px-6 py-4">
                               <Badge variant={
                                 ticket.status === 'Open' ? 'default' :
                                 ticket.status === 'In Progress' ? 'secondary' : 'outline'
                               }>
                                     {ticket.status}
                               </Badge>
                             </td>
                             <td className="px-6 py-4">
                               {lastReply ? (
                                 <div className="flex flex-col gap-1">
                                   <Badge 
                                     variant={lastReply.sender === 'user' ? 'outline' : 'default'} 
                                     className={`text-xs w-fit ${
                                       lastReply.sender === 'user' 
                                         ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                         : 'bg-green-50 text-green-700 border-green-200'
                                     }`}
                                   >
                                     {lastReply.sender === 'user' ? '👤 User' : '🛟 Admin'}
                                   </Badge>
                                   <span className="text-xs text-muted-foreground">
                                     {new Date(lastReply.date).toLocaleDateString()}
                                  </span>
                                 </div>
                               ) : (
                                 <span className="text-xs text-muted-foreground italic">No replies yet</span>
                               )}
                               </td>
                             <td className="px-6 py-4">
                               <div className="flex gap-2">
                                 <Dialog>
                                   <DialogTrigger asChild>
                                     <Button 
                                       variant="outline" 
                                       size="sm"
                                       onClick={() => setSelectedTicketId(ticket.id)}
                                     >
                                       <MessageSquare className="w-3 h-3 mr-1" /> Reply
                                     </Button>
                                   </DialogTrigger>
                                   <DialogContent className="max-w-2xl">
                                     <DialogHeader>
                                       <DialogTitle>Reply to Ticket: {ticket.id}</DialogTitle>
                                     </DialogHeader>
                                     <div className="space-y-4">
                                       <div>
                                         <p className="text-sm font-medium mb-1">Subject: {ticket.subject}</p>
                                         <p className="text-xs text-muted-foreground">From: {ticket.userEmail}</p>
                                       </div>
                                       
                                       {ticket.replies && ticket.replies.length > 0 && (
                                         <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto space-y-3">
                                           <h4 className="text-sm font-semibold mb-2">Conversation History</h4>
                                           {ticket.replies.map((reply) => (
                                             <div key={reply.id} className={`flex ${reply.sender === "user" ? "justify-end" : "justify-start"}`}>
                                               <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                                                 reply.sender === "user" 
                                                   ? "bg-primary text-primary-foreground rounded-br-none" 
                                                   : "bg-muted rounded-bl-none"
                                               }`}>
                                                 <p>{reply.message}</p>
                                                 <div className={`text-[10px] mt-1 opacity-70 ${reply.sender === "user" ? "text-right" : "text-left"}`}>
                                                   {reply.date}
                                                 </div>
                                               </div>
                                             </div>
                                           ))}
                                         </div>
                                       )}
                                       
                                       <div className="space-y-2">
                                         <Label>Your Reply</Label>
                                         <textarea 
                                           className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                           placeholder="Type your reply..."
                                           value={replyMessage}
                                           onChange={(e) => setReplyMessage(e.target.value)}
                                         />
                                       </div>
                                       
                                       <div className="flex gap-2">
                                         <select
                                           className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                                           value={ticket.status}
                                           onChange={async (e) => {
                                             const success = await updateTicketStatus(ticket.id, e.target.value as any);
                                             if (success) {
                                               toast({ title: "Status Updated", description: "Ticket status has been updated." });
                                             }
                                           }}
                                         >
                                           <option value="Open">Open</option>
                                           <option value="In Progress">In Progress</option>
                                           <option value="Closed">Closed</option>
                                         </select>
                                       </div>
                                     </div>
                                     <DialogFooter>
                                       <Button variant="outline" onClick={() => setReplyMessage("")}>Cancel</Button>
                                       <Button onClick={() => handleAdminReply(ticket.id)}>Send Reply</Button>
                                     </DialogFooter>
                                   </DialogContent>
                                 </Dialog>
                               </div>
                             </td>
                           </tr>
                           );
                         })}
                      </tbody>
                   </table>
                   </div>
                </CardContent>
             </Card>
             </div>
          )}
          {activeTab === "settings" && (
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold font-serif">Settings</h2>
                  {settingsSubTab === "general" && (
                  <Button 
                    className="bg-primary text-white"
                    onClick={() => {
                      updateWebsiteSettings(localSettings);
                      toast({ title: "Settings Saved", description: "Website settings have been updated successfully." });
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                  )}
               </div>

               <div className="flex gap-2 border-b border-border">
                  <Button
                    variant={settingsSubTab === "general" ? "default" : "ghost"}
                    onClick={() => setSettingsSubTab("general")}
                    className="rounded-b-none"
                  >
                    General
                  </Button>
                  <Button
                    variant={settingsSubTab === "payments" ? "default" : "ghost"}
                    onClick={() => setSettingsSubTab("payments")}
                    className="rounded-b-none"
                  >
                    Payments
                  </Button>
                  <Button
                    variant={settingsSubTab === "email" ? "default" : "ghost"}
                    onClick={() => setSettingsSubTab("email")}
                    className="rounded-b-none"
                  >
                    Email
                  </Button>
               </div>

               {settingsSubTab === "general" && (
               <>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                     <CardHeader>
                        <CardTitle>General Information</CardTitle>
                        <CardDescription>Configure the main identity of your website.</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Label>Website Name</Label>
                           <Input 
                              value={localSettings.name} 
                              onChange={(e) => setLocalSettings({...localSettings, name: e.target.value})}
                              placeholder="Voyager Hub"
                           />
                           <p className="text-xs text-muted-foreground">This name will appear in the navigation bar and footer.</p>
                        </div>
                        <div className="space-y-2">
                           <Label>Website Logo</Label>
                           <div className="flex gap-4 items-start">
                              <div className="flex-1 space-y-3">
                                  <div className="flex gap-2">
                                      <Input 
                                         value={localSettings.logo} 
                                         onChange={(e) => setLocalSettings({...localSettings, logo: e.target.value})}
                                         placeholder="Paste image URL..."
                                      />
                                  </div>
                                  <div className="relative">
                                      <div className="absolute inset-0 flex items-center">
                                          <span className="w-full border-t" />
                                      </div>
                                      <div className="relative flex justify-center text-xs uppercase">
                                          <span className="bg-card px-2 text-muted-foreground">Or upload file</span>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input 
                                        type="file" 
                                        accept="image/*"
                                        className="cursor-pointer file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setLocalSettings({...localSettings, logo: reader.result as string});
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                  </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 items-center">
                                {localSettings.logo ? (
                                   <div className="w-24 h-24 border rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden flex-shrink-0 relative group">
                                      <img src={localSettings.logo} alt="Preview" className="w-full h-full object-contain p-2" />
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Button 
                                              variant="destructive" 
                                              size="sm"
                                              className="h-8 w-8"
                                              onClick={() => setLocalSettings({...localSettings, logo: ""})}
                                          >
                                              <Trash className="w-4 h-4" />
                                          </Button>
                                      </div>
                                   </div>
                                ) : (
                                    <div className="w-24 h-24 border rounded-lg flex items-center justify-center bg-muted/20 text-muted-foreground">
                                        <span className="text-xs">No Logo</span>
                                    </div>
                                )}
                                <span className="text-[10px] text-muted-foreground">Preview</span>
                              </div>
                           </div>
                           <p className="text-xs text-muted-foreground">Supported formats: PNG, JPG, GIF, SVG.</p>
                        </div>
                     </CardContent>
                  </Card>

                  <Card>
                     <CardHeader>
                        <CardTitle>SEO Configuration</CardTitle>
                        <CardDescription>Optimize your website for search engines.</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Label>Default Page Title</Label>
                           <Input 
                              value={localSettings.seoTitle} 
                              onChange={(e) => setLocalSettings({...localSettings, seoTitle: e.target.value})}
                              placeholder="Voyager Hub | Luxury Travel"
                           />
                        </div>
                        <div className="space-y-2">
                           <Label>Meta Description</Label>
                           <textarea 
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={localSettings.seoDescription} 
                              onChange={(e) => setLocalSettings({...localSettings, seoDescription: e.target.value})}
                              placeholder="A brief description of your website..."
                           />
                        </div>
                        <div className="space-y-2">
                           <Label>Keywords</Label>
                           <Input 
                              value={localSettings.seoKeywords} 
                              onChange={(e) => setLocalSettings({...localSettings, seoKeywords: e.target.value})}
                              placeholder="travel, luxury, hotels, trips"
                           />
                           <p className="text-xs text-muted-foreground">Separate keywords with commas.</p>
                        </div>
                     </CardContent>
                  </Card>
               </div>
               </>
               )}

               {settingsSubTab === "payments" && (
                  <div className="space-y-6">
                     <Card>
                        <CardHeader>
                           <CardTitle>Payment Providers</CardTitle>
                           <CardDescription>Configure payment gateway APIs for processing bookings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           {loadingPaymentSettings ? (
                              <div className="text-center py-8 text-muted-foreground">
                                 Loading payment settings...
            </div>
                           ) : paymentSettings.length === 0 ? (
                              <div className="text-center py-8">
                                 <p className="text-muted-foreground mb-4">No payment providers configured yet.</p>
                                 <Button onClick={fetchPaymentSettings} variant="outline">
                                    Reload Settings
                                 </Button>
                              </div>
                           ) : (
                              paymentSettings.map((setting) => (
                              <div key={setting.id} className="border rounded-lg p-4 space-y-4">
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <h3 className="font-semibold">
                                          {setting.provider === 'bank_transfer' ? 'Bank Transfer' : 
                                           setting.provider === 'stripe' ? 'Stripe' :
                                           setting.provider.charAt(0).toUpperCase() + setting.provider.slice(1)}
                                       </h3>
                                       <p className="text-sm text-muted-foreground">
                                          {setting.enabled ? (
                                             <span className="text-green-600">Enabled</span>
                                          ) : (
                                             <span className="text-muted-foreground">Disabled</span>
                                          )}
                                       </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <Label htmlFor={`enable-${setting.provider}`}>Enable</Label>
                                       <Switch
                                          id={`enable-${setting.provider}`}
                                          checked={setting.enabled}
                                          onCheckedChange={(checked) => {
                                             const updated = { ...setting, enabled: checked };
                                             setPaymentSettings(prev => prev.map(s => s.id === setting.id ? updated : s));
                                             updatePaymentSetting(setting.provider, { enabled: checked });
                                          }}
                                       />
                                    </div>
                                 </div>

                                 {setting.enabled && (
                                    <div className="space-y-4 pt-4 border-t">
                                       {setting.provider === 'stripe' && (
                                          <>
                                             <div className="space-y-2">
                                                <Label>Stripe Publishable Key</Label>
                                                <Input
                                                   type="password"
                                                   value={setting.publishableKey || ''}
                                                   onChange={(e) => {
                                                      const updated = { ...setting, publishableKey: e.target.value };
                                                      setPaymentSettings(prev => prev.map(s => s.id === setting.id ? updated : s));
                                                   }}
                                                   placeholder="pk_test_..."
                                                   onBlur={() => updatePaymentSetting(setting.provider, { publishableKey: setting.publishableKey })}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                   Get your keys from <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary underline">Stripe Dashboard</a>
                                                </p>
                                             </div>
                                             <div className="space-y-2">
                                                <Label>Stripe Secret Key</Label>
                                                <Input
                                                   type="password"
                                                   value={setting.secretKey || ''}
                                                   onChange={(e) => {
                                                      const updated = { ...setting, secretKey: e.target.value };
                                                      setPaymentSettings(prev => prev.map(s => s.id === setting.id ? updated : s));
                                                   }}
                                                   placeholder="sk_test_..."
                                                   onBlur={() => updatePaymentSetting(setting.provider, { secretKey: setting.secretKey })}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                   Keep this key secure. Never share it publicly.
                                                </p>
                                             </div>
                                             <div className="space-y-2">
                                                <Label>Webhook Secret (Optional)</Label>
                                                <Input
                                                   type="password"
                                                   value={setting.webhookSecret || ''}
                                                   onChange={(e) => {
                                                      const updated = { ...setting, webhookSecret: e.target.value };
                                                      setPaymentSettings(prev => prev.map(s => s.id === setting.id ? updated : s));
                                                   }}
                                                   placeholder="whsec_..."
                                                   onBlur={() => updatePaymentSetting(setting.provider, { webhookSecret: setting.webhookSecret })}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                   For handling Stripe webhook events
                                                </p>
                                             </div>
                                          </>
                                       )}

                                       {(setting.provider === 'paypal' || setting.provider === 'square') && (
                                          <>
                                             <div className="space-y-2">
                                                <Label>{setting.provider === 'paypal' ? 'PayPal' : 'Square'} Client ID</Label>
                                                <Input
                                                   type="password"
                                                   value={setting.publishableKey || ''}
                                                   onChange={(e) => {
                                                      const updated = { ...setting, publishableKey: e.target.value };
                                                      setPaymentSettings(prev => prev.map(s => s.id === setting.id ? updated : s));
                                                   }}
                                                   placeholder={`${setting.provider} client ID`}
                                                   onBlur={() => updatePaymentSetting(setting.provider, { publishableKey: setting.publishableKey })}
                                                />
                                             </div>
                                             <div className="space-y-2">
                                                <Label>{setting.provider === 'paypal' ? 'PayPal' : 'Square'} Secret Key</Label>
                                                <Input
                                                   type="password"
                                                   value={setting.secretKey || ''}
                                                   onChange={(e) => {
                                                      const updated = { ...setting, secretKey: e.target.value };
                                                      setPaymentSettings(prev => prev.map(s => s.id === setting.id ? updated : s));
                                                   }}
                                                   placeholder={`${setting.provider} secret key`}
                                                   onBlur={() => updatePaymentSetting(setting.provider, { secretKey: setting.secretKey })}
                                                />
                                             </div>
                                          </>
                                       )}

                                       {setting.provider === 'bank_transfer' && (
                                          <>
                                             <div className="space-y-2">
                                                <Label>Bank Name</Label>
                                                <Input
                                                   value={setting.additionalConfig?.bankName || ''}
                                                   onChange={(e) => {
                                                      const updated = { 
                                                         ...setting, 
                                                         additionalConfig: { ...setting.additionalConfig, bankName: e.target.value }
                                                      };
                                                      setPaymentSettings(prev => prev.map(s => s.id === setting.id ? updated : s));
                                                   }}
                                                   placeholder="e.g., Chase Bank"
                                                   onBlur={() => updatePaymentSetting(setting.provider, { additionalConfig: setting.additionalConfig })}
                                                />
                                             </div>
                                             <div className="space-y-2">
                                                <Label>Account Holder Name</Label>
                                                <Input
                                                   value={setting.additionalConfig?.accountHolderName || ''}
                                                   onChange={(e) => {
                                                      const updated = { 
                                                         ...setting, 
                                                         additionalConfig: { ...setting.additionalConfig, accountHolderName: e.target.value }
                                                      };
                                                      setPaymentSettings(prev => prev.map(s => s.id === setting.id ? updated : s));
                                                   }}
                                                   placeholder="Account holder full name"
                                                   onBlur={() => updatePaymentSetting(setting.provider, { additionalConfig: setting.additionalConfig })}
                                                />
                                             </div>
                                             <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                   <Label>Account Number</Label>
                                                   <Input
                                                      value={setting.additionalConfig?.accountNumber || ''}
                                                      onChange={(e) => {
                                                         const updated = { 
                                                            ...setting, 
                                                            additionalConfig: { ...setting.additionalConfig, accountNumber: e.target.value }
                                                         };
                                                         setPaymentSettings(prev => prev.map(s => s.id === setting.id ? updated : s));
                                                      }}
                                                      placeholder="Account number"
                                                      onBlur={() => updatePaymentSetting(setting.provider, { additionalConfig: setting.additionalConfig })}
                                                   />
                                                </div>
                                                <div className="space-y-2">
                                                   <Label>Routing Number</Label>
                                                   <Input
                                                      value={setting.additionalConfig?.routingNumber || ''}
                                                      onChange={(e) => {
                                                         const updated = { 
                                                            ...setting, 
                                                            additionalConfig: { ...setting.additionalConfig, routingNumber: e.target.value }
                                                         };
                                                         setPaymentSettings(prev => prev.map(s => s.id === setting.id ? updated : s));
                                                      }}
                                                      placeholder="Routing number"
                                                      onBlur={() => updatePaymentSetting(setting.provider, { additionalConfig: setting.additionalConfig })}
                                                   />
                                                </div>
                                             </div>
                                             <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                   <Label>SWIFT Code (Optional)</Label>
                                                   <Input
                                                      value={setting.additionalConfig?.swiftCode || ''}
                                                      onChange={(e) => {
                                                         const updated = { 
                                                            ...setting, 
                                                            additionalConfig: { ...setting.additionalConfig, swiftCode: e.target.value }
                                                         };
                                                         setPaymentSettings(prev => prev.map(s => s.id === setting.id ? updated : s));
                                                      }}
                                                      placeholder="SWIFT/BIC code"
                                                      onBlur={() => updatePaymentSetting(setting.provider, { additionalConfig: setting.additionalConfig })}
                                                   />
                                                </div>
                                                <div className="space-y-2">
                                                   <Label>Bank Address (Optional)</Label>
                                                   <Input
                                                      value={setting.additionalConfig?.bankAddress || ''}
                                                      onChange={(e) => {
                                                         const updated = { 
                                                            ...setting, 
                                                            additionalConfig: { ...setting.additionalConfig, bankAddress: e.target.value }
                                                         };
                                                         setPaymentSettings(prev => prev.map(s => s.id === setting.id ? updated : s));
                                                      }}
                                                      placeholder="Bank address"
                                                      onBlur={() => updatePaymentSetting(setting.provider, { additionalConfig: setting.additionalConfig })}
                                                   />
                                                </div>
                                             </div>
                                             <div className="space-y-2">
                                                <Label>Payment Instructions</Label>
                                                <textarea
                                                   className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                   value={setting.additionalConfig?.instructions || ''}
                                                   onChange={(e) => {
                                                      const updated = { 
                                                         ...setting, 
                                                         additionalConfig: { ...setting.additionalConfig, instructions: e.target.value }
                                                      };
                                                      setPaymentSettings(prev => prev.map(s => s.id === setting.id ? updated : s));
                                                   }}
                                                   placeholder="Additional instructions for customers (e.g., Include booking reference in transfer memo)"
                                                   onBlur={() => updatePaymentSetting(setting.provider, { additionalConfig: setting.additionalConfig })}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                   These instructions will be shown to customers when they select bank transfer.
                                                </p>
                                             </div>
                                          </>
                                       )}

                                       <div className="pt-2">
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={() => updatePaymentSetting(setting.provider, setting)}
                                          >
                                             Save {setting.provider} Settings
                                          </Button>
                                       </div>
                                    </div>
                                 )}
                              </div>
                              ))
                           )}
                        </CardContent>
                     </Card>
                  </div>
               )}

               {settingsSubTab === "email" && (
                  <div className="space-y-6">
                     <Card>
                        <CardHeader>
                           <CardTitle>Email Configuration</CardTitle>
                           <CardDescription>Configure SMTP settings for sending emails to subscribers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           {loadingEmailSettings ? (
                              <div className="text-center py-8 text-muted-foreground">
                                 Loading email settings...
                              </div>
                           ) : emailSettings ? (
                              <>
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <Label htmlFor="email-enabled">Enable Email Sending</Label>
                                       <p className="text-sm text-muted-foreground">Enable or disable email functionality</p>
                                    </div>
                                    <Switch
                                       id="email-enabled"
                                       checked={emailSettings.enabled || false}
                                       onCheckedChange={(checked) => {
                                          const updated = { ...emailSettings, enabled: checked };
                                          setEmailSettings(updated);
                                          updateEmailSettings({ enabled: checked });
                                       }}
                                    />
                                 </div>

                                 {emailSettings.enabled && (
                                    <div className="space-y-4 pt-4 border-t">
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                             <Label>SMTP Host *</Label>
                                             <Input
                                                value={emailSettings.host || ''}
                                                onChange={(e) => {
                                                   const updated = { ...emailSettings, host: e.target.value };
                                                   setEmailSettings(updated);
                                                }}
                                                placeholder="smtp.gmail.com"
                                                onBlur={() => updateEmailSettings({ host: emailSettings.host })}
                                             />
                                             <p className="text-xs text-muted-foreground">SMTP server hostname</p>
                                          </div>
                                          <div className="space-y-2">
                                             <Label>SMTP Port *</Label>
                                             <Input
                                                type="number"
                                                value={emailSettings.port || 587}
                                                onChange={(e) => {
                                                   const updated = { ...emailSettings, port: parseInt(e.target.value) || 587 };
                                                   setEmailSettings(updated);
                                                }}
                                                placeholder="587"
                                                onBlur={() => updateEmailSettings({ port: emailSettings.port })}
                                             />
                                             <p className="text-xs text-muted-foreground">Common ports: 587 (TLS), 465 (SSL), 25</p>
                                          </div>
                                       </div>

                                       <div className="flex items-center justify-between">
                                          <div>
                                             <Label htmlFor="email-secure">Use Secure Connection (SSL/TLS)</Label>
                                             <p className="text-sm text-muted-foreground">Enable for SSL/TLS encryption</p>
                                          </div>
                                          <Switch
                                             id="email-secure"
                                             checked={emailSettings.secure || false}
                                             onCheckedChange={(checked) => {
                                                const updated = { ...emailSettings, secure: checked };
                                                setEmailSettings(updated);
                                                updateEmailSettings({ secure: checked });
                                             }}
                                          />
                                       </div>

                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                             <Label>Username *</Label>
                                             <Input
                                                value={emailSettings.username || ''}
                                                onChange={(e) => {
                                                   const updated = { ...emailSettings, username: e.target.value };
                                                   setEmailSettings(updated);
                                                }}
                                                placeholder="your-email@gmail.com"
                                                onBlur={() => updateEmailSettings({ username: emailSettings.username })}
                                             />
                                             <p className="text-xs text-muted-foreground">SMTP authentication username</p>
                                          </div>
                                          <div className="space-y-2">
                                             <Label>Password *</Label>
                                             <Input
                                                type="password"
                                                value={emailSettings.password || ''}
                                                onChange={(e) => {
                                                   const updated = { ...emailSettings, password: e.target.value };
                                                   setEmailSettings(updated);
                                                }}
                                                placeholder="Your email password or app password"
                                                onBlur={() => updateEmailSettings({ password: emailSettings.password })}
                                             />
                                             <p className="text-xs text-muted-foreground">SMTP authentication password</p>
                                          </div>
                                       </div>

                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                             <Label>From Email *</Label>
                                             <Input
                                                type="email"
                                                value={emailSettings.fromEmail || ''}
                                                onChange={(e) => {
                                                   const updated = { ...emailSettings, fromEmail: e.target.value };
                                                   setEmailSettings(updated);
                                                }}
                                                placeholder="noreply@yourdomain.com"
                                                onBlur={() => updateEmailSettings({ fromEmail: emailSettings.fromEmail })}
                                             />
                                             <p className="text-xs text-muted-foreground">Email address that appears as sender</p>
                                          </div>
                                          <div className="space-y-2">
                                             <Label>From Name *</Label>
                                             <Input
                                                value={emailSettings.fromName || ''}
                                                onChange={(e) => {
                                                   const updated = { ...emailSettings, fromName: e.target.value };
                                                   setEmailSettings(updated);
                                                }}
                                                placeholder="Voyager Hub"
                                                onBlur={() => updateEmailSettings({ fromName: emailSettings.fromName })}
                                             />
                                             <p className="text-xs text-muted-foreground">Name that appears as sender</p>
                                          </div>
                                       </div>

                                       <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
                                          <strong>Note:</strong> For Gmail, you may need to use an "App Password" instead of your regular password. Enable 2-factor authentication and generate an app password in your Google Account settings.
                                       </div>
                                    </div>
                                 )}
                              </>
                           ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                 Failed to load email settings
                              </div>
                           )}
                        </CardContent>
                     </Card>
                  </div>
               )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
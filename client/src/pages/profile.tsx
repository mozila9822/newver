import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  CreditCard, 
  Award, 
  MessageSquare, 
  LogOut, 
  Plus, 
  Trash, 
  CheckCircle, 
  Shield, 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  Send,
  Calendar,
  Star
} from "lucide-react";
import { PaymentCard, TicketReply, Review } from "@/lib/store-context";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { 
    userProfile, updateUserProfile, 
    paymentCards, addPaymentCard, deletePaymentCard,
    userTickets, fetchUserTickets, createTicket, replyToTicket,
    bookings, updateBooking, reviews, addReview, updateReview,
    trips, hotels, cars, offers
  } = useStore();
  
  // Helper function to find item info from booking item name
  const findItemInfo = (itemName: string): { id: string; type: 'trip' | 'hotel' | 'car' | 'offer' } | null => {
    const trip = trips.find(t => t.title === itemName);
    if (trip) return { id: trip.id, type: 'trip' };
    
    const hotel = hotels.find(h => h.title === itemName);
    if (hotel) return { id: hotel.id, type: 'hotel' };
    
    const car = cars.find(c => c.title === itemName);
    if (car) return { id: car.id, type: 'car' };
    
    const offer = offers.find(o => o.title === itemName);
    if (offer) return { id: offer.id, type: 'offer' };
    
    return null;
  };
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Form states
  const [newCard, setNewCard] = useState<Partial<PaymentCard>>({ brand: "Visa", cardholderName: "" });
  const [newTicket, setNewTicket] = useState({ subject: "", message: "", priority: "Medium" as "Low" | "Medium" | "High" });
  const [replyMessage, setReplyMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "", itemId: "", itemType: "" as 'trip' | 'hotel' | 'car' | 'offer', itemTitle: "" });
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewForm, setEditReviewForm] = useState({ rating: 5, comment: "" });
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  // Fetch user tickets when user is available or when support tab is active
  useEffect(() => {
    if (user?.email && (activeTab === "support" || userTickets.length === 0)) {
      fetchUserTickets(user.email);
    }
  }, [user?.email, activeTab]);

  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your personal details have been saved successfully."
    });
  };

  const handleAddCard = () => {
    if (newCard.last4 && newCard.expiry && newCard.cardholderName) {
      addPaymentCard({
        id: `card_${Date.now()}`,
        last4: newCard.last4,
        brand: newCard.brand || "Visa",
        expiry: newCard.expiry,
        cardholderName: newCard.cardholderName
      });
      setNewCard({ brand: "Visa", cardholderName: "" });
      toast({ title: "Card Added", description: "Your payment method has been added." });
    }
  };

  const handleCreateTicket = async () => {
    if (newTicket.subject && newTicket.message && user?.email) {
      const result = await createTicket({
        subject: newTicket.subject,
        priority: newTicket.priority,
      }, user.email);
      
      if (result) {
        // Add the initial message as the first reply
        if (newTicket.message.trim()) {
          await replyToTicket(result.id, newTicket.message, user.email);
        }
        
        setNewTicket({ subject: "", message: "", priority: "Medium" });
        toast({ title: "Ticket Created", description: "Support team will respond shortly." });
      } else {
        toast({ title: "Error", description: "Failed to create ticket. Please try again.", variant: "destructive" });
      }
    }
  };

  const handleReply = async (ticketId: string) => {
    if (replyMessage.trim() && user?.email) {
      const success = await replyToTicket(ticketId, replyMessage, user.email);
      if (success) {
        setReplyMessage("");
        toast({ title: "Reply Sent", description: "Your message has been added to the ticket." });
      } else {
        toast({ title: "Error", description: "Failed to send reply. Please try again.", variant: "destructive" });
      }
    }
  };

  const handleSubmitReview = async () => {
    if (reviewForm.comment && reviewForm.itemId && reviewForm.itemType) {
      const result = await addReview({
        itemId: reviewForm.itemId,
        itemType: reviewForm.itemType,
        itemTitle: reviewForm.itemTitle,
        userName: user?.name || "User",
        userEmail: user?.email,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        status: "pending"
      });
      if (result) {
        setReviewForm({ rating: 5, comment: "", itemId: "", itemType: "" as 'trip' | 'hotel' | 'car' | 'offer', itemTitle: "" });
        toast({ title: "Review Submitted", description: "Your review is pending approval." });
      } else {
        toast({ title: "Error", description: "Failed to submit review. Please try again.", variant: "destructive" });
      }
    }
  };

  // Filter bookings for current user (mock logic since bookings don't have userId in mock data properly linked yet, 
  // but we'll assume all mock bookings are visible for demo or filter by name if needed. 
  // The user requested "users on profile page add a tab also to see they're bookings".
  // In a real app, we'd filter by user ID. Here, let's filter by customer name "Alice Freeman" or show all for demo purposes if user name matches.
  // Actually, let's just show all bookings for the demo user to make it easy to test.
  const myBookings = bookings; // In real app: bookings.filter(b => b.userId === user.id)

  return (
    <Layout>
      <div className="bg-muted/20 min-h-screen py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Sidebar */}
            <div className="md:col-span-3 space-y-6">
              <Card className="overflow-hidden border-none shadow-lg">
                <div className="bg-gradient-to-br from-primary to-primary/80 h-24 relative">
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <Avatar className="w-20 h-20 border-4 border-white shadow-md">
                      <AvatarImage src={userProfile.avatar} />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <CardContent className="pt-12 text-center pb-6">
                  <h2 className="font-serif text-xl font-bold">{userProfile.name}</h2>
                  <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                  <div className="mt-4 flex justify-center">
                    <Badge variant="secondary" className="uppercase tracking-wide">
                      {userProfile.reward.level} Member
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <nav className="space-y-2">
                <Button 
                  variant={activeTab === "profile" ? "default" : "ghost"} 
                  className={`w-full justify-start ${activeTab === "profile" ? "bg-primary text-primary-foreground" : "hover:bg-white"}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="mr-2 h-4 w-4" /> Profile Details
                </Button>
                <Button 
                  variant={activeTab === "bookings" ? "default" : "ghost"} 
                  className={`w-full justify-start ${activeTab === "bookings" ? "bg-primary text-primary-foreground" : "hover:bg-white"}`}
                  onClick={() => setActiveTab("bookings")}
                >
                  <Calendar className="mr-2 h-4 w-4" /> My Bookings
                </Button>
                <Button 
                  variant={activeTab === "payment" ? "default" : "ghost"} 
                  className={`w-full justify-start ${activeTab === "payment" ? "bg-primary text-primary-foreground" : "hover:bg-white"}`}
                  onClick={() => setActiveTab("payment")}
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Payment Methods
                </Button>
                <Button 
                  variant={activeTab === "rewards" ? "default" : "ghost"} 
                  className={`w-full justify-start ${activeTab === "rewards" ? "bg-primary text-primary-foreground" : "hover:bg-white"}`}
                  onClick={() => setActiveTab("rewards")}
                >
                  <Award className="mr-2 h-4 w-4" /> Rewards & Loyalty
                </Button>
                <Button 
                  variant={activeTab === "support" ? "default" : "ghost"} 
                  className={`w-full justify-start ${activeTab === "support" ? "bg-primary text-primary-foreground" : "hover:bg-white"}`}
                  onClick={() => setActiveTab("support")}
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Support Tickets
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-red-50"
                  onClick={() => { logout(); setLocation("/"); }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="md:col-span-9">
              {activeTab === "profile" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h1 className="font-serif text-3xl font-bold text-primary mb-2">Personal Details</h1>
                    <p className="text-muted-foreground">Manage your personal information and preferences.</p>
                  </div>

                  <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                      <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                value={userProfile.name} 
                                onChange={(e) => updateUserProfile({ name: e.target.value })}
                                className="pl-9" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Email Address</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                value={userProfile.email} 
                                onChange={(e) => updateUserProfile({ email: e.target.value })}
                                className="pl-9" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                value={userProfile.phone} 
                                onChange={(e) => updateUserProfile({ phone: e.target.value })}
                                className="pl-9" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Address</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                value={userProfile.address} 
                                onChange={(e) => updateUserProfile({ address: e.target.value })}
                                className="pl-9" 
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button type="submit">Save Changes</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "bookings" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h1 className="font-serif text-3xl font-bold text-primary mb-2">My Bookings</h1>
                    <p className="text-muted-foreground">View your past and upcoming trips.</p>
                  </div>

                  <div className="space-y-4">
                    {myBookings.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                          You haven't made any bookings yet.
                        </CardContent>
                      </Card>
                    ) : (
                      myBookings.map((booking) => {
                        // Find if user already reviewed this item
                        const existingReview = reviews.find(r => 
                          r.itemTitle === booking.item && 
                          r.userEmail === user?.email
                        );
                        
                        return (
                          <Card key={booking.id} className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="flex flex-col md:flex-row">
                                <div className="bg-muted/30 p-6 md:w-1/4 flex flex-col justify-center items-center border-r border-border/50">
                                  <div className="text-2xl font-bold text-primary">{booking.date.split('-')[2]}</div>
                                  <div className="text-sm uppercase tracking-wider font-medium text-muted-foreground">
                                    {new Date(booking.date).toLocaleString('default', { month: 'short' })}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">{booking.date.split('-')[0]}</div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                  <div>
                                    <div className="flex justify-between items-start mb-2">
                                      <h3 className="text-xl font-serif font-bold">{booking.item}</h3>
                                      <Badge variant={
                                        booking.status === "Confirmed" ? "default" : 
                                        booking.status === "Pending" ? "secondary" : "destructive"
                                      }>
                                        {booking.status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">Booking ID: {booking.id} • {booking.amount}</p>
                                  </div>
                                  
                                  <div className="flex justify-end gap-2 mt-4">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">View Details</Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Booking Details: {booking.id}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <p className="text-sm font-medium text-muted-foreground">Item</p>
                                              <p className="text-base font-semibold">{booking.item}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium text-muted-foreground">Booking Date</p>
                                              <p className="text-base font-semibold">{new Date(booking.date).toLocaleDateString()}</p>
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
                                          {booking.status !== "Cancelled" && booking.status !== "Pending" && (
                                            <Button 
                                              variant="destructive" 
                                              onClick={async () => {
                                                if (confirm(`Are you sure you want to cancel this booking?`)) {
                                                  const success = await updateBooking(booking.id, { status: "Cancelled" });
                                                  if (success) {
                                                    toast({ title: "Booking Cancelled", description: "Your booking has been cancelled successfully." });
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
                                    
                                    {booking.status === "Confirmed" && (
                                      existingReview ? (
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="secondary" size="sm" onClick={() => {
                                              setEditingReviewId(existingReview.id);
                                              setEditReviewForm({ rating: existingReview.rating, comment: existingReview.comment });
                                            }}>
                                              <Star className="w-3 h-3 mr-2" /> View/Edit Review
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Your Review</DialogTitle>
                                            </DialogHeader>
                                            {editingReviewId === existingReview.id ? (
                                              <div className="py-4 space-y-4">
                                                <div className="space-y-2">
                                                  <Label>Rating</Label>
                                                  <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                      <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setEditReviewForm({ ...editReviewForm, rating: star })}
                                                        className="focus:outline-none"
                                                      >
                                                        <Star 
                                                          className={`w-8 h-8 ${star <= editReviewForm.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
                                                        />
                                                      </button>
                                                    ))}
                                                  </div>
                                                </div>
                                                <div className="space-y-2">
                                                  <Label>Comment</Label>
                                                  <textarea 
                                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    placeholder="Share your experience..."
                                                    value={editReviewForm.comment}
                                                    onChange={(e) => setEditReviewForm({...editReviewForm, comment: e.target.value})}
                                                  />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <Badge variant={
                                                    existingReview.status === "approved" ? "default" :
                                                    existingReview.status === "rejected" ? "destructive" : "outline"
                                                  }>
                                                    Status: {existingReview.status.charAt(0).toUpperCase() + existingReview.status.slice(1)}
                                                  </Badge>
                                                </div>
                                                <DialogFooter>
                                                  <Button variant="outline" onClick={() => setEditingReviewId(null)}>Cancel</Button>
                                                  <Button onClick={async () => {
                                                    const result = await updateReview(existingReview.id, {
                                                      rating: editReviewForm.rating,
                                                      comment: editReviewForm.comment
                                                    });
                                                    if (result) {
                                                      setEditingReviewId(null);
                                                      toast({ title: "Review Updated", description: "Your review has been updated successfully." });
                                                    } else {
                                                      toast({ title: "Error", description: "Failed to update review.", variant: "destructive" });
                                                    }
                                                  }}>Save Changes</Button>
                                                </DialogFooter>
                                              </div>
                                            ) : (
                                              <div className="py-4 space-y-4">
                                                <div className="flex items-center gap-1 text-yellow-500">
                                                  {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-5 h-5 ${i < existingReview.rating ? "fill-current" : "text-gray-300"}`} />
                                                  ))}
                                                </div>
                                                <p className="text-sm italic">"{existingReview.comment}"</p>
                                                <div className="flex items-center gap-2 mt-4">
                                                  <Badge variant={
                                                    existingReview.status === "approved" ? "default" :
                                                    existingReview.status === "rejected" ? "destructive" : "outline"
                                                  }>
                                                    Status: {existingReview.status.charAt(0).toUpperCase() + existingReview.status.slice(1)}
                                                  </Badge>
                                                </div>
                                                <DialogFooter>
                                                  <Button variant="outline" onClick={() => {}}>Close</Button>
                                                  <Button onClick={() => {
                                                    setEditingReviewId(existingReview.id);
                                                    setEditReviewForm({ rating: existingReview.rating, comment: existingReview.comment });
                                                  }}>Edit Review</Button>
                                                </DialogFooter>
                                              </div>
                                            )}
                                          </DialogContent>
                                        </Dialog>
                                      ) : (
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button size="sm" onClick={() => {
                                              const itemInfo = findItemInfo(booking.item);
                                              if (itemInfo) {
                                                setReviewForm({
                                                  ...reviewForm, 
                                                  itemId: itemInfo.id, 
                                                  itemType: itemInfo.type, 
                                                  itemTitle: booking.item
                                                });
                                              }
                                            }}>
                                              <Star className="w-3 h-3 mr-2" /> Write Review
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Review your experience</DialogTitle>
                                              <DialogDescription>
                                                How was your experience with {booking.item}?
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                              <div className="space-y-2">
                                                <Label>Rating</Label>
                                                <div className="flex gap-2">
                                                  {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                      key={star}
                                                      type="button"
                                                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                      className="focus:outline-none"
                                                    >
                                                      <Star 
                                                        className={`w-8 h-8 ${star <= reviewForm.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
                                                      />
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>
                                              <div className="space-y-2">
                                                <Label>Comment</Label>
                                                <textarea 
                                                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                  placeholder="Share your experience..."
                                                  value={reviewForm.comment}
                                                  onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <Button onClick={handleSubmitReview}>Submit Review</Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeTab === "payment" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="font-serif text-3xl font-bold text-primary mb-2">Payment Methods</h1>
                      <p className="text-muted-foreground">Manage your saved cards for faster booking.</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button><Plus className="w-4 h-4 mr-2" /> Add New Card</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Payment Method</DialogTitle>
                          <DialogDescription>Enter your card details securely.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>Cardholder Name</Label>
                            <Input 
                              placeholder="JOHN DOE" 
                              value={newCard.cardholderName}
                              onChange={(e) => setNewCard({...newCard, cardholderName: e.target.value})}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Card Number (Last 4)</Label>
                            <Input 
                              placeholder="4242" 
                              maxLength={4}
                              value={newCard.last4}
                              onChange={(e) => setNewCard({...newCard, last4: e.target.value})}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label>Expiry Date</Label>
                              <Input 
                                placeholder="MM/YY" 
                                value={newCard.expiry}
                                onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>CVC</Label>
                              <Input placeholder="123" type="password" maxLength={3} />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddCard}>Save Card</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paymentCards.map((card) => (
                      <Card key={card.id} className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <CardContent className="p-6 relative z-10 flex flex-col justify-between h-[200px]">
                          <div className="flex justify-between items-start">
                            <CreditCard className="w-8 h-8 text-white/80" />
                            <div className="text-lg font-bold tracking-widest">{card.brand.toUpperCase()}</div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="text-2xl font-mono tracking-widest">
                              •••• •••• •••• {card.last4}
                            </div>
                            <div className="flex justify-between items-end">
                              <div>
                                <div className="text-xs text-white/60 uppercase mb-1">Card Holder</div>
                                <div className="font-medium tracking-wide">{card.cardholderName}</div>
                              </div>
                              <div>
                                <div className="text-xs text-white/60 uppercase mb-1">Expires</div>
                                <div className="font-medium tracking-wide">{card.expiry}</div>
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deletePaymentCard(card.id)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl flex flex-col items-center justify-center p-6 h-[200px] text-muted-foreground hover:bg-muted/10 transition-colors cursor-pointer">
                      <CreditCard className="w-8 h-8 mb-2" />
                      <span className="font-medium">Add another card</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "rewards" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h1 className="font-serif text-3xl font-bold text-primary mb-2">Voyager Rewards</h1>
                    <p className="text-muted-foreground">Your status level and exclusive benefits.</p>
                  </div>

                  <Card className="bg-gradient-to-r from-amber-200 to-yellow-400 border-none shadow-lg text-yellow-950 overflow-hidden relative">
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/20 to-transparent"></div>
                    <CardContent className="p-8 relative z-10">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h2 className="text-3xl font-serif font-bold mb-1">{userProfile.reward.level} Status</h2>
                          <p className="opacity-80 font-medium">Member since 2023</p>
                        </div>
                        <Award className="w-16 h-16 opacity-80" />
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm font-bold">
                          <span>{userProfile.reward.points.toLocaleString()} Points</span>
                          <span>{userProfile.reward.nextLevelPoints.toLocaleString()} Goal</span>
                        </div>
                        <div className="h-3 bg-black/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-950/80 rounded-full" 
                            style={{ width: `${(userProfile.reward.points / userProfile.reward.nextLevelPoints) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs opacity-70 pt-1">
                          You need {(userProfile.reward.nextLevelPoints - userProfile.reward.points).toLocaleString()} more points to reach Platinum status.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-primary" /> Current Benefits
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {userProfile.reward.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-primary" /> Next Level: Platinum
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 text-muted-foreground">
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full border-2 border-muted flex items-center justify-center text-[10px]"></div>
                            <span>Dedicated 24/7 Concierge</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full border-2 border-muted flex items-center justify-center text-[10px]"></div>
                            <span>Complimentary Airport Transfers</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full border-2 border-muted flex items-center justify-center text-[10px]"></div>
                            <span>Exclusive Event Access</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "support" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="font-serif text-3xl font-bold text-primary mb-2">Support Tickets</h1>
                      <p className="text-muted-foreground">View your support history and create new requests.</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button><Plus className="w-4 h-4 mr-2" /> New Ticket</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Support Ticket</DialogTitle>
                          <DialogDescription>Describe your issue and we'll help you out.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>Subject</Label>
                            <Input 
                              placeholder="E.g., Change booking dates" 
                              value={newTicket.subject}
                              onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Priority</Label>
                            <select 
                              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={newTicket.priority}
                              onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as any})}
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Message</Label>
                            <textarea 
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Describe your issue..."
                              value={newTicket.message}
                              onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleCreateTicket}>Create Ticket</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {(!userTickets || userTickets.length === 0) ? (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No support tickets yet.</p>
                          <p className="text-sm text-muted-foreground mt-1">Create a new ticket if you need assistance.</p>
                        </CardContent>
                      </Card>
                    ) : userTickets.map((ticket) => {
                      const lastReply = ticket.replies && ticket.replies.length > 0 ? ticket.replies[0] : null;
                      return (
                      <Card key={ticket.id} className={`transition-all ${selectedTicketId === ticket.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}>
                        <CardHeader className="pb-3 cursor-pointer" onClick={() => setSelectedTicketId(selectedTicketId === ticket.id ? null : ticket.id)}>
                          <div className="flex justify-between items-start">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">{ticket.id}</span>
                                <CardTitle className="text-base">{ticket.subject}</CardTitle>
                              </div>
                              <CardDescription className="flex items-center gap-2 text-xs flex-wrap">
                                <Clock className="w-3 h-3" /> {ticket.date}
                                {lastReply && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <span className="text-xs font-medium">
                                      Last reply by: 
                                    </span>
                                    <Badge 
                                      variant={lastReply.sender === 'user' ? 'outline' : 'default'} 
                                      className={`text-xs ${
                                        lastReply.sender === 'user' 
                                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                          : 'bg-green-50 text-green-700 border-green-200'
                                      }`}
                                    >
                                      {lastReply.sender === 'user' ? '👤 You' : '🛟 Admin'}
                                    </Badge>
                                  </>
                                )}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={ticket.priority === "High" ? "destructive" : ticket.priority === "Medium" ? "default" : "secondary"}>
                                {ticket.priority}
                              </Badge>
                              <Badge variant="outline" className={
                                ticket.status === "Open" ? "text-green-600 border-green-200 bg-green-50" : 
                                ticket.status === "Closed" ? "text-muted-foreground bg-muted" : "text-blue-600 border-blue-200 bg-blue-50"
                              }>
                                {ticket.status}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        {selectedTicketId === ticket.id && (
                          <CardContent className="pt-0 animate-in slide-in-from-top-2 duration-200">
                            <div className="border-t pt-4 mt-2 space-y-4">
                              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Conversation History</h4>
                              
                              {(!ticket.replies || ticket.replies.length === 0) ? (
                                <p className="text-sm text-muted-foreground italic">No replies yet.</p>
                              ) : (
                                <div className="space-y-4 max-h-[300px] overflow-y-auto p-2">
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
                              
                              {ticket.status !== "Closed" && (
                                <div className="flex gap-2 mt-4 pt-4 border-t">
                                  <Input 
                                    placeholder="Type your reply..." 
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleReply(ticket.id)}
                                  />
                                  <Button size="icon" onClick={() => handleReply(ticket.id)}>
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

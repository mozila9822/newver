import { Link, useLocation } from "wouter";
import { Plane, Menu, User, LogOut, Mail, Phone, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store-context";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        toast({
          title: "Subscribed!",
          description: "Thank you for subscribing to our newsletter.",
        });
        setEmail("");
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to subscribe');
      }
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message || "There was an error subscribing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input 
        type="email" 
        placeholder="Your email address" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
        className="bg-white/5 border border-white/10 rounded-sm px-4 py-2 text-sm w-full focus:outline-none focus:border-secondary text-white placeholder:text-white/40"
        required
      />
      <Button variant="secondary" size="sm" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "..." : "Join"}
      </Button>
    </form>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { footer, websiteSettings } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Update SEO
    if (websiteSettings) {
      document.title = websiteSettings.seoTitle;
      // In a real app, we would update meta tags here too using a library like react-helmet
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [websiteSettings]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/trips", label: "Trips" },
    { href: "/hotels", label: "Hotels" },
    { href: "/cars", label: "Private Transport" },
    { href: "/last-minute", label: "Last Minute", isSpecial: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground selection:bg-secondary selection:text-white">
      {/* Navbar */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-transparent",
          scrolled || location !== "/"
            ? "bg-white/90 backdrop-blur-md shadow-sm border-border py-4"
            : "bg-transparent py-6 text-white"
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
              {websiteSettings.logo ? (
                <img 
                  src={websiteSettings.logo} 
                  alt={websiteSettings.name} 
                  className="w-10 h-10 object-contain" 
                />
              ) : (
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border transition-colors",
                  scrolled || location !== "/" ? "border-primary text-primary" : "border-white text-white"
                )}>
                  <Plane className="w-5 h-5" />
                </div>
              )}
              <span className={cn(
                "font-serif text-2xl font-bold tracking-tight",
                scrolled || location !== "/" ? "text-primary" : "text-white"
              )}>
                {websiteSettings.name}
              </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "text-sm font-medium uppercase tracking-widest hover:text-secondary transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:bg-secondary after:transition-all after:duration-300",
                  location === link.href ? "text-secondary after:w-full" : "after:w-0 hover:after:w-full",
                  scrolled || location !== "/" ? "text-foreground" : "text-white/90",
                  link.isSpecial && "text-destructive font-bold hover:text-destructive/80 after:bg-destructive"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className={cn(
                    "flex items-center gap-2",
                    scrolled || location !== "/" ? "text-foreground" : "text-white hover:text-white hover:bg-white/10"
                   )}>
                     <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white">
                       {user.name.charAt(0)}
                     </div>
                     <span className="font-medium">{user.name}</span>
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className={cn(
                  "font-medium", 
                  scrolled || location !== "/" ? "text-foreground hover:text-primary hover:bg-primary/5" : "text-white hover:text-white hover:bg-white/10"
                )}>
                  Sign In
                </Button>
              </Link>
            )}
            
            <Link href="/trips">
              <Button className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-6 font-medium">
                Book Now
              </Button>
            </Link>
          </div>

          {/* Mobile Nav */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className={cn("h-6 w-6", scrolled || location !== "/" ? "text-foreground" : "text-white")} />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-6 mt-10">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={cn(
                      "text-lg font-serif font-medium hover:text-secondary transition-colors",
                      location === link.href ? "text-secondary" : "text-foreground",
                      link.isSpecial && "text-destructive"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    {user.role === "admin" && (
                      <Link href="/admin" className="text-lg font-serif font-medium hover:text-secondary transition-colors">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link href="/profile" className="text-lg font-serif font-medium hover:text-secondary transition-colors">
                      My Profile
                    </Link>
                    <button onClick={logout} className="text-lg font-serif font-medium text-left hover:text-destructive transition-colors">
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="text-lg font-serif font-medium hover:text-secondary transition-colors">
                    Sign In
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                {websiteSettings.logo ? (
                   <img src={websiteSettings.logo} alt={websiteSettings.name} className="w-8 h-8 object-contain" />
                ) : (
                   <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white">
                     <Plane className="w-4 h-4" />
                   </div>
                )}
                <span className="font-serif text-xl font-bold">{websiteSettings.name}</span>
              </div>
              <p className="text-primary-foreground/60 text-sm leading-relaxed mb-6">
                {footer.description}
              </p>
            </div>

            <div>
              <h4 className="font-serif text-lg mb-6">Experiences</h4>
              <ul className="space-y-4 text-sm text-primary-foreground/60">
                {footer.experiences.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="hover:text-secondary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-lg mb-6">Contact Us</h4>
              <ul className="space-y-4 text-sm text-primary-foreground/60">
                {websiteSettings.contactEmail && (
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${websiteSettings.contactEmail}`} className="hover:text-secondary transition-colors">
                      {websiteSettings.contactEmail}
                    </a>
                  </li>
                )}
                {websiteSettings.contactPhone && (
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${websiteSettings.contactPhone.replace(/\s/g, '')}`} className="hover:text-secondary transition-colors">
                      {websiteSettings.contactPhone}
                    </a>
                  </li>
                )}
                {websiteSettings.contactAddress && (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="whitespace-pre-line">{websiteSettings.contactAddress}</span>
                  </li>
                )}
                {websiteSettings.whatsappNumber && (
                  <li>
                    <a 
                      href={`https://wa.me/${websiteSettings.whatsappNumber.replace(/[^0-9+]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 hover:text-secondary transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-lg mb-6">Newsletter</h4>
              <p className="text-sm text-primary-foreground/60 mb-4">
                Subscribe for exclusive offers and travel inspiration.
              </p>
              <NewsletterForm />
              
              {/* Social Media Links */}
              {(websiteSettings.facebookUrl || websiteSettings.instagramUrl || websiteSettings.twitterUrl || websiteSettings.linkedinUrl || websiteSettings.youtubeUrl) && (
                <div className="mt-6">
                  <h5 className="text-sm font-medium mb-3">Follow Us</h5>
                  <div className="flex gap-4">
                    {websiteSettings.facebookUrl && (
                      <a href={websiteSettings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-secondary transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </a>
                    )}
                    {websiteSettings.instagramUrl && (
                      <a href={websiteSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-secondary transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      </a>
                    )}
                    {websiteSettings.twitterUrl && (
                      <a href={websiteSettings.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-secondary transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>
                    )}
                    {websiteSettings.linkedinUrl && (
                      <a href={websiteSettings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-secondary transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      </a>
                    )}
                    {websiteSettings.youtubeUrl && (
                      <a href={websiteSettings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-secondary transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/40 uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} {websiteSettings.name}. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
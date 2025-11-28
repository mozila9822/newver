import { Link, useLocation } from "wouter";
import { Plane, Menu, User, LogOut } from "lucide-react";
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
          <Link href="/">
            <a className="flex items-center gap-2 group">
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
            </a>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={cn(
                    "text-sm font-medium uppercase tracking-widest hover:text-secondary transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:bg-secondary after:transition-all after:duration-300",
                    location === link.href ? "text-secondary after:w-full" : "after:w-0 hover:after:w-full",
                    scrolled || location !== "/" ? "text-foreground" : "text-white/90",
                    link.isSpecial && "text-destructive font-bold hover:text-destructive/80 after:bg-destructive"
                  )}
                >
                  {link.label}
                </a>
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
                  <Link key={link.href} href={link.href}>
                    <a className={cn(
                      "text-lg font-serif font-medium hover:text-secondary transition-colors",
                      location === link.href ? "text-secondary" : "text-foreground",
                      link.isSpecial && "text-destructive"
                    )}>
                      {link.label}
                    </a>
                  </Link>
                ))}
                {user ? (
                  <>
                    {user.role === "admin" && (
                      <Link href="/admin">
                        <a className="text-lg font-serif font-medium hover:text-secondary transition-colors">
                          Admin Dashboard
                        </a>
                      </Link>
                    )}
                    <Link href="/profile">
                      <a className="text-lg font-serif font-medium hover:text-secondary transition-colors">
                        My Profile
                      </a>
                    </Link>
                    <button onClick={logout} className="text-lg font-serif font-medium text-left hover:text-destructive transition-colors">
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login">
                    <a className="text-lg font-serif font-medium hover:text-secondary transition-colors">
                      Sign In
                    </a>
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
                    <Link href={link.href}>
                      <a className="hover:text-secondary transition-colors">{link.label}</a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-lg mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-primary-foreground/60">
                {footer.company.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="hover:text-secondary transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-lg mb-6">Newsletter</h4>
              <p className="text-sm text-primary-foreground/60 mb-4">
                Subscribe for exclusive offers and travel inspiration.
              </p>
              <NewsletterForm />
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/40 uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} {websiteSettings.name}. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
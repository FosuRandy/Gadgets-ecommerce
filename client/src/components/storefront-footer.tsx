import { Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "wouter";

export function StorefrontFooter() {
  const contactEmail = "fosurandy0@gmail.com";
  
  const handleEmailClick = (service: 'gmail' | 'outlook') => {
    const subject = encodeURIComponent("Inquiry from Smice Gadgets");
    const body = encodeURIComponent("Hello,\n\nI have a question about...\n\n");
    
    if (service === 'gmail') {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}&su=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://outlook.live.com/mail/0/deeplink/compose?to=${contactEmail}&subject=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className="border-t bg-card mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">About Smice Gadgets</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted source for quality electronics and accessories.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Contact Us</h3>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              <span className="text-muted-foreground">{contactEmail}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEmailClick('gmail')}
                data-testid="button-email-gmail"
              >
                Email via Gmail
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEmailClick('outlook')}
                data-testid="button-email-outlook"
              >
                Email via Outlook
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faqs" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-faqs">
                  FAQs
                </Link>
              </li>
              <li className="text-muted-foreground">Returns & Exchanges</li>
              <li className="text-muted-foreground">Delivery Information</li>
              <li className="text-muted-foreground">Payment Options</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Smice Gadgets. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

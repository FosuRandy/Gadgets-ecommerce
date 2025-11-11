import { StorefrontHeader } from "@/components/storefront-header";
import { StorefrontFooter } from "@/components/storefront-footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept payments through Paystack, which supports credit/debit cards, mobile money, and bank transfers. All transactions are secure and encrypted."
  },
  {
    question: "How do I place an order?",
    answer: "Browse our products, add items to your cart, and proceed to checkout. Fill in your delivery information and complete the payment. You'll receive an order confirmation via email."
  },
  {
    question: "What is your delivery area?",
    answer: "We currently deliver within Accra and surrounding areas. Delivery time depends on your location and product availability."
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery typically takes 1-3 business days within Accra. We'll contact you to confirm delivery details after your order is processed."
  },
  {
    question: "Can I cancel or modify my order?",
    answer: "You can cancel or modify your order within 2 hours of placing it. Please contact us immediately via email at fosurandy0@gmail.com."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return guarantee on most products. Items must be in original condition with all packaging and accessories. Contact us to initiate a return."
  },
  {
    question: "Are the products genuine?",
    answer: "Yes, all our products are 100% genuine and sourced from authorized distributors. We guarantee authenticity on all items sold."
  },
  {
    question: "Do you offer warranty on products?",
    answer: "Yes, all electronics come with manufacturer's warranty. Warranty terms vary by product - check the product description for specific details."
  },
  {
    question: "How can I track my order?",
    answer: "After your order is dispatched, we'll send you tracking information via email. You can also contact us for order status updates."
  },
  {
    question: "What if I receive a damaged product?",
    answer: "If you receive a damaged or defective product, please contact us immediately at fosurandy0@gmail.com with photos of the damage. We'll arrange for a replacement or refund."
  },
  {
    question: "Do you offer bulk discounts?",
    answer: "Yes, we offer special pricing for bulk orders. Please contact us at fosurandy0@gmail.com with your requirements for a custom quote."
  },
  {
    question: "How can I contact customer support?",
    answer: "You can reach us via email at fosurandy0@gmail.com. We respond to all inquiries within 24 hours during business days."
  }
];

export default function FAQs() {
  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions about shopping at Smice Gadgets
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Common Questions</CardTitle>
              <CardDescription>
                Everything you need to know about our products, delivery, and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger data-testid={`faq-question-${index}`}>
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent data-testid={`faq-answer-${index}`}>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Still have questions?</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Contact us directly
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Email us at{" "}
                <a
                  href="mailto:fosurandy0@gmail.com"
                  className="text-primary hover:underline"
                  data-testid="link-contact-email"
                >
                  fosurandy0@gmail.com
                </a>{" "}
                and we'll get back to you within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <StorefrontFooter />
    </div>
  );
}

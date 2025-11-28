import Layout from "@/components/layout";
import { useStore } from "@/lib/store-context";

export default function TermsOfServicePage() {
  const { websiteSettings } = useStore();

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary to-primary/90 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-lg text-white/80">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using {websiteSettings.name}'s website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">2. Services Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              {websiteSettings.name} provides luxury travel booking services, including but not limited to: hotel reservations, trip packages, private transportation arrangements, and last-minute travel deals. We act as an intermediary between you and travel service providers.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To access certain features of our services, you may need to create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">4. Booking and Reservations</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When making a booking through our platform:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>All bookings are subject to availability and confirmation</li>
              <li>Prices are subject to change until booking is confirmed</li>
              <li>You are responsible for providing accurate traveler information</li>
              <li>Specific terms of each travel provider also apply</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">5. Payment Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Payment for bookings must be made through our accepted payment methods. By providing payment information, you represent that you are authorized to use the payment method. All payments are processed securely through our payment partners.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Full payment or deposit may be required at time of booking</li>
              <li>Prices are displayed in the currency indicated</li>
              <li>Additional fees may apply (taxes, service charges)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">6. Cancellation and Refund Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cancellation policies vary depending on the type of booking and travel provider:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Free cancellation periods may apply to certain bookings</li>
              <li>Cancellation fees may be charged based on timing</li>
              <li>Non-refundable bookings are clearly marked</li>
              <li>Refunds are processed to the original payment method</li>
              <li>Processing time for refunds may vary</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">7. User Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Use our services for any unlawful purpose</li>
              <li>Provide false or misleading information</li>
              <li>Interfere with the proper functioning of the website</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Reproduce or redistribute our content without permission</li>
              <li>Use automated systems to access our services</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">8. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on our website, including text, graphics, logos, images, and software, is the property of {websiteSettings.name} or its content suppliers and is protected by intellectual property laws. You may not use, reproduce, or distribute any content without our express written permission.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              {websiteSettings.name} acts as an intermediary and is not liable for: acts, errors, or omissions of travel service providers; personal injury, property damage, or other damages arising from travel; delays, cancellations, or changes by travel providers; force majeure events. Our maximum liability is limited to the fees paid for our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">10. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless {websiteSettings.name}, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of our services or violation of these terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">11. Third-Party Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of these external sites. We encourage you to review the terms and privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">12. Modifications to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the website. Your continued use of our services after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">13. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms or your use of our services shall be resolved through appropriate legal channels.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">14. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions or concerns regarding these Terms of Service, please contact us:
            </p>
            <div className="mt-4 p-6 bg-muted/30 rounded-lg">
              <p className="font-semibold text-primary">{websiteSettings.name}</p>
              {websiteSettings.contactEmail && <p className="text-muted-foreground">Email: {websiteSettings.contactEmail}</p>}
              {websiteSettings.contactPhone && <p className="text-muted-foreground">Phone: {websiteSettings.contactPhone}</p>}
              {websiteSettings.contactAddress && <p className="text-muted-foreground">Address: {websiteSettings.contactAddress}</p>}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

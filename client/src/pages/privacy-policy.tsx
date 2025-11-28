import Layout from "@/components/layout";
import { useStore } from "@/lib/store-context";

export default function PrivacyPolicyPage() {
  const { websiteSettings } = useStore();

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary to-primary/90 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-white/80">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to {websiteSettings.name}. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Personal identification information (name, email address, phone number)</li>
              <li>Billing and payment information</li>
              <li>Travel preferences and booking history</li>
              <li>Communications and correspondence with us</li>
              <li>Account login credentials</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Process and manage your travel bookings</li>
              <li>Send booking confirmations and travel updates</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Improve our services and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">4. Information Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may share your personal information with third parties only in the following circumstances: with travel service providers (hotels, airlines, car rental companies) to fulfill your bookings; with payment processors to complete transactions; with service providers who assist in our operations; when required by law or to protect our rights; and with your consent.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Right to access your personal information</li>
              <li>Right to correct inaccurate data</li>
              <li>Right to request deletion of your data</li>
              <li>Right to restrict or object to processing</li>
              <li>Right to data portability</li>
              <li>Right to withdraw consent</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">7. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings. Some cookies are essential for the website to function properly.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services are not directed to children under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
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

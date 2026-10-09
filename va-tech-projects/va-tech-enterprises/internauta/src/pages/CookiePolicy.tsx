import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CookiePolicy = () => {
  return (
    <div className="relative min-h-screen">
      <Header />

      <section className="pt-32 pb-20">
        <div className="tesla-container px-4 sm:px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl sm:text-5xl font-medium mb-8">Política de Cookies</h1>
            <p className="text-muted-foreground mb-8">
              Last updated: January 26, 2026
            </p>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <section className="mb-12">
                <h2 className="text-2xl font-medium mb-4">What Are Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide information to the website owners.
                </p>
                <p className="text-muted-foreground">
                  Cookies help us enhance your experience on our website by remembering your preferences, analyzing how you use our site, and personalizing content and advertisements.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium mb-4">Types of Cookies We Use</h2>

                <div className="space-y-6">
                  <div className="p-6 bg-secondary/50 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Essential Cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and shopping cart functionality. The website cannot function properly without these cookies.
                    </p>
                  </div>

                  <div className="p-6 bg-secondary/50 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Analytics Cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and services.
                    </p>
                  </div>

                  <div className="p-6 bg-secondary/50 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Functional Cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.
                    </p>
                  </div>

                  <div className="p-6 bg-secondary/50 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Marketing Cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third-party advertisers.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium mb-4">Managing Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, as it will no longer be personalized to you.
                </p>
                <p className="text-muted-foreground mb-4">
                  Here's how to manage cookies in major browsers:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Chrome: Settings → Privacy and Security → Cookies</li>
                  <li>Firefox: Settings → Privacy & Security → Cookies</li>
                  <li>Safari: Preferences → Privacy → Cookies</li>
                  <li>Edge: Settings → Privacy, Search and Services → Cookies</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium mb-4">Third-Party Cookies</h2>
                <p className="text-muted-foreground">
                  In some cases, we use cookies provided by trusted third parties. This includes analytics services like Google Analytics, which help us understand how you use our site so we can continue to improve your experience. These third-party cookies are subject to the respective third parties' privacy policies.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium mb-4">Cookie Duration</h2>
                <p className="text-muted-foreground mb-4">
                  Cookies can be either "session" or "persistent" cookies:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>
                    <strong>Session cookies:</strong> These are temporary cookies that expire when you close your browser.
                  </li>
                  <li>
                    <strong>Persistent cookies:</strong> These cookies remain on your device for a set period or until you delete them.
                  </li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium mb-4">Your Consent</h2>
                <p className="text-muted-foreground">
                  By continuing to use our website, you consent to our use of cookies as described in this policy. You can withdraw your consent at any time by deleting your cookies or adjusting your browser settings.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium mb-4">Updates to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Please revisit this page regularly to stay informed about our use of cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium mb-4">Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about our use of cookies, please contact us at Geral@vatech.pt or visit our Contact page.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CookiePolicy;

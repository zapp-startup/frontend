import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { getPrivacyPolicyMeta } from "@/config/privacy";
import { COLORS, GLOWS } from "@/shared/theme";

/**
 * Public privacy policy. Wording is factual for an early-stage product; not legal advice.
 */
export function PrivacyPolicyPage() {
  const meta = getPrivacyPolicyMeta();

  return (
    <div className="min-h-screen bg-[#0B1220] text-white px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div
          className="rounded-3xl border border-white/10 p-10 shadow-2xl"
          style={{ backgroundColor: COLORS.bgCard, boxShadow: GLOWS.ambient() }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-2">
            Version {meta.version} · Effective {meta.effectiveDate}
          </p>
          <h1 className="text-4xl font-black tracking-tight mb-8">Privacy Policy</h1>

          <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-lg font-black text-white mb-2">1. Information we collect</h2>
              <p>
                We collect information you provide (such as name, email, and account preferences), authentication data
                managed by our identity provider, and—if you choose to connect a bank—financial account and transaction
                information made available through Plaid, as authorized by you.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-black text-white mb-2">2. How we use information</h2>
              <p>
                We use information to operate the Zapp service, personalize insights, maintain security, communicate with
                you about your account, and comply with law. We do not sell your personal information for cross-context
                behavioral advertising.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-black text-white mb-2">3. Financial data and Plaid</h2>
              <p>
                When you connect a financial institution, you interact with Plaid’s connection flow. Plaid’s collection and
                use of data is governed by Plaid’s policies. We receive only the categories of data you authorize and
                that Plaid makes available to us. Linking a bank is optional.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-black text-white mb-2">4. Data sharing</h2>
              <p>
                We share data with service providers who help us run the product (for example, hosting, authentication,
                and analytics), and with Plaid when you connect accounts. We may disclose information if required by law
                or to protect rights and safety. We do not sell your personal information.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-black text-white mb-2">5. Data retention</h2>
              <p>
                We retain information as long as your account is active and as needed to provide the service, meet legal
                obligations, and resolve disputes. Specific retention periods may be implemented on our systems; contact us
                for deletion requests as described below.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-black text-white mb-2">6. Data security</h2>
              <p>
                We use industry-standard safeguards appropriate to the nature of our service, including transport
                encryption for data in transit between your browser and our APIs when properly configured. No method of
                transmission or storage is 100% secure; we cannot guarantee absolute security.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-black text-white mb-2">7. Your choices</h2>
              <p>
                You may update certain profile information in the app, disconnect linked banks, and request account
                deletion or privacy inquiries by emailing {meta.privacyEmail}. We will respond subject to applicable law
                and verification of your request.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-black text-white mb-2">8. Contact</h2>
              <p>
                Questions: {meta.supportEmail}. Privacy-specific requests: {meta.privacyEmail}.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-black text-white mb-2">9. Changes</h2>
              <p>
                We may update this policy; the version and effective date at the top will change when we do. Continued use
                of the service after changes may constitute acceptance where permitted by law.
              </p>
            </section>
          </div>

          <div className="mt-10 pt-8 border-t border-white/10">
            <Link to="/login" className="text-cyan-400 font-bold text-sm hover:underline">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

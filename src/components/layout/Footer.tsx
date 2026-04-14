export function Footer() {
  return (
    <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 mt-auto py-12 md:py-16">
      <div className="container-max">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-10">
          <div className="lg:col-span-1">
            <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              MessSync
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
              Simplifying mess management and expense tracking for shared
              households.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
              Features
            </h4>
            <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Meal Tracking
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Expense Management
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Real-time Chat
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                >
                  PDF Reports
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
              Support
            </h4>
            <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Privacy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
              Legal
            </h4>
            <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Terms
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-8 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            &copy; 2024 MessSync. All rights reserved. | Built with passion for
            shared living.
          </p>
        </div>
      </div>
    </footer>
  );
}

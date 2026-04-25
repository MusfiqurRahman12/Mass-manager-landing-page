export function Footer() {
  return (
    <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200/60 dark:border-neutral-800/60 mt-auto py-8">
      <div className="container-max flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MessSync
          </span>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center md:text-left">
            Modern mess management for shared living.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          <a href="#" className="hover:text-primary dark:hover:text-primary-400 transition-colors">Features</a>
          <a href="#" className="hover:text-primary dark:hover:text-primary-400 transition-colors">Pricing</a>
          <a href="#" className="hover:text-primary dark:hover:text-primary-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary dark:hover:text-primary-400 transition-colors">Terms</a>
        </div>
        
        <div className="text-sm text-neutral-400 dark:text-neutral-500">
          &copy; {new Date().getFullYear()} MessSync. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

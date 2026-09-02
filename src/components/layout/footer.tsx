export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-4">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-zinc-500 text-sm">
          Body Trainer App &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

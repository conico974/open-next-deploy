export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}

      <footer className="bg-zinc-800 dark:bg-zinc-700 text-white py-8">
        <div className="text-center">
          <p>&copy; 2023 Timeless Luxury Watches. All rights reserved.</p>
          <p>Terms & Conditions | Privacy Policy</p>
        </div>
      </footer>
    </div>
  );
}

//developer: Maarten Lopes
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css"; 

//body styling and flex to keep the footer at the bottom
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" >
      <body className="flex flex-col min-h-screen h-full bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#4f46e5] text-white font-sans">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

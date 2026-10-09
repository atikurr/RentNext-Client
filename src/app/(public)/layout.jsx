import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main>{children}</main>

      <Footer />
    </div>
  );
}
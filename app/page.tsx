import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FeaturedProducts } from "@/components/home/featured-products";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
}

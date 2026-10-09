import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import HowRentNestWorks from "@/components/home/HowRentNestWorks";
import CustomerReviews from "@/components/home/CustomerReviews";
import ListYourProperty from "@/components/home/ListYourProperty";
import ContactUs from "@/components/home/ContactUs";
import TopCities from "@/components/home/TopCities";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <FeaturedProperties />
      <WhyChooseUs />
      <HowRentNestWorks />
      <TopCities/>
      <CustomerReviews />
      <ListYourProperty />
      <ContactUs/>
    </main>
  );
}
import Navigation from "@/components/Navigation";
import Hero3D from "@/components/Hero3D";
import About from "@/components/About";
import Work from "@/components/Work";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navigation />
      
      <main className="flex-1 relative">
        <Hero3D />
        <About />
        <Work />
        <Skills />
        <Contact />
      </main>
      
      <Footer />
    </>
  );
}
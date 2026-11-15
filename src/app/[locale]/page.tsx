import Hero from "../../components/mainPage/hero";
import Contact from "../../components/mainPage/contact";
import Projects from "../../components/mainPage/projects";
import Services from "../../components/mainPage/services";
import Technologies from "../../components/mainPage/technologies";

export default function Home() {
  return (
    <main className="bg-[#02040a] flex flex-col">
      <Hero />
      <Services />
      <Projects />
      <Technologies />
      <Contact />
    </main>
  );
}

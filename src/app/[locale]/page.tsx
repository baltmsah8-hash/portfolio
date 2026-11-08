import Hero from "../../components/mainPage/hero";
import Contact from "../../components/mainPage/contact";
import Projects from "../../components/mainPage/projects";
import Services from "../../components/mainPage/services";
import Technologies from "../../components/mainPage/technologies";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <Projects />
      <Technologies />
      <Contact />
    </main>
  );
}

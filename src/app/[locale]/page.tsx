import Hero from "../../components/main/hero";
import Contact from "../../components/main/contact";
import Projects from "../../components/main/projects";
import Services from "../../components/main/services";
import Technologies from "../../components/main/technologies";

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

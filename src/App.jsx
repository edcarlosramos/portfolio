import { useRef } from 'react';
import {
  Hero,
  Navbar,
  SmoothScroll,
  Statement,
  Projects,
  About,
  Skills,
  Contact,
  Footer,
  PageIntro,
} from './components';
import useScrollReveal from './hooks/useScrollReveal';

const App = () => {
  const pageRef = useRef(null);

  useScrollReveal(pageRef);

  return (
    <>
      <Navbar />

      <SmoothScroll>
        {/* Fundo claro único: as seções são transparentes, o que deixa a
            elipse do hero transbordar e evita frestas subpixel do smoother. */}
        <div ref={pageRef} className="overflow-x-clip bg-hugewhite-bg">
          <main>
            <Hero />
            <Statement />
            <Projects />
            <About />
            <Skills />
            <Contact />
          </main>
          <Footer />
        </div>
      </SmoothScroll>

      {/* Depois do Hero e da Navbar: anima a entrada dos dois. */}
      <PageIntro />
    </>
  );
};

export default App;

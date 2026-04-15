import { useState } from "react";
import { SegmentoWaitlistModal } from "@segmento/react-waitlist-ui";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";

const TOKEN =
  "eyJ2IjoxLCJwaWQiOiJteS1maXJzdC1wcm9qZWN0IiwibmFtZSI6Ik15IGZpcnN0IHByb2plY3QiLCJjaGsiOiJjMWU2ODFhMiJ9";

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
        </div>
        <button className="counter" onClick={() => setOpen(true)}>
          Open modal
        </button>
      </section>

      <SegmentoWaitlistModal
        token={TOKEN}
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => setTimeout(() => setOpen(false), 1500)}
      />
    </>
  );
}

export default App;

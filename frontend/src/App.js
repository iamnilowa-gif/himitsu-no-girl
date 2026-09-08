import "./App.css";

function App() {
  return (
    <iframe
      src="/himitsu/index.html"
      title="Himitsu no Girl"
      data-testid="app-frame"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: "none",
        display: "block",
      }}
    />
  );
}

export default App;

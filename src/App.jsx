import Studio from "./Studio.jsx";
import Controls from "./Controls.jsx";
import { ViewerProvider } from "./state.jsx";

export default function App() {
  return (
    <ViewerProvider>
      <div style={{ position: "relative", height: "100%", width: "100%" }}>
        <Studio />
        <Controls />
      </div>
    </ViewerProvider>
  );
}

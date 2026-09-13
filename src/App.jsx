import Studio from "./Studio.jsx";
import Controls from "./Controls.jsx";
import { ViewerProvider } from "./state.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";

export default function App() {
  return (
    <ViewerProvider>
      <div style={{ position: "relative", height: "100%", width: "100%" }}>
        <ErrorBoundary>
          <Studio />
        </ErrorBoundary>
        <Controls />
      </div>
    </ViewerProvider>
  );
}

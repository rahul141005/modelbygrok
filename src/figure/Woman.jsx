import Solenne from "./Solenne.jsx";

/**
 * Backward-compatible wrapper for Woman.jsx delegating to the new modular Solenne model.
 */
export default function Woman(props) {
  return <Solenne {...props} />;
}

import { useEffect, useState } from "react";
import { useDeepgramTranscription } from "./Utilities/connection";
import "./App.css";

function App() {
  const [listening, setListening] = useState(false);
  const { captions, captionsList, analysis, toggleListen } =
    useDeepgramTranscription();
  const handleListenClick = () => {
    setListening((prev) => !prev);
    toggleListen();
  };

  useEffect(() => {
    console.log(captions);
  }, [captions]);

  return (
    <>
      <button onClick={() => handleListenClick()}>Start</button>
      <p>{captionsList}</p>
    </>
  );
}

export default App;

import { useEffect, useState } from "react";
import { useDeepgramTranscription } from "./Utilities/connection";
import "./App.css";
import GetLinkToken from "./GetLinkToken";

function App() {
  const [listening, setListening] = useState(false);
  const { captions, captionsList, analysis, toggleListen } =
    useDeepgramTranscription();
  const handleListenClick = () => {
    setListening((prev) => !prev);
    toggleListen();
  };
  const [queryResult, setQueryResult] = useState();

  useEffect(() => {
    console.log(captions, queryResult);
  }, [captions, queryResult]);

  const queryCouchbase = async () => {
    const response = await fetch("http://127.0.0.1:8000/queryCouchbase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: captions }),
    });
    const data = await response.json();
    setQueryResult(data);
    console.log(data);
    return;
  };

  return (
    <>
      <button onClick={() => handleListenClick()}>
        {!listening ? <p>Start</p> : <p>Stop</p>}
      </button>
      <p>{captionsList}</p>
      <button onClick={() => queryCouchbase()}>
        <p>Query</p>
      </button>
      <p>{JSON.stringify(queryResult)}</p>
      {/* <GetLinkToken /> */}
    </>
  );
}

export default App;

import { useState, useEffect } from "react";
import { start, closeMicrophone } from "./microphone";
import { v4 as uuidv4 } from "uuid";

export const useDeepgramTranscription = () => {
  const [listen, setListen] = useState(false);
  const [captions, setCaptionsState] = useState("");
  const [microphone, setMicrophone] = useState<MediaRecorder | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [captionsList, setCaptionsList] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState(null);
  const webSocketUrl = import.meta.env.VITE_DEEPGRAM_SERVER_URL;

  useEffect(() => {
    console.log("captionsList updated:", captionsList);
  }, [captionsList]);

  const toggleListen = () => {
    setListen((prev) => !prev);
  };

  const stopListening = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
      console.log("client: WebSocket connection closed");
    }
    if (microphone) {
      closeMicrophone(microphone);
      console.log("client: microphone stopped");
    }
    setListen(false);
  };

  const analyzeTranscription = (transcript: string) => {
    if (transcript.length < 50) {
      console.log("client: Transcription too short for analysis");
      return;
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "analyze",
          transcription: transcript,
        })
      );
      console.log("client: Analysis request sent to server");
    }
  };

  // WebSocket and microphone setup
  useEffect(() => {
    if (listen) {
      const userUuid = uuidv4();
      const newSocket = new WebSocket(`${webSocketUrl}?uuid=${userUuid}`);

      setSocket(newSocket);

      newSocket.addEventListener("open", async () => {
        console.log("client: Connected to server with UUID:", userUuid);
        const mic = await start(newSocket);
        setMicrophone(mic || null);
      });

      newSocket.addEventListener("message", (event) => {
        console.log("Received message from WebSocket:", event.data);

        if (event.data === "connected") {
          console.log("WebSocket connected, no need to parse.");
          return;
        }

        let data;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          console.error("Failed to parse JSON:", e);
          return;
        }

        if (
          data &&
          data.channel &&
          data.channel.alternatives &&
          data.channel.alternatives[0] &&
          data.channel.alternatives[0].transcript
        ) {
          const newCaption =
            data.channel.alternatives[0].transcript.toString() + " ";
          setCaptionsState(newCaption);
          setCaptionsList((prevList) => [...prevList, newCaption]);
        }

        if (data.data) {
          setAnalysis(data.data);
        } else {
          console.log("no data.data", data);
        }
      });

      newSocket.addEventListener("close", () => {
        console.log("client: Disconnected from server");
      });

      return () => {
        if (newSocket && newSocket.readyState === WebSocket.OPEN) {
          newSocket.close();
          console.log("client: WebSocket connection closed");
        }
        if (microphone) {
          closeMicrophone(microphone);
          console.log("client: microphone stopped");
        }
      };
    }
  }, [listen]);

  const handleResetTranscription = () => {
    setCaptionsState("");
    setCaptionsList([]);
  };

  return {
    listen,
    toggleListen,
    stopListening,
    analyzeTranscription,
    captions,
    captionsList,
    handleResetTranscription,
    microphone,
    analysis,
  };
};

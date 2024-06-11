// src/components/MessageForm.tsx
import React from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { io } from "socket.io-client";

const App = () => {
  const [message, setMessage] = React.useState<string>("");
  const [messages, setMessages] = React.useState<string[]>([]);
  const [room, setRoom] = React.useState<string>("");
  const [roomId, setRoomId] = React.useState<string>("");

  // connection with the server (circuit)
  const socket = React.useMemo(() => {
    return io("http://localhost:8000");
  }, []);

  React.useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to the server");
    });

    socket.on("message-broadcast", ({ message }: { message: string }) => {
      console.log(message);
      setMessages((prev) => [...prev, message]);
    });

    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data.message]);
    });

    // listening the personal message
    socket.on("message-particular", ({ message }: { message: string }) => {
      setMessages((prev) => [...prev, message]);
    });

    // clean up function - component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket.emit("message-particular", {
      message: message,
      room: room,
    });

    setMessage("");
    setRoom("");
  };

  const handleJoin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket.emit("join-room", {
      roomId,
    });
    setRoomId("");
  };

  return (
    <div className="flex flex-col space-y-2 justify-center min-h-screen items-center">
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-2">
        <div className="">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="message..."
          />
          <Input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="room..."
          />
        </div>

        <Button type="submit">Submit</Button>
      </form>

      <form onSubmit={handleJoin} className="max-w-sm mx-auto space-y-2">
        <div className="">
          <Input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="join another room..."
          />
        </div>

        <Button type="submit">Submit</Button>
      </form>

      <div>
        <label className="py-2 font-bold text-md">Outputs</label>
        <div className="flex flex-col w-[300px] bg-slate-800 rounded-md p-2 text-white">
          {messages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;

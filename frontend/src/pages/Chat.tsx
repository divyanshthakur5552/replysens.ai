import { useParams } from "react-router-dom";

export default function Chat() {
  const { id } = useParams();

  return (
    <div>
      <h1>Chat {id}</h1>
    </div>
  );
}

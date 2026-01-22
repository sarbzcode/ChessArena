import CapturedPieces from "./CapturedPieces";
import MoveList from "./MoveList";

const LeftPanel = () => {
  return (
    <div className="flex flex-col gap-4">
      <CapturedPieces />
      <MoveList />
    </div>
  );
};

export default LeftPanel;

export default function LoadingState({
  message = "Chargement..."
}) {
  return (
    <div className="state-message">
      <p>{message}</p>
    </div>
  );
}
export default function ErrorMessage({
  message
}) {
  return (
    <div className="state-message state-message--error">
      <p>{message}</p>
    </div>
  );
}
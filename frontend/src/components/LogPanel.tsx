export default function LogPanel({ open, job }: any) {
  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 10,
      right: 10,
      width: 320,
      background: "#111",
      color: "#0f0",
      padding: 10,
      fontSize: 12,
      zIndex: 9999
    }}>
      <div>JOB DEBUG</div>
      <pre>{JSON.stringify(job, null, 2)}</pre>
    </div>
  );
}
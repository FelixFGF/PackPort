export default function LoadingModal({ open }: { open: boolean }) {
  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <div style={{ color: "white", fontSize: 18 }}>
        Loading modpack...
      </div>
    </div>
  );
}
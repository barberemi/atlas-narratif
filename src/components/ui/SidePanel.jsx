export default function SidePanel({ width = 420, onClose, children }) {
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
        style={{
          width,
          backgroundColor: '#0d1b2a',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-16px 0 48px rgba(0,0,0,0.6)',
        }}
      >
        {children}
      </div>
    </>
  );
}

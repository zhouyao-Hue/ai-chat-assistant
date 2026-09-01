import "@/components/Skeleton.css";

/**
 * 流式等待时的占位骨架条。
 * @param props.lines - 骨架行数，默认 3
 */
export default function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton-bubble">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton-line" style={{ width: `${80 - i * 15}%` }} />
      ))}
    </div>
  );
}

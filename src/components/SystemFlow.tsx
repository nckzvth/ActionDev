import { ArrowRight } from "lucide-react";

export function SystemFlow({ description }: { description: string }) {
  const items = description
    .split(/(?:→|->|,| and )/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
  const nodes = items.length >= 2 ? items : ["Input or data", "Shared rule", "Validation", "Observable result"];

  return (
    <figure className="system-flow">
      <div className="flow-track" aria-hidden="true">
        {nodes.map((node, index) => (
          <div className="flow-fragment" key={`${node}-${index}`}>
            <span>{node}</span>
            {index < nodes.length - 1 && <ArrowRight size={16} />}
          </div>
        ))}
      </div>
      <figcaption>{description}. The linear order above is also the diagram’s text alternative.</figcaption>
    </figure>
  );
}


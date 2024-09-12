import { ElementCard } from "./ElementCard";

export interface Element {
  name: string;
  key: string;
}

interface ElementListProps {
  elements: Element[];
  onElementClick: (element: Element) => void;
}

export const ElementList: React.FC<ElementListProps> = ({
  elements,
  onElementClick,
}) => (
  <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {elements.map((element) => (
      <ElementCard
        key={element.key || element.name}
        name={element.name}
        onClick={() => onElementClick(element)}
      />
    ))}
  </div>
);

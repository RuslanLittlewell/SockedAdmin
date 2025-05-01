import { UserStateProps } from '@/store';
import { useState, useRef, useEffect, FC, MouseEvent } from 'react';

interface Props {
  onChange: (e: string) => void;
  value: string;
  items: UserStateProps[];
}

const ColorSelect: FC<Props> = ({
  onChange,
  value,
  items
}) => {
  const [selected, setSelected] = useState<UserStateProps>(items[0]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: UserStateProps) => {
    setSelected(option);
    onChange(option.name);
    setIsOpen(false);
  };
  // Закрытие выпадающего меню при клике вне его области
  useEffect(() => {
    if(value) {
      const val = items?.find(i => i.name === value)
     setSelected(val as UserStateProps);
    }

    const handleClickOutside = (event: MouseEvent | Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [items]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="bg-white/10 h-full items-center space-between flex text-white rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center w-full">
          <div className={`w-full h-4 items-center flex ${selected?.color} mr-2`}>{selected?.name}</div>
        </div>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M19 9l-7 7-7-7"}
          />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute w-[140px] h-[300px] overflow-auto z-10 bottom-0 rounded  mt-1 w-full bg-gray-800 text-white border-gray-300 rounded shadow-lg">
          {items.map((option) => (
            <div
              key={option.id}
              className="flex items-center p-2 hover:bg-gray-900 cursor-pointer"
              onClick={() => handleSelect(option)}
            >
              <div className={`w-full h-4 rounded ${option.color}`}>{option.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorSelect;

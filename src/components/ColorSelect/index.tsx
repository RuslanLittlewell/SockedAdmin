import { useState, useRef, useEffect, FC, MouseEvent } from 'react';

interface ColorOption {
  value: string;
  label: string;
  colorClass: string;
}

interface Props {
  onChange: (e: string) => void;
  value: string;
}
const colorOptions: ColorOption[] = [
  { value: 'text-green-500', label: 'Зеленый', colorClass: 'bg-green-500' },
  { value: 'text-red-500', label: 'Красный', colorClass: 'bg-red-500' },
  { value: 'text-purple-500', label: 'Фиолетовый', colorClass: 'bg-purple-500' },
  { value: 'text-pink-500', label: 'Розовый', colorClass: 'bg-pink-500' },
  { value: 'text-blue-500', label: 'Синий', colorClass: 'bg-blue-500' },
];

const ColorSelect: FC<Props> = ({
  onChange,
  value
}) => {
  const [selected, setSelected] = useState<ColorOption>(colorOptions.find(i => i.value === value) || colorOptions[0]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: ColorOption) => {
    setSelected(option);
    onChange(option.value);
    setIsOpen(false);
  };

  // Закрытие выпадающего меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-14" ref={dropdownRef}>
      <div
        className=" bg-gray-800 h-full items-center space-between flex text-white rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center w-full">
          <div className={`w-full h-4 rounded ${selected.colorClass} mr-2`}></div>
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
        <div className="absolute z-10 bottom-0 rounded  mt-1 w-full bg-gray-800 text-white border-gray-300 rounded shadow-lg">
          {colorOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center p-2 hover:bg-gray-900 cursor-pointer"
              onClick={() => handleSelect(option)}
            >
              <div className={`w-full h-4 rounded ${option.colorClass}`}></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorSelect;

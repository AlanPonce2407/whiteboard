'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TextBox {
  id: string;
  text: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const A4_WIDTH = 816;
const A4_HEIGHT = 1056;

const Whiteboard: React.FC = () => {
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [dragging, setDragging] = useState<boolean>(false);
  const [startPosition, setStartPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedTextBox, setSelectedTextBox] = useState<TextBox | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const editableRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.editable')) {
        Object.values(editableRefs.current).forEach((ref) => {
          if (ref) {
            ref.blur();
          }
        });
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    if (selectedTextBox && editableRefs.current[selectedTextBox.id]) {
      editableRefs.current[selectedTextBox.id]?.focus();
    }
  }, [selectedTextBox]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    setStartPosition({ x: e.clientX - canvasRect.left, y: e.clientY - canvasRect.top });
    setCurrentPosition({ x: e.clientX - canvasRect.left, y: e.clientY - canvasRect.top });
    setDragging(true);
    setSelectedTextBox(null); // Reset selectedTextBox on mouse down
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging) {
      const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      setCurrentPosition({ x: e.clientX - canvasRect.left, y: e.clientY - canvasRect.top });
    }
  };

  const handleMouseUp = () => {
    if (dragging) {
      setDragging(false);
      const width = Math.abs(currentPosition.x - startPosition.x);
      const height = Math.abs(currentPosition.y - startPosition.y);
      if (width > 10 && height > 10) {
        const newTextBox: TextBox = {
          id: String(Math.random()),
          text: '',
          position: {
            x: Math.min(startPosition.x, currentPosition.x),
            y: Math.min(startPosition.y, currentPosition.y),
          },
          size: { width, height },
        };
        setTextBoxes((prevTextBoxes) => {
          const updatedTextBoxes = [...prevTextBoxes, newTextBox];
          setSelectedTextBox(newTextBox); // Set the new text box as selected
          return updatedTextBoxes;
        });
      }
    }
  };

  const handleTextChange = (id: string, newText: string) => {
    setTextBoxes((prevTextBoxes) =>
      prevTextBoxes.map((textBox) => (textBox.id === id ? { ...textBox, text: newText } : textBox))
    );
  };

  const deleteTextBox = (id: string) => {
    setTextBoxes((prevTextBoxes) => prevTextBoxes.filter((textBox) => textBox.id !== id));
    setSelectedTextBox(null); // Reset selectedTextBox when deleting
  };

  const handleFocus = (id: string, ref: HTMLDivElement | null) => {
    editableRefs.current[id] = ref;
    if (ref) {
      const range = document.createRange();
      range.selectNodeContents(ref);
      range.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="relative overflow-hidden">
        <div
          className="flex items-center justify-center bg-white"
          style={{ width: A4_WIDTH, height: A4_HEIGHT }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={canvasRef}
        >
          {textBoxes.map((textBox) => (
            <div
              key={textBox.id}
              className="absolute"
              style={{
                left: textBox.position.x,
                top: textBox.position.y,
                width: textBox.size.width,
                height: textBox.size.height,
              }}
            >
              <div
                contentEditable
                suppressContentEditableWarning
                className="editable p-2 rounded cursor-text bg-white"
                style={{ width: '100%', height: '100%', outline: 'none', border: 'none', color: 'black', direction: 'ltr' }}
                onInput={(e) => handleTextChange(textBox.id, e.currentTarget.textContent || '')}
                onFocus={(e) => handleFocus(textBox.id, e.currentTarget)}
                ref={(ref) => handleFocus(textBox.id, ref)}
              >
                {textBox.text}
              </div>
            </div>
          ))}
          {dragging && (
            <div
              className="absolute"
              style={{
                left: Math.min(startPosition.x, currentPosition.x),
                top: Math.min(startPosition.y, currentPosition.y),
                width: Math.abs(currentPosition.x - startPosition.x),
                height: Math.abs(currentPosition.y - startPosition.y),
                border: '2px dashed #333',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
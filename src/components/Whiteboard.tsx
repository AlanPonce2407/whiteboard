'use client';

import React, { useState, useRef } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

interface TextBox {
  id: string;
  text: string;
  position: { x: number; y: number };
}

const A4_WIDTH = 816;
const A4_HEIGHT = 1056;

const Whiteboard: React.FC = () => {
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [newText, setNewText] = useState<string>('');
  const [selectedTextBox, setSelectedTextBox] = useState<TextBox | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const [isTextToolActive, setIsTextToolActive] = useState<boolean>(false);
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewText(e.target.value);
  };

  const addTextBox = () => {
    if (newText.trim()) {
      setTextBoxes([...textBoxes, { id: crypto.randomUUID(), text: newText, position: { x: 0, y: 0 } }]);
      setNewText('');
    }
  };

  const updatePosition = (index: number, position: { x: number; y: number }) => {
    const updatedTextBoxes = [...textBoxes];
    updatedTextBoxes[index].position = position;
    setTextBoxes(updatedTextBoxes);
  };

  const handleDrag = (e: DraggableEvent, data: DraggableData, index: number) => {
    updatePosition(index, { x: data.x, y: data.y });
  };

  const deleteTextBox = (id: string) => {
    setTextBoxes(textBoxes.filter((textBox) => textBox.id !== id));
    setSelectedTextBox(null);
    setEditingText('');
  };

  const handleTextBoxClick = (e: React.MouseEvent, textBox: TextBox) => {
    e.stopPropagation();
    setSelectedTextBox(textBox);
    setEditingText(textBox.text);
  };

  const handleTextEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingText(e.target.value);
  };

  const handleTextBoxBlur = () => {
    if (selectedTextBox) {
      const updatedTextBoxes = textBoxes.map((textBox) =>
        textBox.id === selectedTextBox.id ? { ...textBox, text: editingText } : textBox
      );
      setTextBoxes(updatedTextBoxes);
      setSelectedTextBox(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTextToolActive) {
      setStartX(e.clientX - canvasRect.left);
      setStartY(e.clientY - canvasRect.top);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTextToolActive && startX !== null && startY !== null) {
      setCurrentX(e.clientX - canvasRect.left);
      setCurrentY(e.clientY - canvasRect.top);
    }
  };

  const handleMouseUp = () => {
    if (isTextToolActive && startX !== null && startY !== null && currentX !== null && currentY !== null) {
      if (startX !== currentX || startY !== currentY) {
        const newTextBox: TextBox = {
          id: crypto.randomUUID(),
          text: '',
          position: { x: startX, y: startY },
        };

        setTextBoxes([...textBoxes, newTextBox]);
      }

      setStartX(null);
      setStartY(null);
      setCurrentX(null);
      setCurrentY(null);
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="mb-4">
        <input
          type="text"
          value={newText}
          onChange={handleTextChange}
          placeholder="Enter text"
          className="px-3 py-2 border border-gray-300 rounded mr-2 text-black"
        />
        <button onClick={addTextBox} className="px-4 py-2 bg-blue-500 text-white rounded">
          Add Text Box
        </button>
        <button
          onClick={() => setIsTextToolActive(!isTextToolActive)}
          className="px-4 py-2 bg-blue-500 text-white rounded ml-2"
        >
          {isTextToolActive ? 'Exit Text Tool' : 'Activate Text Tool'}
        </button>
        {selectedTextBox && (
          <div className="mt-2">
            <input
              type="text"
              value={editingText}
              onChange={handleTextEdit}
              onBlur={handleTextBoxBlur}
              placeholder="Edit text"
              className="px-3 py-2 border border-gray-300 rounded mr-2 text-black"
            />
          </div>
        )}
      </div>
      <div className="relative overflow-hidden">
        <div
          className="flex items-center justify-center bg-white"
          style={{ width: A4_WIDTH, height: A4_HEIGHT }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={canvasRef}
        >
          {textBoxes.map((textBox, index) => (
            <Draggable
              key={textBox.id}
              position={textBox.position}
              onDrag={(e, data) => handleDrag(e, data, index)}
              bounds="parent"
            >
              <div
                className="absolute bg-white p-2 rounded shadow-md cursor-move text-black whitespace-pre-wrap flex items-center"
                onClick={(e) => handleTextBoxClick(e, textBox)}
              >
                {textBox.text}
                <button
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={() => deleteTextBox(textBox.id)}
                >
                  &times;
                </button>
              </div>
            </Draggable>
          ))}
          {isTextToolActive && startX !== null && startY !== null && currentX !== null && currentY !== null && (
            <div
              className="absolute border-2 border-dotted border-gray-500"
              style={{
                left: Math.min(startX, currentX),
                top: Math.min(startY, currentY),
                width: Math.abs(currentX - startX),
                height: Math.abs(currentY - startY),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
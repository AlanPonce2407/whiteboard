'use client';
// Import the required libraries
import React, { useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

// Define the structure of a textbox
interface TextBox {
  id: string;
  text: string;
  position: { x: number; y: number };
}

// Define the Whiteboard component
const Whiteboard: React.FC = () => { // hooks to manage the state of the textboxes
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]); // array of textboxes
  const [newText, setNewText] = useState<string>(''); // new text to be added
  const [selectedTextBox, setSelectedTextBox] = useState<TextBox | null>(null); // selected textbox
  const [editingText, setEditingText] = useState<string>(''); // text being edited

  // function to handle the change in text
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewText(e.target.value);
  };

  // function to add a new textbox
  const addTextBox = () => {
    if (newText.trim()) { // check if the new text is not empty
      setTextBoxes([...textBoxes, { id: crypto.randomUUID(), text: newText, position: { x: 0, y: 0 } }]); // add the new textbox
      setNewText('');
    }
  };

  // function to update the position of a textbox
  const updatePosition = (index: number, position: { x: number; y: number }) => { // copy the array of textboxes
    const updatedTextBoxes = [...textBoxes]; // update the position of the textbox
    updatedTextBoxes[index].position = position; // set the updated textboxes
    setTextBoxes(updatedTextBoxes); // set the selected textbox to null
  };

  // function to handle the drag event
  const handleDrag = (e: DraggableEvent, data: DraggableData, index: number) => { // update the position of the textbox
    updatePosition(index, { x: data.x, y: data.y }); // prevent the default behavior
  };

  // function to delete a textbox
  const deleteTextBox = (id: string) => { // filter out the textbox with the given id
    setTextBoxes(textBoxes.filter((textBox) => textBox.id !== id)); // set the selected textbox to null
    setSelectedTextBox(null); // reset the editing text
    setEditingText(''); // prevent the default behavior
  };

  // function to handle the click event on a textbox
  const handleTextBoxClick = (e: React.MouseEvent, textBox: TextBox) => { // prevent the default behavior
    e.stopPropagation(); // set the selected textbox
    setSelectedTextBox(textBox); // set the editing text
    setEditingText(textBox.text); // prevent the default behavior
  };

  // function to handle the change in the text being edited
  const handleTextEdit = (e: React.ChangeEvent<HTMLInputElement>) => { // update the editing text
    setEditingText(e.target.value); // prevent the default behavior
  };

  // function to handle the blur event on a textbox
  const handleTextBoxBlur = () => { // check if a textbox is selected
    if (selectedTextBox) { // find the index of the selected textbox
      const updatedTextBoxes = textBoxes.map((textBox) => // update the text of the selected textbox
        textBox.id === selectedTextBox.id ? { ...textBox, text: editingText } : textBox 
      ); // update the textboxes
      setTextBoxes(updatedTextBoxes); // set the selected textbox to null
      setSelectedTextBox(null); // reset the editing text
    }
  };

  // render the Whiteboard component
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
      <div className="flex items-center justify-center w-full h-full relative">
        {textBoxes.map((textBox, index) => (
          <Draggable
            key={textBox.id}
            position={textBox.position}
            onDrag={(e, data) => handleDrag(e, data, index)}
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
      </div>
    </div>
  );
};

export default Whiteboard;
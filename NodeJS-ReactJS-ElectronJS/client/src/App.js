import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { MdAdd } from 'react-icons/md';
import { Flex, Icon, Button } from '@chakra-ui/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom container component
const Container = ({ children }) => (
  <div>
    <h1 style={{ textAlign: 'center' }}>Σύστημα διαχείρισης τραπεζιών</h1>
    <div style={containerStyles}>{children}</div>
  </div>
);

// ... (import statements)

// ... (imports)

function App() {
  const [message, setMessage] = useState('');
  const [tableCount, setTableCount] = useState(() => {
    const storedCount = localStorage.getItem('tableCount');
    return storedCount ? parseInt(storedCount, 10) : 1;
  });

  const [selectedTables, setSelectedTables] = useState(new Set());

  const notify = (buttonNumber) => {
    toast.success(<span>Το τραπέζι: <strong>({buttonNumber})</strong> σας ζήτησε.</span>, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
    const audio = new Audio('/notification.mp3');
    audio.play().catch(error => console.error("Failed to play sound:", error));
  };

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:5000/sse');

    eventSource.onmessage = (event) => {
      const receivedMessage = event.data;
      setMessage(receivedMessage);

      // Extract the button number from the message and trigger the notification
      const buttonNumber = parseInt(receivedMessage, 10);
      if (!isNaN(buttonNumber)) {
        notify(buttonNumber);
        setSelectedTables((prevSelected) => new Set([...prevSelected, buttonNumber]));
      }
    };

    // Cleanup function
    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('tableCount', tableCount.toString());
  }, [tableCount]);

  const handleButtonClick = (index) => {
    setMessage('');
    setSelectedTables((prevSelected) => {
      const updatedSet = new Set(prevSelected);
      updatedSet.delete(index + 1); // Remove the table from the set
      return updatedSet;
    });
  };

  const createTable = () => {
    setTableCount((prevCount) => prevCount + 1);
  };

  const removeTable = (index) => {
    setTableCount((prevCount) => Math.max(0, prevCount - 1));
    setSelectedTables((prevSelected) => {
      const updatedSet = new Set(prevSelected);
      updatedSet.delete(index + 1); // Remove the table from the set
      return updatedSet;
    });
  };

  const addButtonStyles = {
    backgroundColor: '#3498db',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '4px 10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    margin: '5px', // Added margin for spacing
  };


  const tableButtons = Array.from({ length: tableCount }, (_, index) => {
    const isButtonReceived = selectedTables.has(index + 1);

    return (
      <Button
        key={index + 1}
        style={{
          backgroundColor: isButtonReceived ? '#27ae60' : '#3498db',
          color: '#ffffff',
          border: 'none',
          borderRadius: '10px',
          padding: '20px 10px',
          transition: 'background-color 0.3s',
          margin: '5px',
          cursor: isButtonReceived ? 'pointer' : null
        }}
        onClick={() => handleButtonClick(index)}
      >
        Τραπέζι {index + 1}
      </Button>
    );
  });

  return (
    <Container>
      <Flex>
        <Button style={addButtonStyles} onClick={createTable}>
          <Icon w='32px' h='32px' as={MdAdd} color={'white'} />
          Πρόσθεσε
        </Button>
        <Button style={addButtonStyles} onClick={removeTable}>
          <Icon w='32px' h='32px' as={FontAwesomeIcon} icon={faMinus} />
          Αφαίρεσε
        </Button>
      </Flex>
      {tableButtons}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Container>
  );
}

const containerStyles = {
  alignItems: 'center',
  position: 'relative',
  margin: '0 30%', // 10% margin from left and right
  height: '80vh',
  position: 0,
  border: '4px solid gray',
  borderRadius:'10px'
};

export default App;

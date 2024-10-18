import React, { useEffect, useState } from 'react'; 
import './App.css';
import { CiTrash } from "react-icons/ci";
import { CiSquareCheck } from "react-icons/ci";
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

function App() {
  const [isComplete, setComplete] = useState(false);
  const [allTodos, setTodos] = useState([]);
  const [newTitle, setTitle] = useState("");
  const [newDes, setDes] = useState("");
  const [completedTodos, setCompleted] = useState([]);

  useEffect(() => {
    const mock = new MockAdapter(axios);

    mock.onGet('/todos').reply(200, [
      { title: 'Buy groceries', des: 'Buy milk, eggs, and bread', completed: false },
      { title: 'Clean the house', des: 'Vacuum the living room', completed: false },
      { title: 'Go to Gym', des: 'It leg day', completed: false }
    ]);

    mock.onPost('/todos').reply(config => {
      const newTodo = JSON.parse(config.data);
      return [200, newTodo];
    });

    mock.onDelete(/\/todos\/\d+/).reply(200);

    mock.onGet('/completed').reply(200, []);

    axios.get('/todos')
      .then(response => {
        setTodos(response.data);
      })
      .catch(error => {
        console.error('Error fetching the todos:', error);
      });

    return () => mock.restore();
  }, []);

  const handleAdd = () => {
    let newItem = {
      title: newTitle,
      des: newDes,
      completed: false,
    };

    axios.post('/todos', newItem)
      .then(response => {
        setTodos([...allTodos, response.data]);
      })
      .catch(error => {
        console.error('Error adding the todo:', error);
      });
  };

  const handleDelete = (index) => {
    let deletedItem = allTodos[index];
    let reduced = [...allTodos];
    reduced.splice(index, 1);

    axios.delete(`/todos/${index}`)
      .then(() => {
        setTodos(reduced);
      })
      .catch(error => {
        console.error('Error deleting the todo:', error);
      });
  };

  const handleComplete = (index) => {
    let now = new Date();
    let completeOn = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()} at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    let completedItem = {
      ...allTodos[index],
      completeOn: completeOn,
      completed: true
    };

    setCompleted([...completedTodos, completedItem]);
    handleDelete(index);
  };

  const handleDeleteComplete = (index) => {
    let reduced = [...completedTodos];
    reduced.splice(index, 1);
    setCompleted(reduced);
  };

  useEffect(() => {
    // Fetch completed todos
    axios.get('/completed')
      .then(response => {
        setCompleted(response.data);
      })
      .catch(error => {
        console.error('Error fetching completed todos:', error);
      });
  }, []);

  return (
    <div className='App'>
      <h1>To Do</h1>

      <div className='wrap'>
        <div className='input'>
          <div className='item'>
            <label>Title</label>
            <input type="text" value={newTitle} onChange={(e) => setTitle(e.target.value)} placeholder="What's the task title?" />
          </div>
          <div className='item'>
            <label>Description</label>
            <input type="text" value={newDes} onChange={(e) => setDes(e.target.value)} placeholder="What's the task description?" />
          </div>
          <div className='item'>
            <button type='button' onClick={handleAdd} className='addBtn'>Add</button>
          </div>
        </div>

        <div className='btn'>
          <button className={`tdBtn ${!isComplete && 'active'}`} onClick={() => setComplete(false)}>To Do</button>
          <button className={`tdBtn ${isComplete && 'active'}`} onClick={() => setComplete(true)}>Completed</button>
        </div>

        <div className='list'>
          {!isComplete && allTodos.map((item, index) => (
            <div className='list-item' key={index}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.des}</p>
              </div>
              <div>
                <CiTrash className='icon' onClick={() => handleDelete(index)} title='Are You Sure?' />
                <CiSquareCheck className='check' onClick={() => handleComplete(index)} title='Are You Sure?' />
              </div>
            </div>
          ))}

          {isComplete && completedTodos.map((item, index) => (
            <div className='list-item' key={index}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.des}</p>
                <p><small>Completed on: {item.completeOn}</small></p>
              </div>
              <div>
                <CiTrash className='icon' onClick={() => handleDeleteComplete(index)} title='Are You Sure?' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

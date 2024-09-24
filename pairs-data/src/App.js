import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [pairs, setPairs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/pairs')
      .then(response => {
        const pairsData = Object.values(response.data);
        setPairs(pairsData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className="App">
      <h1>Pairs Data</h1>
      <table>
        <thead>
          <tr>
            <th>Pair Address</th>
            <th>Token0 Address</th>
            <th>Token0 Name</th>
            <th>Token0 Symbol</th>
            <th>Token1 Address</th>
            <th>Token1 Name</th>
            <th>Token1 Symbol</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair, index) => (
            <tr key={index}>
              <td>{pair.pairAddress}</td>
              <td>{pair.token0.address}</td>
              <td>{pair.token0.name}</td>
              <td>{pair.token0.symbol}</td>
              <td>{pair.token1.address}</td>
              <td>{pair.token1.name}</td>
              <td>{pair.token1.symbol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
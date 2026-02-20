import './App.css';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getDataSet } from './redux/DataSetSlice';

import ScatterplotContainer from './components/scatterplot/ScatterplotContainer';
import HierarchyContainer from './components/hierarchy/HierarchyContainer';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getDataSet());
  }, [dispatch]);

  return (
    <div className="App">
      <header>
        <h1>Find your city / state !</h1>
      </header>
      
      <div className="main-content">
        <div className="chart-container">
          <h3 className="chart-title">Scatterplot</h3>
          <div className="chart-wrapper">
            <ScatterplotContainer 
              xAttributeName={"medIncome"} 
              yAttributeName={"ViolentCrimesPerPop"} 
            />
          </div>
        </div>

        <div className="chart-container hierarchy-box">
          <h3 className="chart-title">Hierarchy: Treemap (click on state title to zoom in)</h3>
          <div className="chart-wrapper"> 
            <HierarchyContainer 
              sizeAttribute={"population"} 
              colorAttribute={"ViolentCrimesPerPop"} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
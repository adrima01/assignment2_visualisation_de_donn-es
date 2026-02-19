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
    <div className="App" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header>
        <h1>City Finder: Criminality vs. Income</h1>
      </header>
      
      <div className="main-content" style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        height: '80vh',
        padding: '20px', 
        gap: '20px',
        alignItems: 'stretch' 
      }}>
        
        <div style={{ 
          flex: '1',
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '10px',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Scatterplot</h3>
          <div style={{ flex: 1, minHeight: 0 }}> {}
            <ScatterplotContainer 
              xAttributeName={"medIncome"} 
              yAttributeName={"ViolentCrimesPerPop"} 
            />
          </div>
        </div>


        <div style={{ 
          flex: '1',
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '10px',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Hierarchy: State & Community</h3>
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}> 
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
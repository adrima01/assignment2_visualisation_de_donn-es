import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import HierarchyD3 from './Hierarchy-d3';
import { setSelectedItems } from '../../redux/ItemInteractionSlice';

function HierarchyContainer({ sizeAttribute = "population", colorAttribute = "ViolentCrimesPerPop" }) {
    const visData = useSelector(state => state.dataSet);
    const selectedItems = useSelector(state => state.itemInteraction.selectedItems);
    const dispatch = useDispatch();
    const divRef = useRef(null);
    const d3Ref = useRef(null);

    useEffect(() => {
        if (!divRef.current) return;
        const d3Instance = new HierarchyD3(divRef.current);
        const width = divRef.current.clientWidth;
        const height = divRef.current.clientHeight;
        d3Instance.create({ size: { width, height } });
        d3Ref.current = d3Instance;
        
        return () => d3Instance.clear();
    }, []);

    useEffect(() => {
        if (d3Ref.current && visData.length > 0) {
            const controllerMethods = {
                handleOnClick: (item) => dispatch(setSelectedItems([item]))
            };
            d3Ref.current.renderHierarchy(visData, sizeAttribute, colorAttribute, controllerMethods);
        }
    }, [visData, sizeAttribute, colorAttribute, dispatch]);

    useEffect(() => {
        if (d3Ref.current && d3Ref.current.chartArea) {
            d3Ref.current.highlightSelectedItems(selectedItems);
        }
    }, [selectedItems]);

    //bouton pour le reset du zoom
    const handleResetZoom = () => {
        if (d3Ref.current && d3Ref.current.resetZoom) {
            d3Ref.current.resetZoom();
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <button 
                onClick={handleResetZoom}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 10,
                    padding: '5px 12px',
                    backgroundColor: '#444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
            >
                Reset Zoom
            </button>

            <div 
                ref={divRef} 
                style={{ 
                    width: '100%', 
                    height: '100%', 
                    background: '#fff', 
                    overflow: 'hidden'
                }}
            ></div>
        </div>
    );
}

export default HierarchyContainer;
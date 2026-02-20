import * as d3 from 'd3'
// import { getDefaultFontSize } from '../../utils/helper';

class ScatterplotD3 {
    margin = {top: 100, right: 10, bottom: 50, left: 100};
    size;
    height;
    width;
    svg;
    // add specific class properties used for the vis render/updates
    defaultOpacity=0.3;
    transitionDuration=1000;
    circleRadius = 3;
    xScale;
    yScale;


    constructor(el){
        this.el=el;
    };

    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};

        // get the effect size of the view by subtracting the margin
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        // initialize the svg and keep it in a class property to reuse it in renderScatterplot()
        this.svg=d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class","svgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        ;

        this.xScale = d3.scaleLinear().range([0,this.width]);
        this.yScale = d3.scaleLinear().range([this.height,0]);

        // build xAxisG
        this.svg.append("g")
            .attr("class","xAxisG")
            .attr("transform","translate(0,"+this.height+")")
        ;
        this.svg.append("g")
            .attr("class","yAxisG")
        ;
        this.svg.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", this.width / 2)
        .attr("y", this.height + this.margin.bottom - 10)
        .style("font-size", "12px")
        .text("X Axis");

        this.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height / 2)
            .attr("y", -this.margin.left + 40)
            .style("font-size", "12px")
            .text("Y Axis");
    }

    changeBorderAndOpacity(selection, selected){
        selection.style("opacity", selected?1:this.defaultOpacity)
        ;

        selection.select(".markerCircle")
            .attr("stroke-width",selected?2:0)
        ;
    }

    updateMarkers(selection,xAttribute,yAttribute){
        // transform selection
        selection
            .transition().duration(this.transitionDuration)
            .attr("transform", (item)=>{
                // use scales to return shape position from data values
                return "translate("+this.xScale(item[xAttribute])+","+this.yScale(item[yAttribute])+")";
            })
        ;
        this.changeBorderAndOpacity(selection, false)
    }

    highlightSelectedItems(selectedItems){
        this.svg.selectAll(".markerG")
            // all elements with the class .cellG (empty the first time)
            .data(selectedItems,(itemData)=>itemData.index)
            .join(
                enter => {},
                update => {
                    this.changeBorderAndOpacity(update, true);
                },
                exit => {
                    this.changeBorderAndOpacity(exit, false);
                },
            );
        // use pattern update to change the border and opacity of objects:
        //      - call this.changeBorderAndOpacity(selection,true) for objects in selectedItems
        //      - this.changeBorderAndOpacity(selection,false) for objects not in selectedItems
    }

    updateAxis = function(visData,xAttribute,yAttribute){
        // compute min max using d3.min/max(visData.map(item=>item.attribute))
        const minX = d3.min(visData.map(item=>item[xAttribute]))
        const maxX = d3.max(visData.map(item=>item[xAttribute]))
        const minY = d3.min(visData.map(item=>item[yAttribute]))
        const maxY = d3.max(visData.map(item=>item[yAttribute]))
        this.xScale.domain([minX,maxX]);
        this.yScale.domain([minY,maxY]);

        // create axis with computed scales
        // .xAxisG and .yAxisG are initialized in create() function
        this.svg.select(".xAxisG")
            .transition().duration(500)
            .call(d3.axisBottom(this.xScale))
        ;
        this.svg.select(".yAxisG")
            .transition().duration(500)
            .call(d3.axisLeft(this.yScale))
        ;
        this.svg.select(".x-axis-label")
            .text(xAttribute);

        this.svg.select(".y-axis-label")
            .text(yAttribute);
    }


    renderScatterplot = function (visData, xAttribute, yAttribute, controllerMethods){        
        console.log("render scatterplot with a new data list ...")

        // build the size scales and x,y axis
        this.updateAxis(visData,xAttribute,yAttribute);

        this.svg.selectAll(".markerG")
            // all elements with the class .cellG (empty the first time)
            .data(visData,(itemData)=>itemData.index)
            .join(
                enter=>{
                    // all data items to add:
                    // doesn’exist in the select but exist in the new array
                    const itemG=enter.append("g")
                        .attr("class","markerG")
                        .style("opacity",this.defaultOpacity)
                        .on("click", (event,itemData)=>{
                            controllerMethods.handleOnClick(itemData);
                        })
                    ;
                    // render element as child of each element "g"
                    itemG.append("circle")
                        .attr("class","markerCircle")
                        .attr("r",this.circleRadius)
                        .attr("stroke","red")
                    ;
                    this.updateMarkers(itemG,xAttribute,yAttribute);
                },
                update=>{
                    this.updateMarkers(update,xAttribute,yAttribute)
                },
                exit =>{
                    exit.remove()
                    ;
                }

            )
    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }

    // brushing
    renderBrush = function(visData, xAttribute, yAttribute, dispatch, setSelectedItems) {
        this.svg.select(".brush").remove();

        const brush = d3.brush()
            .extent([[0, 0], [this.width, this.height]])
            .on("start brush end", (event) => {
                const { selection } = event;
                let selectedData = [];

                if (selection) {
                    const [[x0, y0], [x1, y1]] = selection;

                    selectedData = visData.filter(d => {
                        const posX = this.xScale(d[xAttribute]);
                        const posY = this.yScale(d[yAttribute]);
                        return x0 <= posX && posX <= x1 && y0 <= posY && posY <= y1;
                    });
                }
                dispatch(setSelectedItems(selectedData));
            });

        this.svg.append("g")
            .attr("class", "brush")
            .call(brush);
    }
}
export default ScatterplotD3;
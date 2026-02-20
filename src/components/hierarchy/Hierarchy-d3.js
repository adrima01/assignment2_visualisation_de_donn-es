import * as d3 from 'd3';

class HierarchyD3 {
    margin = { top: 30, right: 0, bottom: 0, left: 0 };

    constructor(el) { 
        this.el = el;
        this.isReady = false;
        this.tooltip = d3.select("body").selectAll(".d3-tooltip").data([null]).join("div")
            .attr("class", "d3-tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "rgba(0,0,0,0.9)")
            .style("color", "white")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("z-index", "2000");
    }

    create = function (config) {
        this.width = config.size.width;
        this.height = config.size.height || 600;

        this.svg = d3.select(this.el).selectAll("svg").data([null]).join("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("font", "10px sans-serif")
            .on("mouseleave", () => {
                if (this.tooltip) this.tooltip.style("opacity", 0);
            });
        
        this.chartArea = this.svg.selectAll("g.chart-area").data([null]).join("g")
            .attr("class", "chart-area")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
        
        this.isReady = true;
    };

    renderHierarchy(visData, sizeAttribute, colorAttribute, controllerMethods) {
        if (!visData || visData.length === 0) return;

        const flatData = [{ id: "root", parentId: null, name: "USA" }];
        const uniqueStates = [...new Set(visData.map(d => d.state))].filter(s => s !== undefined);
        uniqueStates.forEach(s => flatData.push({ id: `state-${s}`, parentId: "root", name: `State ${s}` }));
        
        visData.forEach(d => {
            flatData.push({ 
                ...d, 
                id: `node-${d.index}`, 
                parentId: `state-${d.state}`, 
                name: d.communityname 
            });
        });

        const root = d3.stratify()
            .id(d => d.id)
            .parentId(d => d.parentId)
            (flatData)
            .sum(d => Math.max(0, +d[sizeAttribute] || 0))
            .sort((a, b) => b.value - a.value);

        this.xScale = d3.scaleLinear().rangeRound([0, this.width]);
        this.yScale = d3.scaleLinear().rangeRound([0, this.height - this.margin.top]);

        const treemap = d3.treemap()
            .size([this.width, this.height - this.margin.top])
            .paddingInner(1)
            .paddingOuter(2)
            .paddingTop(15);

        treemap(root);

        const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
            .domain([0, d3.max(visData, d => +d[colorAttribute])]);

        this.cell = this.chartArea.selectAll("g.cell")
            .data(root.descendants(), d => d.id)
            .join("g")
            .attr("class", "cell");

        this.rect = this.cell.selectAll("rect")
            .data(d => [d])
            .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => {
                if (d.depth === 0) return "#444";
                if (d.depth === 1) return "#ccc";
                return colorScale(+d.data[colorAttribute]);
            })
            .attr("stroke", "#fff")
            .style("cursor", "pointer");

        this.labels = this.cell.selectAll("text")
            .data(d => [d])
            .join("text")
            .attr("x", d => d.x0 + 5)
            .attr("y", d => d.y0 + 12)
            .attr("fill", d => d.depth === 0 ? "white" : "black")
            .style("pointer-events", "none")
            .text(d => (d.depth < 2) ? d.data.name : "");

        this.clicked = (event, d) => {
            if (d.depth === 2 && event) {
                controllerMethods.handleOnClick(d.data);
                return;
            }

            const focus = d;
            const t = this.cell.transition().duration(750);

            this.xScale.domain([focus.x0, focus.x1]);
            this.yScale.domain([focus.y0, focus.y1]);

            this.rect.transition(t)
                .attr("x", d => this.xScale(d.x0))
                .attr("y", d => this.yScale(d.y0))
                .attr("width", d => this.xScale(d.x1) - this.xScale(d.x0))
                .attr("height", d => this.yScale(d.y1) - this.yScale(d.y0));

            this.labels.transition(t)
                .attr("x", d => this.xScale(d.x0) + 5)
                .attr("y", d => this.yScale(d.y0) + 12)
                .text(d => {
                    const w = this.xScale(d.x1) - this.xScale(d.x0);
                    if (focus.depth === 0 && d.depth === 2) return "";
                    if (focus.depth === 1 && d.depth === 2 && w > 45) return d.data.name;
                    if (d.depth < 2) return d.data.name;
                    return "";
                })
                .attr("opacity", d => (focus.depth === 1 && d.depth === 1 && d.id !== focus.id) ? 0 : 1);
        };

        this.rect.on("click", (event, d) => this.clicked(event, d));

        // tooltips
        this.rect.on("mouseover", (event, d) => {
            if (d.depth < 2) return;
            this.tooltip.transition().duration(100).style("opacity", 1);
            this.tooltip.html(`<strong>${d.data.name}</strong><br/>Pop: ${d.value}<br/>Crime: ${(+d.data[colorAttribute]).toFixed(3)}`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", (event) => {
            this.tooltip.style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 28) + "px");
        })
        .on("mouseleave", () => this.tooltip.style("opacity", 0));

        this.rootNode = root; 
    }

    highlightSelectedItems(selectedItems) {
        if (!this.chartArea) return;

        const selectedIndices = new Set(selectedItems.map(d => d.index));
        const hasSelection = selectedIndices.size > 0;

        this.chartArea.selectAll("g.cell")
            .filter(d => d.depth === 2)
            .selectAll("rect")
            .data(d => [d]) 
            .join(
                enter => enter,
                update => {
                    update.transition().duration(250)
                        .style("opacity", d => {
                            return (!hasSelection || selectedIndices.has(d.data.index)) ? 1 : 0.2;
                        })
                        .attr("stroke", d => {
                            return selectedIndices.has(d.data.index) ? "#000" : "#fff";
                        })
                        .attr("stroke-width", d => {
                            return selectedIndices.has(d.data.index) ? "2px" : "1px";
                        });
                },
                exit => exit
            );
    }

    resetZoom() {
        if (!this.rootNode || !this.clicked) return;
        this.clicked(null, this.rootNode); 
    }   

    clear = () => d3.select(this.el).selectAll("*").remove();
}

export default HierarchyD3;
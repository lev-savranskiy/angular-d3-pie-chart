import {Component, ElementRef, EventEmitter, Input, Output, OnInit, SimpleChanges, ViewChild, AfterViewInit} from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'app-d3-pie-chart',
    templateUrl: './d3-pie-chart.component.html',
    styleUrls: ['./d3-pie-chart.component.scss']
})


export class D3PieChartComponent {

    private host: d3.Selection;
    private svg: d3.Selection;
    private width: number;
    private height: number;
    private radius: number;
    private htmlElement: HTMLElement;
    private pieColor = d3.scaleOrdinal(d3.schemeCategory10);

    @Input() data: any;
    @Input() options: any;
    @Input() max: number;
    @Output() sendDataToParent = new EventEmitter<object>();


    constructor(private eltRef: ElementRef) {
    }

    ngOnInit() {
        const defaultOptions = {
            width: 960,
            height: 450
        };
        this.options = {...defaultOptions, ...this.options};
        this.htmlElement = this.eltRef.nativeElement;
        this.host = d3.select(this.eltRef.nativeElement).select('.container');
    }

    ngOnChanges(changes: SimpleChanges) {

        if (!this.data || !this.data[0]) {
            return;
        }


        this.host.html('');
        this.width = this.options.width;
        this.height = this.options.height;
        this.radius = Math.min(this.width, this.height) / 2;
        this.draw();

    }

    hasObserver() {
        return this.sendDataToParent.observers && this.sendDataToParent.observers.length;
    }

    private draw(): void {


        this.svg = this.host.append('svg')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .append('g')
            .attr('transform', `translate(${this.width / 2},${this.height / 2})`);

        const pieGenerator = d3.pie()
            .value((d) => d.value)
            .sort((a, b) => a.key.localeCompare(b.key));

        const arcSelection = this.svg.selectAll('.arc')
            .data(pieGenerator(this.data))
            .enter()
            .append('g')
            .attr('class', 'arc');

        this.populatePie(arcSelection);
    }

    private populatePie(arcSelection: d3.Selection<d3.pie.Arc>): void {
        const innerRadius = this.options.mode === 'donut' ? this.radius / 4 : 0;
        const outerRadius = this.radius - 10;
        const arc = d3.arc<d3.pie.Arc>()
            .outerRadius(outerRadius)
            .innerRadius(innerRadius);
        const sendDataToParent = this.sendDataToParent;

        arcSelection.append('path')
            .attr('d', arc)
            .attr('fill', (datum, index) => {
                return this.pieColor(this.data[index].key);
            })
            .attr('keyval', (datum, index) => {
                return this.data[index].key;
            })
            .style('cursor', this.hasObserver() ? 'pointer' : 'default')
            .on('click', function (d) {
                const keyval = d3.select(this).attr('keyval');
                const data = {};
                data['key'] = keyval;
                data['value'] = d.value;
                sendDataToParent.emit(data);
            });

        arcSelection.append('text')
            .attr('transform', (datum: any) => {
                datum.innerRadius = 0;
                datum.outerRadius = outerRadius;
                return `translate(${arc.centroid(datum)})`;
            })
            .text((datum, index) => `${this.data[index].key}: ${this.data[index].value}`)
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('font-size', '14')
            .style('cursor', this.hasObserver() ? 'pointer' : 'default')
            .attr('keyval', (datum, index) => {
                return this.data[index].key;
            })
            .on('click', function (d) {
                const keyval = d3.select(this).attr('keyval');
                const data = {};
                data['key'] = keyval;
                data['value'] = d.value;
                sendDataToParent.emit(data);
            });


        arcSelection
            .append('title')
            .attr('keyval', (datum, index) => {
                return this.data[index].key;
            })
            .text(function (d) {
                const keyval = d3.select(this).attr('keyval');
                return `${keyval}: ${d.value}`;
            });

    }
}

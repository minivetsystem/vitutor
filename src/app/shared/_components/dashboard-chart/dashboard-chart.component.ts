import { Component, Input, OnInit } from '@angular/core';
declare var Chart: any;

@Component({
  selector: 'app-dashboard-chart',
  templateUrl: './dashboard-chart.component.html',
  styleUrls: ['./dashboard-chart.component.scss']
})
export class DashboardChartComponent implements OnInit {
  @Input() dataSet;
  totalIncomeChartData
  constructor() { }

  ngOnInit() {
    
    this.tutorGraph(this.dataSet);
  }

  tutorGraph(dataset){
    //   let bar_ctx = this.totalIncomeChart.nativeElement.getContext('2d');
    
    // let blue_gradiant = bar_ctx.createLinearGradient(0, 0, 0, 600);
    // blue_gradiant.addColorStop(0, '#40DBF3');
    // blue_gradiant.addColorStop(1, '#1C7EE1');
    
    this.totalIncomeChartData = new Chart('totalIncomeChart', {
      type: 'bar',
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Aug", "Sep", "Oct", "Nov" , "Dec"],
        datasets: [{
          label: 'Job Accepted',
          data: dataset || [18, 22, 24, 14, 16, 18, 9, 15, 11, 7, 16, 13],
                backgroundColor: '#40DBF3',
                hoverBackgroundColor: '#1C7EE1',
                hoverBorderWidth: 0,
                hoverBorderColor: ''
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        scales: {
          yAxes: [{
            ticks: {
              display: true //this will remove only the label
            },
            gridLines : {
              drawBorder: true,
              display : true
            }
          }],
          xAxes : [ {
            gridLines : {
              drawBorder: false,
              display : false
            }
          }]
        },
      }
    });
    }

}

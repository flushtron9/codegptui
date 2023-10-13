import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ImageUploadService } from './image-upload.service';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent {
  selectedFiles?: FileList;
  selectedFileNames: string[] = [];
  responseData:any;
  chartData:any;

  progressInfos: any[] = [];
  message: string[] = [];

  previews: string[] = [];
  imageInfos?: Observable<any>;

  constructor(private uploadService: ImageUploadService) {}
calculateDate(milliSeconds1:string) {
    let milliSeconds = new Date().getTime();
    let date = new Date(milliSeconds1);
    let time = date.toLocaleTimeString();
    let dateNew= date.toLocaleDateString();
    console.log('time', time, dateNew);
    return time;
  };
  createChart(){ 
    let labelsList :any[]=[];
   this.chartData?.chart?.result[0].timestamp.forEach((data:any)=>{
    labelsList.push(this.calculateDate(data));
    });
        this.chart = new Chart("MyChart", {
      type: 'line', //this denotes tha type of chart
      data: {// values on X-Axis
        labels: labelsList, 
	       datasets: [
   
          {
            label:  this.chartData?.chart?.result[0].meta?.symbol,
            data: this.chartData?.chart?.result[0].indicators['quote'][0].open,
            backgroundColor: 'limegreen'
          }  
        ]
      },
      options: {
        aspectRatio:2.5
      }
      
    });
  }
  selectFiles(event: any): void {
    this.message = [];
    this.progressInfos = [];
    this.selectedFileNames = [];
    this.selectedFiles = event.target.files;

    this.previews = [];
    if (this.selectedFiles && this.selectedFiles[0]) {
      const numberOfFiles = this.selectedFiles.length;
      for (let i = 0; i < numberOfFiles; i++) {
        const reader = new FileReader();

        reader.onload = (e: any) => {
          console.log(e.target.result);
          this.previews.push(e.target.result);
          this.uploadFiles();
        };

        reader.readAsDataURL(this.selectedFiles[i]);

        this.selectedFileNames.push(this.selectedFiles[i].name);
      }
    }
  }

  uploadFiles(): void {
    this.message = [];

    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.upload(i, this.selectedFiles[i]);
      }
    }
  }

  upload(idx: number, file: File): void {
    this.progressInfos[idx] = { value: 0, fileName: file.name };

    if (file) {
      this.uploadService.upload(file).subscribe(
        (event: any) => {
          console.log(JSON.parse(event.data));
                this.createChart();
          this.responseData = JSON.parse(event.data);
          this.chartData = JSON.parse(event.chartInfo);
          console.log(this.chartData);
          this.chart.destroy();

          this.createChart();
          this.responseData = JSON.parse(event.data);
          if (event.type === HttpEventType.UploadProgress) {
            this.progressInfos[idx].value = Math.round(
              (100 * event.loaded) / event.total
            );
          } else if (event instanceof HttpResponse) {
            const msg = 'Uploaded the file successfully: ' + file.name;
            this.message.push(msg);
            this.imageInfos = this.uploadService.getFiles();
          }
        },
        (err: any) => {
          this.progressInfos[idx].value = 0;
          const msg = 'Could not upload the file: ' + file.name;
          this.message.push(msg);
        }
      );
    }
  }

  ngOnInit(): void {
    this.imageInfos = this.uploadService.getFiles();
  }
}

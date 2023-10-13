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
  responseData: any;

  progressInfos: any[] = [];
  message: string[] = [];

  previews: string[] = [];
  imageInfos?: Observable<any>;

  listInfo = [
    { displayValue: 'Company Name', selector: 'shortName' },
    { displayValue: 'Current Price', selector: 'ask' },
    { displayValue: 'Open Price', selector: 'regularMarketOpen' },
    { displayValue: 'Todays Highest', selector: 'regularMarketDayHigh' },
    { displayValue: 'Todays Low', selector: 'regularMarketDayLow' },
    { displayValue: 'Dividend Yield', selector: 'dividendYield' },
    { displayValue: 'Price Range for 52 Weeks', selector: 'fiftyTwoWeekRange' },
    { displayValue: '52 Weeks High', selector: 'fiftyTwoWeekHigh' },
    { displayValue: '52 Weeks Low', selector: 'fiftyTwoWeekLow' },
  ];

  constructor(private uploadService: ImageUploadService) {}

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

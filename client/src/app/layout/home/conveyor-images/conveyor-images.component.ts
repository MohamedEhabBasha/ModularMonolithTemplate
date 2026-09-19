import { Component } from '@angular/core';
import { MarqueeComponent } from "./marquee/marquee.component";

@Component({
  selector: 'app-conveyor-images',
  imports: [MarqueeComponent],
  templateUrl: './conveyor-images.component.html',
  styleUrl: './conveyor-images.component.css',
})
export class ConveyorImagesComponent {}

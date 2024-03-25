import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  showSidebar = false;
  showSidebar1 = false;

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }
  toggleSidebar1() {
    this.showSidebar1 = !this.showSidebar1;
  }
}

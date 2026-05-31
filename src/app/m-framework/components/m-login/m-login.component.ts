import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'm-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './m-login.component.html',
  styleUrl: './m-login.component.css'
})
export class MLoginComponent {
  rightPanelActive: boolean = false;

  loginEmail: string = '';
  loginPassword: string = '';
  loginError: string = '';

  signupName: string = '';
  signupEmail: string = '';
  signupPassword: string = '';
  signupError: string = '';
  signupSuccess: string = '';

  @Output() loginSuccess = new EventEmitter<{ name: string; email: string }>();

  activateRightPanel(): void { this.rightPanelActive = true; }
  deactivateRightPanel(): void { this.rightPanelActive = false; }

  getUsers(): { name: string; email: string; password: string }[] {
    const stored = localStorage.getItem('cropguard_users');
    return stored ? JSON.parse(stored) : [];
  }

  saveUsers(users: { name: string; email: string; password: string }[]) {
    localStorage.setItem('cropguard_users', JSON.stringify(users));
  }

  checkSignUp(): void {
    if (!this.signupName || !this.signupEmail || !this.signupPassword) {
      this.signupError = 'Please fill in all fields.';
      return;
    }
    const users = this.getUsers();
    if (users.find(u => u.email === this.signupEmail)) {
      this.signupError = 'An account with this email already exists.';
      return;
    }
    users.push({ name: this.signupName, email: this.signupEmail, password: this.signupPassword });
    this.saveUsers(users);
    this.signupError = '';
    this.signupSuccess = 'Account created! You can now sign in.';
    this.signupName = '';
    this.signupEmail = '';
    this.signupPassword = '';
    this.deactivateRightPanel();
  }

  checkLogin(): void {
    const users = this.getUsers();
    const user = users.find(u => u.email === this.loginEmail && u.password === this.loginPassword);
    if (user) {
      this.loginError = '';
      this.loginSuccess.emit({ name: user.name, email: user.email });
    } else {
      this.loginError = 'Incorrect email or password.';
    }
  }
}

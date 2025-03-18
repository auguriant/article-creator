
// Simple authentication service
class AuthService {
  private static instance: AuthService;
  private isAuthenticated: boolean = false;
  
  // Hardcoded credentials (in a real app, this would be stored securely)
  private readonly ADMIN_USERNAME = "onur";
  private readonly ADMIN_PASSWORD = "1123581321aB";
  
  private constructor() {
    // Check if user is already logged in (from localStorage)
    const authStatus = localStorage.getItem('auth_status');
    this.isAuthenticated = authStatus === 'true';
  }
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  public login(username: string, password: string): boolean {
    if (username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD) {
      this.isAuthenticated = true;
      localStorage.setItem('auth_status', 'true');
      return true;
    }
    return false;
  }
  
  public logout(): void {
    this.isAuthenticated = false;
    localStorage.setItem('auth_status', 'false');
  }
  
  public isLoggedIn(): boolean {
    return this.isAuthenticated;
  }
}

export default AuthService;

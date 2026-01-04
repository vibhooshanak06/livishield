import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Shield, LogOut, User, Mail, Phone, Calendar } from "lucide-react";
import "../styles/dashboard.css";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen dashboard-background">
      <header className="border-b dashboard-gradient-header">
        <nav className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">LiviShield</h1>
            <Badge className="ml-2 bg-white/20 text-white border-white/30 backdrop-blur-sm">Authenticated</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-white/80">Welcome, {user?.firstName || "User"}!</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </nav>
      </header>

      <main className="container py-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="dashboard-card-hover md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-liveshield-200" />
                <span>User Profile</span>
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-liveshield-300" />
                  <div>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-liveshield-300" />
                  <div>
                    <p className="font-medium">{user?.email}</p>
                    <p className="text-sm text-muted-foreground">Email Address</p>
                  </div>
                </div>

                {user?.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-liveshield-300" />
                    <div>
                      <p className="font-medium">{user.phone}</p>
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-liveshield-300" />
                  <div>
                    <p className="font-medium">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</p>
                    <p className="text-sm text-muted-foreground">Account Role</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-liveshield-200" />
                <span>Account Status</span>
              </CardTitle>
              <CardDescription>Your account verification status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-liveshield-100 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-liveshield-400" />
                  </div>
                </div>
                
                <div>
                  <Badge className="bg-liveshield-100 text-liveshield-400 border-liveshield-200">
                    {user?.isVerified ? 'Verified' : 'Pending Verification'}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {user?.isVerified 
                    ? 'Your account is fully verified and active.'
                    : 'Please check your email to verify your account.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="dashboard-card-hover">
            <CardHeader>
              <CardTitle>Welcome to LiviShield</CardTitle>
              <CardDescription>Your authentication system is working perfectly!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-16 w-16 text-liveshield-200 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Authentication Successful</h3>
                <p className="text-muted-foreground mb-6">
                  You have successfully logged into the LiviShield platform. This dashboard demonstrates 
                  the working authentication and authorization system.
                </p>
                <div className="flex justify-center space-x-4">
                  <Badge variant="outline" className="border-liveshield-200 text-liveshield-300">
                    JWT Authentication
                  </Badge>
                  <Badge variant="outline" className="border-liveshield-200 text-liveshield-300">
                    MySQL Database
                  </Badge>
                  <Badge variant="outline" className="border-liveshield-200 text-liveshield-300">
                    Secure Routes
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
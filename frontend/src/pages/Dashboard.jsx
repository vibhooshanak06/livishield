import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Shield, LogOut, User, Mail, Phone, Calendar } from "lucide-react";
import "../styles/dashboard.css";
import "../styles/theme.css";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen livishield-section-light">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold livishield-text-primary mb-2">Dashboard</h1>
          <p className="livishield-text-secondary">Welcome back, {user?.firstName || "User"}! Here's your account overview.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2 livishield-hover-lift livishield-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 livishield-icon-accent" />
                <span className="livishield-text-primary">User Profile</span>
              </CardTitle>
              <CardDescription className="livishield-text-secondary">Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 livishield-icon-accent" />
                  <div>
                    <p className="font-medium livishield-text-primary">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm livishield-text-secondary">Full Name</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 livishield-icon-accent" />
                  <div>
                    <p className="font-medium livishield-text-primary">{user?.email}</p>
                    <p className="text-sm livishield-text-secondary">Email Address</p>
                  </div>
                </div>

                {user?.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 livishield-icon-accent" />
                    <div>
                      <p className="font-medium livishield-text-primary">{user.phone}</p>
                      <p className="text-sm livishield-text-secondary">Phone Number</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 livishield-icon-accent" />
                  <div>
                    <p className="font-medium livishield-text-primary">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</p>
                    <p className="text-sm livishield-text-secondary">Account Role</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="livishield-hover-lift livishield-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 livishield-icon-accent" />
                <span className="livishield-text-primary">Account Status</span>
              </CardTitle>
              <CardDescription className="livishield-text-secondary">Your account verification status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full livishield-bg-light flex items-center justify-center">
                    <Shield className="h-8 w-8 livishield-icon-accent" />
                  </div>
                </div>
                
                <div>
                  <Badge className={`${user?.isVerified ? 'livishield-badge-primary' : 'bg-yellow-100 text-yellow-800'}`}>
                    {user?.isVerified ? 'Verified' : 'Pending Verification'}
                  </Badge>
                </div>
                
                <p className="text-sm livishield-text-secondary">
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
          <Card className="livishield-hover-lift livishield-card">
            <CardHeader>
              <CardTitle className="livishield-text-primary">Welcome to LiviShield Dashboard</CardTitle>
              <CardDescription className="livishield-text-secondary">Your insurance management center</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-16 w-16 livishield-icon-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 livishield-text-primary">Dashboard Overview</h3>
                <p className="livishield-text-secondary mb-6">
                  Manage your insurance policies, view claims, and access important documents 
                  all from your personalized dashboard.
                </p>
                <div className="flex justify-center space-x-4">
                  <Badge variant="outline" className="livishield-badge-secondary">
                    Policy Management
                  </Badge>
                  <Badge variant="outline" className="livishield-badge-secondary">
                    Claims Tracking
                  </Badge>
                  <Badge variant="outline" className="livishield-badge-secondary">
                    Document Access
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
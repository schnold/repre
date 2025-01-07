// src/app/(auth)/layout.tsx
export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex">
          {/* Left side - Auth Form */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
            <div className="w-full max-w-sm">
              {children}
            </div>
          </div>
          
          {/* Right side - Image */}
          <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-muted">
            <div className="relative w-full max-w-2xl">
              {/* We'll add a decorative image here later */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background backdrop-blur-3xl rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }
export default function LandingPage() {
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Representation Plan App</h1>
        <p>This is a system for managing teachers, lessons, and substitutions.</p>
  
        <div className="mt-4 space-y-2">
          <p>- <strong>Manage Teachers:</strong> Click “Teachers” in the sidebar to add/edit teacher info.</p>
          <p>- <strong>Calendar View:</strong> Create or edit lessons, assign a teacher, and set a substitute if needed.</p>
          <p>- <strong>Substitution Overview:</strong> Visit “Representation” to see all substitutions at a glance.</p>
        </div>
      </div>
    );
  }
  
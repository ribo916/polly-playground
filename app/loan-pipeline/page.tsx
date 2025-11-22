import CreateLoanButton from "./components/CreateLoanButton";

export default function Page() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Loan Pipeline
          </h1>
          <p 
            className="text-sm"
            style={{ color: "var(--muted)" }}
          >
            Manage and track your loan pipeline workflow
          </p>
        </div>
        <CreateLoanButton />
      </div>

      <div 
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: "var(--panel)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow)",
        }}
      >
        <p 
          className="text-sm"
          style={{ color: "var(--foreground-secondary)" }}
        >
          Your loan pipeline and workflow overview will appear here.
        </p>
      </div>
    </div>
  );
}

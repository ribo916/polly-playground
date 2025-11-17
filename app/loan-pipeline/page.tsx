import CreateLoanButton from "./components/CreateLoanButton";

export default function Page() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Loan Pipeline</h2>
        <CreateLoanButton />
      </div>

      <p className="text-gray-500 dark:text-gray-400">
        This will show your loan pipeline and workflow overview.
      </p>
    </div>
  );
}

export default function Header() {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Logout</button>
    </header>
  );
}

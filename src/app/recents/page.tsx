import { RecentVideoList } from "@/components/RecentVideoList";

export default function RecentsPage(): JSX.Element {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Recent Videos</h1>
      <div className="flex-grow flex items-center justify-center">
        <RecentVideoList />
      </div>
    </div>
  );
}
